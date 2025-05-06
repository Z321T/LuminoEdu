from datetime import timedelta
from typing import Union

from fastapi import HTTPException, status

from app.core.security import create_access_token
from app.models.admin import Admin
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user_common import UserRole

# 用户模型字典，用于根据角色快速获取对应的用户模型
USER_MODEL_MAP = {
    UserRole.STUDENT: Student,
    UserRole.TEACHER: Teacher,
    UserRole.ADMIN: Admin
}

async def authenticate_user(username: str, password: str, role: UserRole) -> Union[Student, Teacher, Admin]:
    """
    验证用户凭据并返回用户对象
    """
    # 检查角色有效性并获取对应的用户模型
    if role not in USER_MODEL_MAP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的用户角色"
        )

    user_model = USER_MODEL_MAP[role]

    # 查找用户
    user = await user_model.filter(username=username).first()

    # 验证用户是否存在及密码是否正确
    if not user or not user.verify_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 验证用户角色是否匹配
    if user.role != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"该用户不是{role}角色",
        )

    return user

async def login_for_access_token(username: str, password: str, role: UserRole):
    """
    登录并创建访问令牌
    """
    user = await authenticate_user(username, password, role)

    # 创建访问令牌
    access_token_expires = timedelta(minutes=60 * 24)  # 24小时
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    # 返回令牌和用户信息
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "username": user.username
    }

async def get_user_by_role_and_id(role: str, user_id: int):
    """
    根据角色和ID获取用户
    """
    try:
        role_enum = UserRole(role)
        if role_enum not in USER_MODEL_MAP:
            return None

        user_model = USER_MODEL_MAP[role_enum]
        return await user_model.filter(id=user_id).first()
    except ValueError:
        return None