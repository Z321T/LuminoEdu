from fastapi import APIRouter
from app.routers import auth,exercise_generator


# 主路由
api_router = APIRouter()

# 子路由
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(exercise_generator.router, prefix="/generator_exercise")