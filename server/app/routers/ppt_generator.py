from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse

from app.core.dependencies import auth_teacher_user
from app.core.logger import setup_logger
from app.models.teacher import Teacher
from app.schemas.ppt_generator import PPTGenerationRequest, PPTGenerationResponse
from app.services.ppt_generator import generate_ppt, PPT_FILES_DIR

router = APIRouter(tags=["PPT自动化生成"])

logger = setup_logger("ppt_generator_api")


@router.post("/generate", response_model=PPTGenerationResponse)
async def generate_ppt_endpoint(
        request: PPTGenerationRequest,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    生成教学PPT的API端点
    """
    try:
        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 请求生成PPT: {request.title}")
        response = await generate_ppt(request, current_user.staff_id)
        return response
    except Exception as e:
        logger.error(f"PPT生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PPT生成失败: {str(e)}")


@router.get("/download/{file_name}")
async def download_ppt(
        file_name: str,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    下载生成的PPT文件
    """
    # 验证文件权限
    if not file_name.startswith(f"user_{current_user.staff_id}_"):
        logger.warning(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 尝试访问非自己的文件: {file_name}")
        raise HTTPException(status_code=403, detail="没有权限访问此文件")

    file_path = PPT_FILES_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 下载PPT文件: {file_name}")
    return FileResponse(
        path=str(file_path),
        filename=file_name,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


@router.get("/list")
async def list_ppt_files(current_user: Teacher = Depends(auth_teacher_user)):
    """
    列出当前用户可用的PPT文件
    """
    staff_id_pattern = f"user_{current_user.staff_id}_"

    files = []
    for file_path in PPT_FILES_DIR.glob("*.pptx"):
        # 只返回当前教师的文件
        if file_path.name.startswith(staff_id_pattern):
            files.append({
                "file_name": file_path.name,
                "size": file_path.stat().st_size,
                "created_at": file_path.stat().st_ctime
            })

    return {"files": files}