from typing import Any

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.schemas.auth import LoginForm, Token
from app.services.auth import login_for_access_token

router = APIRouter(tags=["登录认证"])

@router.post("/login", response_model=Token, description="用户登录接口，验证用户身份并返回JWT访问令牌")
async def login(form_data: LoginForm) -> Any:
    """
    用户登录接口，返回访问令牌
    """
    return await login_for_access_token(
        user_id=form_data.user_id,
        password=form_data.password,
        role=form_data.role
    )

@router.get("/me", description="获取当前登录用户信息")
async def read_users_me(current_user = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return {
        # 可以根据需要返回更多用户信息
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
    }