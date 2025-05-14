import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from app.config import MEDIA_ROOT
from app.database import TORTOISE_ORM
from app.routers import api_router

# 将项目根目录添加到 Python 路径
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))


# 创建必要的目录结构
def setup_directories():
    """创建必要的目录结构，确保只创建一次"""
    # 定义需要创建的目录
    directories = [
        Path(MEDIA_ROOT),  # 基础媒体目录
        Path(MEDIA_ROOT) / "exercises" / "generated",  # 习题生成目录
    ]

    # 创建每个目录，使用exist_ok=True确保不会因目录已存在而报错
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"目录结构已检查: {directory}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 应用生命周期管理器
    """
    # 应用启动前的操作
    setup_directories()
    print("应用初始化: 目录结构已准备就绪")

    # 应用运行中
    yield

    # 应用关闭时的操作
    print("应用关闭中: 正在清理资源...")


# FastAPI 应用实例
app = FastAPI(
    title="LuminoEdu",
    description="--基于多模态大模型的数字化教学资源制作系统",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vue开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router)

# 注册tortoise-orm
register_tortoise(
    app=app,
    config=TORTOISE_ORM,
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", host="127.0.0.1", port=8000, reload=True)