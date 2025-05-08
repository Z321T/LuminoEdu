from enum import IntEnum

from tortoise import fields, models


class CourseStatus(IntEnum):
    """课程状态枚举"""
    NOT_STARTED = 0  # 未开始
    IN_PROGRESS = 1  # 正在进行
    COMPLETED = 2    # 已经结束


class Course(models.Model):
    """课程模型"""
    id = fields.IntField(pk=True)
    course_code = fields.CharField(max_length=20, unique=True, description="课程代码")
    name = fields.CharField(max_length=100, description="课程名称")
    description = fields.TextField(null=True, description="课程描述")
    status = fields.IntEnumField(CourseStatus, default=CourseStatus.NOT_STARTED, description="课程状态")

    # 课程所属教师
    teacher = fields.ForeignKeyField(
        "models.Teacher", related_name="courses",
        on_delete=fields.CASCADE, description="课程教师"
    )

    # 课程学生
    students = fields.ManyToManyField(
        "models.Student", related_name="courses",
        through="course_student", description="课程学生"
    )

    # 基础信息
    semester = fields.CharField(max_length=20, description="学期")
    credit = fields.FloatField(default=0, description="学分")
    start_date = fields.DateField(null=True, description="开始日期")
    end_date = fields.DateField(null=True, description="结束日期")

    # 系统字段
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "courses"
        table_description = "课程信息表"


class CourseStudent(models.Model):
    """课程-学生关联表"""
    id = fields.IntField(pk=True)
    course = fields.ForeignKeyField("models.Course", on_delete=fields.CASCADE)
    student = fields.ForeignKeyField("models.Student", on_delete=fields.CASCADE)

    # 额外的关联信息
    final_score = fields.FloatField(null=True, description="课程成绩")

    class Meta:
        table = "course_student"
        table_description = "课程-学生关联表"
        unique_together = (("course", "student"),)