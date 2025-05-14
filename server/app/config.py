# Description: fastapi配置文件
import os
import secrets
from pathlib import Path

# 后端项目基础路径server/
SERVER_DIR = Path(__file__).resolve().parent.parent

# 密钥文件路径
SECRET_KEY_FILE = SERVER_DIR / ".secret_key"

# JWT相关配置
def get_or_create_secret_key():
    """
        获取或创建JWT密钥:
        1. 尝试从secrets.json文件读取
        2. 如果文件不存在，生成新密钥并保存到文件
    """
    # 尝试从文件读取
    try:
        if SECRET_KEY_FILE.exists():
            with open(SECRET_KEY_FILE, "r") as f:
                return f.read().strip()
    except Exception:
        pass

    # 生成新密钥并保存
    new_key = secrets.token_urlsafe(32)
    try:
        # 确保父目录存在
        SECRET_KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
        # 写入文件时设置适当的权限
        with open(SECRET_KEY_FILE, "w") as f:
            f.write(new_key)
        # 设置文件权限为仅所有者可读写
        os.chmod(SECRET_KEY_FILE, 0o600)
    except Exception as e:
        print(f"警告：无法保存密钥到文件: {e}")

    return new_key

SECRET_KEY = get_or_create_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 0.5小时过期

# 习题生成配置
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "sk-0eda12ea690b402b9f6e7a702504280d")

# 文件存储路径
MEDIA_ROOT = SERVER_DIR / "app" / "documents"
