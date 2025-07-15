# 导入所有模型
from .course import Course_th, CourseStudent
from .course_notification import CourseNotification, NotificationConfirmation
from .student import Student
from .teacher import Teacher
from .admin import Admin

# 导出所有模型
__all__ = [
    'Course_th',
    'CourseStudent',
    'CourseNotification',
    'Student',
    'Teacher',
    'Admin',
]
