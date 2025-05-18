from fastapi import APIRouter, Depends
from app.routers import auth,exercise_generator
from app.core.auth import auth_teacher_user


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