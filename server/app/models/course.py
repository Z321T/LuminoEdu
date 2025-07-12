from enum import IntEnum

from tortoise import fields, models


class Course(models.Model):
    """课程模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="课程名称")
    description = fields.TextField(null=True, blank=True, description="课程描述")

    # 课程所属教师
    teacher = fields.ForeignKeyField(
        "models.Teacher", related_name="create_courses",
        on_delete=fields.CASCADE, description="课程教师"
    )

    # 课程学生
    students = fields.ManyToManyField(
        "models.Student", related_name="enrolled_courses",
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
        table = "course"
        table_description = "课程信息表"


class CourseStudent(models.Model):
    """课程-学生关联表"""
    id = fields.IntField(pk=True)
    course = fields.ForeignKeyField("models.Course", on_delete=fields.CASCADE, source_field="course_id")
    student = fields.ForeignKeyField("models.Student", on_delete=fields.CASCADE, source_field="student_id")

    # 额外的关联信息
    final_score = fields.FloatField(null=True, description="课程成绩")

    class Meta:
        table = "course_student"
        table_description = "课程-学生关联表"
        unique_together = (("course", "student"),)


class CourseMaterial(models.Model):
    """课程资料（文件/压缩包）模型"""
    id = fields.IntField(pk=True)
    course = fields.ForeignKeyField("models.Course", related_name="materials", on_delete=fields.CASCADE, description="所属课程")
    uploader = fields.ForeignKeyField("models.Teacher", related_name="uploaded_materials", on_delete=fields.SET_NULL, null=True, description="上传教师")
    file_name = fields.CharField(max_length=255, description="文件名")
    file_path = fields.CharField(max_length=512, description="文件存储路径")
    upload_time = fields.DatetimeField(auto_now_add=True, description="上传时间")
    description = fields.TextField(null=True, blank=True, description="资料描述")

    class Meta:
        table = "course_material"
        table_description = "课程资料表"