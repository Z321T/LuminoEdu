from tortoise.exceptions import IntegrityError

from app.core.logger import setup_logger
from app.models.course import Course
from app.schemas.teacher.course import CourseCreateRequest

# 创建课程服务的日志记录器
logger = setup_logger("course_management_service")


async def create_course(teacher_id: int, data: CourseCreateRequest) -> Course:
    """
    创建课程
    """
    logger.info(f"教师 {teacher_id} 正在创建课程: {data.name}")
    try:
        course = await Course.create(
            name=data.name,
            description=data.description,
            semester=data.semester,
            credit=data.credit,
            start_date=data.start_date,
            end_date=data.end_date,
            teacher_id=teacher_id
        )
        logger.info(f"课程创建成功: id={course.id}, name={course.name}, 教师={teacher_id}")
        return course
    except IntegrityError:
        logger.warning(f"课程创建失败，课程代码已存在: {data.course_code}")
        raise ValueError("课程代码已存在")
    except Exception as e:
        logger.error(f"课程创建失败: {str(e)}", exc_info=True)
        raise ValueError(f"课程创建失败: {str(e)}")