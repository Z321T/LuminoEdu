import pandas as pd
import io
from fastapi import UploadFile, HTTPException, status
from app.models.student import Student
from app.models.teacher import Teacher
from app.schemas.user_create import BatchUserCreateResponse, UserCreateResult
from app.core.logger import setup_logger
from tortoise.exceptions import IntegrityError
from datetime import datetime

# 设置日志
logger = setup_logger("user_create")

async def create_students(file: UploadFile) -> BatchUserCreateResponse:
    """
    从Excel文件创建学生用户
    """
    logger.info(f"开始批量创建学生用户，文件名: {file.filename}")

    if not file.filename.endswith(('.xls', '.xlsx')):
        logger.warning(f"上传的文件格式错误: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="上传文件必须是Excel格式(.xls或.xlsx)"
        )

    try:
        # 读取Excel文件
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        logger.info(f"成功读取Excel文件，共{len(df)}条记录")

        # 验证必要的列是否存在
        required_columns = ['姓名', '密码', '学号', '学院', '专业', '年级', '入学年份']
        for column in required_columns:
            if column not in df.columns:
                logger.error(f"Excel文件缺少必要列: {column}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Excel文件缺少必要的列: {column}"
                )

        # 处理结果
        success_count = 0
        failed_records = []

        # 处理每一行数据
        for _, row in df.iterrows():
            try:
                # 创建学生记录
                student = Student(
                    username=row['姓名'],
                    student_id=row['学号'],
                    college=row['学院'],
                    major=row['专业'],
                    grade=row['年级'],
                    enrollment_year=int(row['入学年份'])
                )

                # 设置密码
                student.set_password(str(row['密码']))

                # 保存到数据库
                await student.save()
                success_count += 1
                logger.info(f"成功创建学生用户 - 用户名: {row['姓名']}, 学号: {row['学号']}")

            except IntegrityError as e:
                error_msg = "用户名或学号已存在"
                logger.warning(f"创建学生用户失败 - 用户名: {row['姓名']}, 学号: {row['学号']}, 错误: {error_msg}")
                # 处理数据库完整性错误（如重复的用户名或学号）
                failed_records.append(UserCreateResult(
                    username=row['姓名'],
                    success=False,
                    error="用户名或学号已存在"
                ))
            except Exception as e:
                error_msg = str(e)
                logger.error(f"创建学生用户失败 - 用户名: {row['姓名']}, 学号: {row['学号']}, 错误: {error_msg}")
                # 处理其他错误
                failed_records.append(UserCreateResult(
                    username=row['姓名'],
                    success=False,
                    error=str(e)
                ))

        result = BatchUserCreateResponse(
            total=len(df),
            success_count=success_count,
            failed_count=len(failed_records),
            failed_records=failed_records
        )
        logger.info(f"学生批量创建完成 - 总数: {result.total}, 成功: {result.success_count}, 失败: {result.failed_count}")
        return result

    except Exception as e:
        error_msg = str(e)
        logger.error(f"处理Excel文件失败: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"处理Excel文件失败: {str(e)}"
        )

async def create_teachers(file: UploadFile) -> BatchUserCreateResponse:
    """
    从Excel文件创建教师用户
    """
    logger.info(f"开始批量创建教师用户，文件名: {file.filename}")

    if not file.filename.endswith(('.xls', '.xlsx')):
        logger.warning(f"上传的文件格式错误: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="上传文件必须是Excel格式(.xls或.xlsx)"
        )

    try:
        # 读取Excel文件
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        logger.info(f"成功读取Excel文件，共{len(df)}条记录")

        # 验证必要的列是否存在
        required_columns = ['姓名', '密码', '教工号', '所属院系']
        for column in required_columns:
            if column not in df.columns:
                logger.error(f"Excel文件缺少必要列: {column}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Excel文件缺少必要的列: {column}"
                )

        # 处理结果
        success_count = 0
        failed_records = []

        # 处理每一行数据
        for _, row in df.iterrows():
            try:
                # 创建教师记录
                teacher = Teacher(
                    username=row['姓名'],
                    staff_id=row['教工号'],
                    department=row['所属院系']
                )

                # 设置密码
                teacher.set_password(str(row['密码']))

                # 保存到数据库
                await teacher.save()
                success_count += 1
                logger.info(f"成功创建教师用户 - 用户名: {row['姓名']}, 教工号: {row['教工号']}")

            except IntegrityError as e:
                error_msg = "用户名或教工号已存在"
                logger.warning(f"创建教师用户失败 - 用户名: {row['姓名']}, 教工号: {row['教工号']}, 错误: {error_msg}")
                # 处理数据库完整性错误（如重复的用户名或教工号）
                failed_records.append(UserCreateResult(
                    username=row['姓名'],
                    success=False,
                    error="用户名或教工号已存在"
                ))
            except Exception as e:
                error_msg = str(e)
                logger.error(f"创建教师用户失败 - 用户名: {row['姓名']}, 教工号: {row['教工号']}, 错误: {error_msg}")
                # 处理其他错误
                failed_records.append(UserCreateResult(
                    username=row['姓名'],
                    success=False,
                    error=str(e)
                ))

        result = BatchUserCreateResponse(
            total=len(df),
            success_count=success_count,
            failed_count=len(failed_records),
            failed_records=failed_records
        )
        logger.info(f"教师批量创建完成 - 总数: {result.total}, 成功: {result.success_count}, 失败: {result.failed_count}")
        return result

    except Exception as e:
        error_msg = str(e)
        logger.error(f"处理Excel文件失败: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"处理Excel文件失败: {str(e)}"
        )