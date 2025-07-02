from fastapi import APIRouter
from app.routers.teacher import exercise_generator, ppt_generator, course, course_material , course_notification

# 教师专用路由
teacher_router = APIRouter()

# 教师端练习生成器路由
teacher_router.include_router(
    exercise_generator.router,
    prefix="/exercise_generator",
)

# 教师端PPT生成器路由
teacher_router.include_router(
    ppt_generator.router,
    prefix="/ppt",
)

# 教师端课程管理路由
teacher_router.include_router(
    course.router,
    prefix="/course",
)

# 教师端课程资料管理路由
teacher_router.include_router(
    course_material.router,
    prefix="/course_material",
)

# 教师端课程通知管理路由
teacher_router.include_router(
    course_notification.router,
    prefix="/course_notification",
)

# 导出路由供主路由使用
router = teacher_router