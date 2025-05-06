from fastapi import APIRouter
from app.routers import auth


# 主路由
api_router = APIRouter()

# 子路由
api_router.include_router(auth.router, prefix="/auth")