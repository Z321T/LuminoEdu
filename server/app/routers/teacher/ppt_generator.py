from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse

from app.core.dependencies import auth_teacher_user
from app.core.logger import setup_logger
from app.models.teacher import Teacher
from app.schemas.ppt_generator import (
    PPTGenerationRequest, PPTGenerationResponse,
    PPTOutlineResponse, PPTGenerationFromOutlineRequest
)
from app.services.ppt_generator import (
    generate_ppt_outline, generate_ppt_from_outline,
    PPT_FILES_DIR, PPT_OUTLINE_DIR
)

router = APIRouter()

logger = setup_logger("ppt_generator_api")


@router.post("/generate_outline", response_model=PPTOutlineResponse)
async def generate_ppt_outline_endpoint(
        request: PPTGenerationRequest,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    生成PPT大纲 (第一步)
    """
    try:
        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 请求生成PPT大纲: {request.title}")
        response = await generate_ppt_outline(request, current_user.staff_id)
        return response
    except Exception as e:
        logger.error(f"PPT大纲生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PPT大纲生成失败: {str(e)}")


@router.get("/outlines")
async def list_ppt_outlines(current_user: Teacher = Depends(auth_teacher_user)):
    """
    列出当前教师的所有PPT大纲
    """
    staff_id = current_user.staff_id
    logger.info(f"教师 {current_user.username}(教工号:{staff_id}) 请求查看所有PPT大纲")

    outlines = []

    for file_path in PPT_OUTLINE_DIR.glob(f"outline_{staff_id}_*.md"):
        try:
            filename = file_path.name
            base_name = filename.rsplit('.', 1)[0]
            parts = base_name.split('_')

            # 提取文件名中的时间戳
            if len(parts) >= 3:
                timestamp = parts[2]
                title = parts[4]
            else:
                # 如果文件名格式不符合预期
                timestamp = ""
                title = '未知标题'

            # 读取文件内容
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read(50)  # 只读取前50个字符用于预览

            outlines.append({
                "file_path": file_path,
                "title": title,
                "created_at": timestamp,
                "preview": content[:50] + ("..." if len(content) > 50 else ""),
            })
        except Exception as e:
            logger.error(f"处理大纲文件 {file_path.name} 失败: {str(e)}")
            continue

    return {"outlines": outlines}


@router.post("/generate_from_outline", response_model=PPTGenerationResponse)
async def generate_ppt_from_outline_endpoint(
        request: PPTGenerationFromOutlineRequest,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    从修改后的大纲生成PPT (第二步)
    """
    try:
        logger.info(f"教师 {current_user.username}(教工号:{current_user.staff_id}) 从大纲生成PPT，请求ID: {request.request_id}")
        response = await generate_ppt_from_outline(request, current_user.staff_id)
        return response
    except Exception as e:
        logger.error(f"从大纲生成PPT失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"从大纲生成PPT失败: {str(e)}")


@router.get("/list_ppt")
async def list_ppt_files(current_user: Teacher = Depends(auth_teacher_user)):
    """
    列出当前用户可用的PPT文件
    """
    staff_id_pattern = f"teacher_{current_user.staff_id}_"

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


@router.get("/download/{file_name}")
async def download_ppt(
        file_name: str,
        current_user: Teacher = Depends(auth_teacher_user)
):
    """
    下载生成的PPT文件
    """
    # 验证文件权限
    if not file_name.startswith(f"teacher_{current_user.staff_id}_"):
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
