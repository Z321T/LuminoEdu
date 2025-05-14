from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Optional

from app.schemas.exercise_generator import ExerciseGenerateRequest
from app.services.exercise_generator import ExerciseGenerator

router = APIRouter(tags=["习题自动化生成"])


@router.post("/generate")
async def generate_exercises(request: ExerciseGenerateRequest):
    """
    生成习题并返回文件路径

    习题类型枚举(types):
    1 = 选择题
    2 = 填空题
    3 = 简答题

    """
    generator = ExerciseGenerator()
    result = await generator.generate_exercises(
        content=request.content,
        title=request.title,
        count=request.count,
        types=request.types
    )

    return {
        "file_path": result["file_path"],
        "exercise_count": len(result["exercises_data"]),
        "exercises_data": result["exercises_data"]
    }


@router.get("/download")
async def download_exercise_file(file_path: str):
    """下载生成的习题文件"""
    path = Path(file_path)

    if not path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    filename = path.name
    return FileResponse(
        path=str(path),
        filename=filename,
        media_type="application/octet-stream"
    )


@router.get("/list")
async def list_generated_exercises(limit: int = 50, title_filter: Optional[str] = None):
    """
    列出最近生成的习题文件

    参数:
        limit: 返回的最大文件数量
        title_filter: 可选的标题过滤条件
    """
    from app.config import MEDIA_ROOT

    # 获取生成的习题文件目录
    exercises_dir = Path(MEDIA_ROOT) / "exercises" / "generated"

    if not exercises_dir.exists():
        return {"exercises": []}

    # 列出目录中的所有md文件
    files = list(exercises_dir.glob("*.md"))

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
            "path": str(file),
            "created_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
            "size_kb": round(file.stat().st_size / 1024, 2)  # 文件大小（KB）
        })

    return {"exercises": result}


@router.delete("/delete")
async def delete_exercise_file(file_path: str):
    """删除生成的习题文件"""
    from app.config import MEDIA_ROOT

    path = Path(file_path)
    exercises_dir = Path(MEDIA_ROOT) / "exercises" / "generated"

    # 安全检查：确保文件在生成目录内
    if not str(path).startswith(str(exercises_dir)):
        raise HTTPException(status_code=400, detail="无效的文件路径")

    if not path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        path.unlink()
        return {"message": "文件已成功删除"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")