# 导入所有模型
from .course import Course, CourseStudent, CourseStatus
from .student import Student
from .teacher import Teacher
from .admin import Admin
from .course_notification import CourseNotification, CourseNotificationRead, NotificationType

# 导出所有模型
__all__ = [
    'Course', 'CourseStudent', 'CourseStatus',
    'Student',
    'Teacher',
    'Admin',
    'CourseNotification', 'CourseNotificationRead', 'NotificationType'
]
