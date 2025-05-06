from pydantic import BaseModel
from app.models.user_common import UserRole
from typing import Optional


class LoginForm(BaseModel):
    """用户登录表单模型"""
    username: str
    password: str
    role: UserRole


class Token(BaseModel):
    """登录成功后返回的令牌模型"""
    access_token: str
    token_type: str
    user_id: int
    role: str
    username: str


class TokenPayload(BaseModel):
    """JWT令牌负载数据模型"""
    sub: str
    id: int
    role: str
    exp: Optional[int] = None