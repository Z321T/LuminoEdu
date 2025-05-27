from fastapi import APIRouter, Depends
from app.routers import auth, teacher, user
from app.core.dependencies import auth_current_user, auth_teacher_user


# 主路由
api_router = APIRouter()

# 子路由
# 登录认证路由
api_router.include_router(
    auth.router,
    prefix="/auth"
)

# 教师端路由
api_router.include_router(
    teacher.router,
    prefix="/teacher",
    dependencies=[Depends(auth_teacher_user)]
)

# 用户个人中心路由
api_router.include_router(
    user.router,
    prefix="/user",
    dependencies=[Depends(auth_current_user)]
)
