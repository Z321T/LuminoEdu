import sys
from pathlib import Path

# 将项目根目录添加到 Python 路径
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))

# 其余代码...
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host="127.0.0.1", port=8000, reload=True)

