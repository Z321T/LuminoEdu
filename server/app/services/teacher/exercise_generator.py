import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import HTTPException
from openai import OpenAI

from app.config import DEEPSEEK_API_KEY, MEDIA_ROOT
from app.core.logger import setup_logger
from app.models.course_exercise import ExerciseType

# 设置日志
logger = setup_logger("exercise_generator_service")


class ExerciseGenerator:
    """习题生成器服务"""

    def __init__(self):
        # 配置AI客户端
        self.client = OpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com"
        )

        # 文件保存目录
        self.base_dir = Path(MEDIA_ROOT) / "exercises"
        self.json_dir = self.base_dir / "json"
        self.md_dir = self.base_dir / "md"
        # 创建必要的目录
        self.json_dir.mkdir(parents=True, exist_ok=True)
        self.md_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"习题生成器初始化完成，JSON目录: {self.json_dir}, Markdown目录: {self.md_dir}")

    async def generate_exercises(
        self,
        content: str,
        staff_id: str,
        title: str = "未命名习题集",
        count: int = 5,
        types: List[ExerciseType] = None,
    ) -> Dict[str, Any]:
        """
        根据内容生成习题并保存为Markdown和JSON文件

        参数:
            content: 用于生成习题的内容
            staff_id: 教师工号
            title: 习题集标题
            count: 生成习题数量
            types: 习题类型列表

        返回:
            包含文件路径和习题数据的字典
        """
        if not types:
            types = [ExerciseType.CHOICE, ExerciseType.FILL_BLANK]

        logger.info(f"教师(工号:{staff_id})开始生成习题: 标题={title}, 数量={count}, 类型={types}")

        # 构建提示词
        prompt = self._build_prompt(content, types, count)
        logger.debug("已构建提示词")

        try:
            # 调用 AI 模型
            response_text = await self._call_ai_api(prompt)

            # 解析响应
            exercises_data = self._parse_response(response_text)
            logger.info(f"成功生成 {len(exercises_data)} 道习题")

            # 为每道题设置默认的顺序值
            for i, exercise in enumerate(exercises_data):
                exercise["order"] = (i + 1) * 10

            # 生成文件存储路径
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"teacher_{staff_id}_{timestamp}_{title}"

            # 保存JSON文件
            json_path = self.json_dir / f"{filename}.json"
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(exercises_data, f, ensure_ascii=False, indent=2)
            logger.info(f"教师(工号:{staff_id})的习题JSON数据已保存: {json_path}")

            # 生成并保存Markdown文件
            md_content = self._generate_markdown(exercises_data, title)
            md_path = self.md_dir / f"{filename}.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content)
            logger.info(f"教师(工号:{staff_id})的习题Markdown文件已保存: {md_path}")

            return {
                "md_filename": md_path.name,
                "json_filename": json_path.name,
                "timestamp": timestamp,
                "title": title,
                "staff_id": staff_id,
                "exercises_count": len(exercises_data)
            }
        except Exception as e:
            logger.error(f"习题生成过程中发生错误: {str(e)}")
            raise

    def _build_prompt(self, content: str, types: List[ExerciseType], count: int) -> str:
        """构建提示词"""
        types_desc = []
        for t in types:
            if t == ExerciseType.CHOICE:
                types_desc.append("选择题（包含4个选项）")
            elif t == ExerciseType.FILL_BLANK:
                types_desc.append("填空题")
            elif t == ExerciseType.SHORT_ANSWER:
                types_desc.append("简答题")

        type_str = "、".join(types_desc)
        logger.debug(f"构建提示词: {count}道{type_str}")

        return \
f"""
        请根据以下教学内容，生成{count}道{type_str}。每道题目需要包含：
        1. 题目标题
        2. 题目内容
        3. 正确答案
        4. 答案解析
        
        对于选择题，请提供4个选项（A、B、C、D）。
        
        教学内容：
        {content}
        
        请以JSON格式返回，格式如下：
        [
          {{
            "title": "题目标题",
            "content": "题目内容",
            "type": 1,  // 1=选择题, 2=填空题, 3=简答题
            "options": ["选项A", "选项B", "选项C", "选项D"],  // 选择题必须
            "answer": "正确答案",
            "explanation": "解析说明"
          }}
          // 其他题目...
        ]
        
        只返回JSON数据，不要有其他说明文字。
"""

    async def _call_ai_api(self, prompt: str) -> str:
        """调用AI API"""
        logger.info("开始调用AI API生成习题")
        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一位专业的教育教学助手，善于创建高质量的教学习题。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=8000,
                stream=False
            )
            logger.info("AI API调用成功")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Deepseek API请求失败: {str(e)}")
            return "[]"

    def _parse_response(self, response: str) -> List[Dict[str, Any]]:
        """解析API响应为习题数据"""
        logger.info("开始解析API返回的习题数据")
        try:
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                result = json.loads(json_str)
                logger.info(f"成功解析习题数据，共 {len(result)} 条记录")
                return result

            logger.warning("未找到有效的JSON数据格式")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"解析习题数据失败: {str(e)}\n内容: {response[:200]}...")
            return []

    def _generate_markdown(self, exercises_data: List[Dict[str, Any]], course_name: str) -> str:
        """生成Markdown格式的习题内容"""
        logger.info(f"开始生成Markdown格式习题，课程: {course_name}")
        md_lines = [
            f"# {course_name} - 习题集",
            f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "\n## 习题列表\n"
        ]

        for i, exercise in enumerate(exercises_data, 1):
            exercise_type = "选择题" if exercise.get("type") == 1 else "填空题" if exercise.get("type") == 2 else "简答题"

            md_lines.append(f"### {i}. {exercise.get('title', f'习题{i}')} ({exercise_type})")
            md_lines.append(f"\n**题目内容**: {exercise.get('content', '')}")

            # 添加选项（如果是选择题）
            if exercise.get("type") == 1 and exercise.get("options"):
                md_lines.append("\n**选项**:")
                for j, option in enumerate(exercise.get("options", []), 0):
                    option_letter = chr(65 + j)  # A, B, C, D...
                    md_lines.append(f"- {option_letter}. {option}")

            # 添加答案和解析（放在分隔线后，方便教师审核时查看）
            md_lines.append("\n<details>")
            md_lines.append("<summary>查看参考答案</summary>")
            md_lines.append(f"\n**答案**: {exercise.get('answer', '')}")
            if exercise.get("explanation"):
                md_lines.append(f"\n**解析**: {exercise.get('explanation', '')}")
            md_lines.append("</details>")
            md_lines.append("\n---\n")

        logger.info("Markdown格式习题内容生成完成")
        return "\n".join(md_lines)


async def get_exercise_file_content_service(file_name: str, staff_id: str) -> str:
    """
    获取习题文件的Markdown内容

    Args:
        file_name: 文件名
        staff_id: 教师工号

    Returns:
        文件内容字符串

    Raises:
        HTTPException: 当权限验证失败或文件不存在时
    """
    # 检查是否为当前教师的文件
    if not file_name.startswith(f"teacher_{staff_id}_"):
        logger.warning(f"权限拒绝: 教师{staff_id}尝试访问非本人文件: {file_name}")
        raise HTTPException(status_code=403, detail="您无权访问此文件")

    # 检查文件类型
    if not file_name.endswith(".md"):
        logger.warning(f"文件类型错误: 文件不是 Markdown 格式 '{file_name}'")
        raise HTTPException(status_code=400, detail="只支持查看 Markdown 格式的文件")

    # 构建文件路径
    file_path = Path(MEDIA_ROOT) / "exercises" / "md" / file_name

    if not file_path.exists():
        logger.warning(f"文件读取失败: 文件不存在 '{file_path}'")
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        with file_path.open("r", encoding="utf-8") as f:
            content = f.read()
        return content
    except Exception as e:
        logger.error(f"读取习题文件失败: {str(e)}", exc_info=True)
        raise Exception(f"读取文件失败: {str(e)}")


async def download_exercise_file_service(file_name: str, staff_id: str) -> Path:
    """
    处理习题文件下载的权限验证和文件检查

    Args:
        file_name: 文件名
        staff_id: 教师工号

    Returns:
        文件路径对象

    Raises:
        HTTPException: 当权限验证失败或文件不存在时
    """
    # 验证文件权限
    if not file_name.startswith(f"teacher_{staff_id}_"):
        logger.warning(f"权限拒绝: 教师{staff_id}尝试下载非本人文件: {file_name}")
        raise HTTPException(status_code=403, detail="您无权下载此文件")

    # 根据文件扩展名判断文件类型和目录
    if file_name.endswith(".md"):
        file_path = Path(MEDIA_ROOT) / "exercises" / "md" / file_name
    elif file_name.endswith(".json"):
        file_path = Path(MEDIA_ROOT) / "exercises" / "json" / file_name
    else:
        raise HTTPException(status_code=400, detail="不支持的文件类型")

    if not file_path.exists():
        logger.warning(f"文件下载失败: 文件不存在 '{file_path}'")
        raise HTTPException(status_code=404, detail="文件不存在")

    return file_path


async def list_generated_exercises_service(staff_id: str, limit: int = 50, title_filter: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    列出教师生成的习题文件

    Args:
        staff_id: 教师工号
        limit: 返回的最大文件数量
        title_filter: 可选的标题过滤条件

    Returns:
        包含习题文件列表的字典
    """
    # 获取生成的习题文件目录
    md_dir = Path(MEDIA_ROOT) / "exercises" / "md"

    if not md_dir.exists():
        logger.warning(f"教师(工号:{staff_id})查询习题目录不存在: {md_dir}")
        return {"exercises": []}

    # 只列出当前教师的文件
    files = list(md_dir.glob(f"teacher_{staff_id}_*.md"))

    # 如果有标题过滤，应用过滤条件
    if title_filter:
        files = [f for f in files if title_filter.lower() in f.name.lower()]

    # 按修改时间排序并限制数量
    files = sorted(
        files,
        key=lambda x: x.stat().st_mtime,
        reverse=True
    )[:limit]

    # 转换为简单格式
    result = []
    for file in files:
        result.append({
            "filename": file.name,
            "created_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
            "size_kb": round(file.stat().st_size / 1024, 2)  # 文件大小（KB）
        })

    return {"exercises": result}


async def delete_exercise_file_service(file_name: str, staff_id: str) -> None:
    """
    删除习题文件，包含权限验证

    Args:
        file_name: 文件名
        staff_id: 教师工号

    Raises:
        HTTPException: 当权限验证失败或文件不存在时
    """
    # 检查是否为当前教师的文件
    if not file_name.startswith(f"teacher_{staff_id}_"):
        logger.warning(f"权限拒绝: 教师{staff_id}尝试删除非本人文件: {file_name}")
        raise HTTPException(status_code=403, detail="您无权删除此文件")

    # 构建文件路径
    if file_name.endswith(".md"):
        file_path = Path(MEDIA_ROOT) / "exercises" / "md" / file_name
        json_file_name = file_name[:-3] + ".json"
        json_file_path = Path(MEDIA_ROOT) / "exercises" / "json" / json_file_name
    else:
        raise HTTPException(status_code=400, detail="不支持的文件类型")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        file_path.unlink()
        logger.info(f"md文件已删除: {file_path}")
        if json_file_path and json_file_path.exists():
            json_file_path.unlink()
            logger.info(f"关联JSON文件已删除: {json_file_path}")
    except Exception as e:
        logger.error(f"删除文件失败: {str(e)}")
        raise Exception(f"删除文件失败: {str(e)}")