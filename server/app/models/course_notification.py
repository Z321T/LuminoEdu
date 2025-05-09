from enum import IntEnum
from tortoise import fields, models


class NotificationType(IntEnum):
    """通知类型枚举"""
    GENERAL = 0      # 普通通知
    IMPORTANT = 1    # 重要通知
    ASSIGNMENT = 2   # 作业相关
    EXAM = 3         # 考试相关
    MATERIAL = 4     # 课程资料


class CourseNotification(models.Model):
    """课程通知模型"""
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200, description="通知标题")
    content = fields.TextField(description="通知内容")
    type = fields.IntEnumField(NotificationType, default=NotificationType.GENERAL, description="通知类型")
    
    # 关联课程
    course = fields.ForeignKeyField(
        "models.Course", related_name="course_notifications",
        on_delete=fields.CASCADE, description="所属课程"
    )

    # 发布者（教师）
    publisher = fields.ForeignKeyField(
        "models.Teacher", related_name="published_course_notifications",
        on_delete=fields.SET_NULL, null=True, description="发布者"
    )

    is_pinned = fields.BooleanField(default=False, description="是否置顶")
    publish_time = fields.DatetimeField(auto_now_add=True, description="发布时间")
    
    # 系统字段
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "course_notifications"
        table_description = "课程通知表"


class CourseNotificationRead(models.Model):
    """通知阅读状态表"""
    id = fields.IntField(pk=True)
    notification = fields.ForeignKeyField(
        "models.CourseNotification", related_name="read_records",
        on_delete=fields.CASCADE, description="关联课程通知"
    )
    student = fields.ForeignKeyField(
        "models.Student", related_name="notification_reads",
        on_delete=fields.CASCADE, description="学生"
    )
    read_at = fields.DatetimeField(auto_now_add=True, description="阅读时间")

    class Meta:
        table = "course_notification_reads"
        table_description = "课程通知阅读记录表"
        unique_together = (("notification", "student"),)
