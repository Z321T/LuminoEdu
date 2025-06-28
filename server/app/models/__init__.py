# 导入所有模型
from .course import Course, CourseStudent
from .student import Student
from .teacher import Teacher
from .admin import Admin

# 导出所有模型
__all__ = [
    'Course',
    'CourseStudent',
    'Student',
    'Teacher',
    'Admin',
]
