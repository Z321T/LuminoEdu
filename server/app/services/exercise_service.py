from typing import List, Dict, Any, Optional
from datetime import datetime


async def convert_exercises_to_models(
        exercises_data: List[Dict[str, Any]],
        course_id: int,
        teacher_id: int,
        assignment_id: Optional[int] = None
):
    """
    将习题数据转换为数据库模型实例

    参数:
        exercises_data: 习题数据列表
        course_id: 课程ID
        teacher_id: 教师ID
        assignment_id: 习题集ID（可选）

    返回:
        创建的习题模型实例列表
    """
    from app.models.course_exercise import CourseExercise, CourseExerciseAssignment
    from app.models.course import Course
    from app.models.teacher import Teacher

    # 获取课程和教师实例
    course = await Course.get(id=course_id)
    teacher = await Teacher.get(id=teacher_id)

    # 检查习题集是否存在，不存在则创建一个默认的
    if assignment_id:
        assignment = await CourseExerciseAssignment.get(id=assignment_id)
    else:
        # 创建默认习题集
        now = datetime.now()
        default_title = f"{course.name}自动生成习题集-{now.strftime('%Y%m%d%H%M')}"
        assignment = await CourseExerciseAssignment.create(
            title=default_title,
            description="由AI自动生成的习题集",
            total_score=100.0,  # 默认总分
            start_time=now,
            due_time=now.replace(day=now.day + 7),  # 默认一周后截止
            is_published=False,
            course=course,
            creator=teacher
        )

    # 创建习题记录
    exercises = []
    for data in exercises_data:
        exercise = await CourseExercise.create(
            title=data.get("title", "未命名习题"),
            content=data.get("content", ""),
            answer=data.get("answer", ""),
            explanation=data.get("explanation", ""),
            type=data.get("type", 1),
            options=data.get("options"),
            score=data.get("score", 10.0),  # 默认每题10分
            order=data.get("order", 0),  # 使用生成时设置的顺序
            assignment=assignment
        )
        exercises.append(exercise)

    return {
        "assignment": assignment,
        "exercises": exercises
    }


async def create_assignment_from_exercises(
        title: str,
        description: str,
        course_id: int,
        teacher_id: int,
        exercises_data: List[Dict[str, Any]],
        total_score: float = 100.0,
        start_time: datetime = None,
        due_time: datetime = None,
        is_published: bool = False
):
    """
    根据习题数据创建完整的习题集

    参数:
        title: 习题集标题
        description: 习题集描述
        course_id: 课程ID
        teacher_id: 教师ID
        exercises_data: 习题数据列表
        total_score: 总分
        start_time: 开始时间
        due_time: 截止时间
        is_published: 是否发布

    返回:
        创建的习题集
    """
    from app.models.course_exercise import CourseExerciseAssignment
    from app.models.course import Course
    from app.models.teacher import Teacher

    # 获取课程和教师实例
    course = await Course.get(id=course_id)
    teacher = await Teacher.get(id=teacher_id)

    # 设置默认时间
    now = datetime.now()
    if not start_time:
        start_time = now
    if not due_time:
        due_time = now.replace(day=now.day + 7)  # 一周后

    # 创建习题集
    assignment = await CourseExerciseAssignment.create(
        title=title,
        description=description,
        total_score=total_score,
        start_time=start_time,
        due_time=due_time,
        is_published=is_published,
        course=course,
        creator=teacher
    )

    # 转换习题数据
    result = await convert_exercises_to_models(
        exercises_data=exercises_data,
        course_id=course_id,
        teacher_id=teacher_id,
        assignment_id=assignment.id
    )

    return assignment