from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Optional

from app.schemas.exercise_generator import ExerciseGenerateRequest
from app.services.teacher.exercise_generator import ExerciseGenerator, get_exercise_file_content_service, \
    download_exercise_file_service, list_generated_exercises_service, delete_exercise_file_service
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
            "md_filename": result["md_filename"],
            "json_filename": result["json_filename"],
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
    try:
        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 请求查看习题文件内容: {file_name}")
        content = await get_exercise_file_content_service(file_name, current_user.staff_id)
        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 成功读取习题文件内容: {file_name}")
        return {"content": content}
    except HTTPException:
        # 传递服务层抛出的HTTP异常
        raise
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
    try:
        client_ip = req.client.host
        logger.info(f"教师{current_user.staff_id}文件下载请求: 文件='{file_name}', 请求IP={client_ip}")

        file_path = await download_exercise_file_service(file_name, current_user.staff_id)

        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 下载习题文件: {file_name}")
        return FileResponse(
            path=str(file_path),
            filename=file_name,
            media_type="application/octet-stream"
        )
    except HTTPException:
        # 传递服务层抛出的HTTP异常
        raise
    except Exception as e:
        logger.error(f"下载习题文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"下载习题文件失败: {str(e)}")


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
    try:
        logger.info(f"教师(工号:{current_user.staff_id})查询习题文件列表")
        result = await list_generated_exercises_service(current_user.staff_id, limit, title_filter)
        logger.info(f"教师(工号:{current_user.staff_id})已查询到习题文件 {len(result['exercises'])} 个")
        return result
    except Exception as e:
        logger.error(f"查询习题文件列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询习题文件列表失败: {str(e)}")


@router.delete("/delete/{file_name}")
async def delete_exercise_file(
        file_name: str,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """删除习题文件，仅允许教师删除自己的文件"""
    try:
        logger.info(f"教师(工号:{current_user.staff_id})请求删除文件: {file_name}")
        await delete_exercise_file_service(file_name, current_user.staff_id)
        logger.info(f"教师(工号:{current_user.staff_id})删除文件成功: {file_name}")
        return {"message": "文件已成功删除"}
    except HTTPException:
        # 传递服务层抛出的HTTP异常
        raise
    except Exception as e:
        logger.error(f"删除文件失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")