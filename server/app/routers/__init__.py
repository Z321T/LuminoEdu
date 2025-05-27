from fastapi import APIRouter, Depends
from app.routers import auth, exercise_generator, ppt_generator
from app.core.dependencies import auth_teacher_user


# 主路由
api_router = APIRouter()

# 子路由
# 登录认证路由
api_router.include_router(
    auth.router,
    prefix="/auth"
)
# 教师端练习生成器路由
api_router.include_router(
    exercise_generator.router,
    prefix="/generator_exercise",
    dependencies=[Depends(auth_teacher_user)]
)
# 教师端PPT生成器路由
api_router.include_router(
    ppt_generator.router,
    prefix="/generator_ppt",
    dependencies=[Depends(auth_teacher_user)]
)