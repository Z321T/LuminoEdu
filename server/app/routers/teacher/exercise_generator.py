from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Optional

from app.schemas.exercise_generator import ExerciseGenerateRequest
from app.services.teacher.exercise_generator import ExerciseGenerator
from app.core.logger import setup_logger
from app.core.dependencies import auth_teacher_user
from app.models.teacher import Teacher
from app.config import MEDIA_ROOT

# 创建专用于习题生成器的日志记录器
logger = setup_logger("exercise_generator_api")

router = APIRouter(tags=["教师端-习题生成"])


@router.post("/generate")
async def generate_exercises(
        request: ExerciseGenerateRequest,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    生成习题并返回文件名

    习题类型枚举(types):
    - 1 = 选择题
    - 2 = 填空题
    - 3 = 简答题

    """
    logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 请求生成习题: {request.title}")

    generator = ExerciseGenerator()
    try:
        result = await generator.generate_exercises(
            content=request.content,
            staff_id=current_user.staff_id,
            title=request.title,
            count=request.count,
            types=request.types
        )

        logger.info(f"习题生成成功: 标题='{request.title}', 生成数量={result["exercises_count"]}")

        return {
            "md_filename": Path(result["md_path"]).name,
            "json_filename": Path(result["json_path"]).name,
            "exercise_count": result["exercises_count"]
        }
    except Exception as e:
        logger.error(f"习题生成失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"习题生成失败: {str(e)}")



@router.get("/file_md_content/{file_name}")
async def get_exercise_file_content(
        file_name: str,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    获取习题文件的Markdown内容
    """
    staff_id = current_user.staff_id

    # 检查文件权限
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

        logger.info(f"教师 {current_user.username}(教工号:{staff_id}) 成功读取习题文件内容: {file_path.name}")

        return {
            "content": content
        }

    except Exception as e:
        logger.error(f"读取习题文件失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"读取文件失败: {str(e)}")




@router.get("/download/{file_name}")
async def download_exercise_file(
        file_name: str,
        req: Request,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """下载生成的习题文件"""
    staff_id = current_user.staff_id
    client_ip = req.client.host

    logger.info(f"教师{staff_id}文件下载请求: 文件='{file_name}', 请求IP={client_ip}")

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

    logger.info(f"教师 {current_user.username}(教工号:{staff_id}) 下载习题文件: {file_path.name}")
    return FileResponse(
        path=str(file_path),
        filename=file_name,
        media_type="application/octet-stream"
    )



@router.get("/list")
async def list_generated_exercises(
        limit: int = Query(default=50, description="返回的最大文件数量"),
        title_filter: Optional[str] = Query(default=None, description="可选的标题过滤条件，用于按文件名搜索"),
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    列出最近生成的习题文件

    参数:
    - limit: 返回的最大文件数量
    - title_filter: 可选的标题过滤条件
    - current_user: 当前请求的教师用户
    """
    staff_id = current_user.staff_id
    logger.info(f"教师(工号:{staff_id})查询习题文件列表")

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

    logger.info(f"教师(工号:{staff_id})已查询到习题文件 {len(files)} 个")

    # 转换为简单格式
    result = []
    for file in files:
        result.append({
            "filename": file.name,
            "created_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
            "size_kb": round(file.stat().st_size / 1024, 2)  # 文件大小（KB）
        })

    return {"exercises": result}



@router.delete("/delete/{file_name}")
async def delete_exercise_file(
        file_name: str,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """删除习题文件，仅允许教师删除自己的文件"""
    staff_id = current_user.staff_id

    # 检查是否为当前教师的文件
    if not file_name.startswith(f"teacher_{staff_id}_"):
        logger.warning(f"权限拒绝: 教师{staff_id}尝试删除非本人文件: {file_name}")
        raise HTTPException(status_code=403, detail="您无权删除此文件")

    # 构建文件路径
    if file_name.endswith(".md"):
        file_path = Path(MEDIA_ROOT) / "exercises" / "md" / file_name
    elif file_name.endswith(".json"):
        file_path = Path(MEDIA_ROOT) / "exercises" / "json" / file_name
    else:
        raise HTTPException(status_code=400, detail="不支持的文件类型")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        file_path.unlink()
        logger.info(f"教师(工号:{staff_id})删除文件成功: {file_path.name}")
        return {"message": "文件已成功删除"}
    except Exception as e:
        logger.error(f"删除文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")