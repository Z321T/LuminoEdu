from enum import IntEnum
from tortoise import fields, models


class ExerciseType(IntEnum):
    """习题类型枚举"""
    CHOICE = 1  # 选择题
    FILL_BLANK = 2  # 填空题
    SHORT_ANSWER = 3  # 简答题


class CourseExerciseAssignment(models.Model):
    """课程练习集模型"""
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200, description="作业标题")
    description = fields.TextField(null=True, description="作业说明")

    # 练习属性
    total_score = fields.FloatField(default=100.0, description="总分值")
    start_time = fields.DatetimeField(description="开始时间")
    due_time = fields.DatetimeField(description="截止时间")
    is_published = fields.BooleanField(default=False, description="是否已发布")

    # 关联课程
    course = fields.ForeignKeyField(
        "models.Course", related_name="exercise_assignments",
        on_delete=fields.CASCADE, description="所属课程"
    )

    # 创建者（教师）
    creator = fields.ForeignKeyField(
        "models.Teacher", related_name="created_assignments",
        on_delete=fields.SET_NULL, null=True, description="创建教师"
    )

    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "course_exercise_assignments"
        table_description = "课程练习集表"


class CourseExercise(models.Model):
    """课程练习习题模型"""
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200, description="习题标题")
    content = fields.TextField(description="习题内容")
    answer = fields.TextField(description="参考答案")
    explanation = fields.TextField(null=True, description="解析")
    type = fields.IntEnumField(ExerciseType, description="习题类型")

    # 分值
    score = fields.FloatField(default=0.0, description="分值")

    # 排序
    order = fields.IntField(default=0, description="题目顺序")

    # 存储选择题选项，JSON格式
    options = fields.JSONField(null=True, description="选择题选项")

    # 关联作业/练习集
    assignment = fields.ForeignKeyField(
        "models.CourseAssignment", related_name="exercises",
        on_delete=fields.CASCADE, description="所属作业"
    )

    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "course_exercises"
        table_description = "课程练习习题表"