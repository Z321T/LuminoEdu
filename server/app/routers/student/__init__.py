from fastapi import APIRouter

# 学生端专用路由
student_router = APIRouter(tags=["学生端"])

# 导出路由供主路由使用
router = student_router