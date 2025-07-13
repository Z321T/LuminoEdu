from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional

from app.core.dependencies import auth_student_user
from app.models.student import Student
from app.services.doc_vector.document_vectorization_svc import (
    process_and_store_document,
    list_teacher_documents,
    delete_document,
    get_document_info,
    search_documents
)
from app.core.logger import setup_logger

logger = setup_logger("stu_document_vectorization_api")

router = APIRouter(tags=["学生端-文档向量化"])


@router.post("/upload")
async def upload_student_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: Student = Depends(auth_student_user)
):
    """
    学生上传文档进行向量化
    """
    logger.info(f"学生 {current_user.username}(学号:{current_user.student_id}) 上传文档: {title}")

    try:
        result = await process_and_store_document(
            file=file,
            staff_id=current_user.student_id,  # 使用学号标识
            title=title
        )

        logger.info(f"学生文档处理成功: {title}, 学号: {current_user.student_id}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"学生文档上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"文档上传失败: {str(e)}")


@router.get("/list")
async def list_student_documents(
    current_user: Student = Depends(auth_student_user)
):
    """
    获取学生的文档列表
    """
    try:
        documents = await list_teacher_documents(current_user.student_id)
        logger.info(f"学生(学号:{current_user.student_id})查询到 {len(documents)} 个文档")
        return {"documents": documents}
    except Exception as e:
        logger.error(f"查询学生文档列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询文档列表失败: {str(e)}")


@router.get("/search")
async def search_student_documents(
    keyword: Optional[str] = None,
    limit: int = 20,
    current_user: Student = Depends(auth_student_user)
):
    """
    搜索学生的文档
    """
    try:
        documents = await search_documents(
            staff_id=current_user.student_id,
            keyword=keyword,
            limit=limit
        )
        return {"documents": documents}
    except Exception as e:
        logger.error(f"搜索学生文档失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"搜索文档失败: {str(e)}")


@router.delete("/delete/{document_id}")
async def delete_student_document(
    document_id: str,
    current_user: Student = Depends(auth_student_user)
):
    """
    删除学生的文档
    """
    try:
        success = await delete_document(current_user.student_id, document_id)
        if success:
            logger.info(f"学生(学号:{current_user.student_id})删除文档成功: {document_id}")
            return {"message": "文档删除成功"}
        else:
            raise HTTPException(status_code=404, detail="文档不存在")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除学生文档失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除文档失败: {str(e)}")


@router.get("/info/{document_id}")
async def get_student_document_info(
    document_id: str,
    current_user: Student = Depends(auth_student_user)
):
    """
    获取学生文档的详细信息
    """
    try:
        doc_info = await get_document_info(current_user.student_id, document_id)
        if doc_info:
            return doc_info
        else:
            raise HTTPException(status_code=404, detail="文档不存在")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取学生文档信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取文档信息失败: {str(e)}")