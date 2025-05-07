import sys
from pathlib import Path

from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from app.database import TORTOISE_ORM
from app.routers import api_router

# 将项目根目录添加到 Python 路径
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))


# FastAPI 应用实例
app = FastAPI(
    title="基于多模态大模型的数字化教学资源制作系统",
    description="使用FastAPI和Tortoise ORM构建的多模态大模型的数字化教学资源制作系统后端",
    version="1.0.0"
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

