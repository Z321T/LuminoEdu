from fastapi import APIRouter
from app.routers.teacher import exercise_generator, ppt_generator

# 创建教师专用路由
teacher_router = APIRouter(tags=["教师端"])

# 包含教师端练习生成器路由
teacher_router.include_router(
    exercise_generator.router,
    prefix="/exercise_generator",
)

# 包含教师端PPT生成器路由
teacher_router.include_router(
    ppt_generator.router,
    prefix="/ppt",
)

# 导出路由供主路由使用
router = teacher_router