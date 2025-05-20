from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import auth_current_user
from app.schemas.auth import LoginForm, Token
from app.services.auth import login_for_access_token
from app.models.user_common import UserRole

router = APIRouter(tags=["登录认证"])

@router.post("/login", response_model=Token, description="用户登录接口，根据ID前缀自动识别用户类型，验证用户身份并返回JWT访问令牌")
async def login(form_data: LoginForm):
    """
    用户登录接口，返回访问令牌

    - 学生ID应以S开头，如S12345
    - 教师ID应以T开头，如T67890
    - 管理员ID应以A开头，如A00001
    """
    return await login_for_access_token(
        user_id=form_data.user_id,
        password=form_data.password,
    )

@router.post("/token", response_model=Token)
async def login_oauth(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2标准登录端点，用于Swagger UI测试"""
    return await login_for_access_token(
        user_id=form_data.username,  # OAuth2表单使用username字段
        password=form_data.password,
    )

@router.get("/user", description="获取当前登录用户信息")
async def read_users_me(current_user = Depends(auth_current_user)):
    """获取当前登录用户信息，根据用户角色返回不同的详细信息"""
    # 基础信息（所有角色共有）
    user_info = {
        "username": current_user.username,
        "role": current_user.role,
    }

    # 根据角色添加额外信息
    if current_user.role == UserRole.STUDENT:
        user_info.update({
            "student_id": current_user.student_id,
            "college": current_user.college,
            "major": current_user.major,
            "grade": current_user.grade,
            "enrollment_year": current_user.enrollment_year,
            "intro": current_user.intro,
            "contact_email": current_user.contact_email
        })
    elif current_user.role == UserRole.TEACHER:
        user_info.update({
            "staff_id": current_user.staff_id,
            "department": current_user.department,
            "expertise": current_user.expertise,
            "intro": current_user.intro,
            "contact_email": current_user.contact_email,
            "office_location": current_user.office_location
        })
    elif current_user.role == UserRole.ADMIN:
        user_info.update({
            "admin_id": current_user.admin_id,
            "permissions": current_user.permissions
        })

    return user_info