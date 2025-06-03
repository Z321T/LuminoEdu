import re
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status

from app.core.logger import LOG_DIR
from app.schemas.log_management import LogService, LogServiceList, LogFile, LogFileList, LogContent

# 服务描述映射，可以随时扩展
SERVICE_DESCRIPTIONS = {
    # 系统服务记录
    "app": "应用启动日志",
    "request": "应用请求日志",
    # 管理员端服务
    "user_create": "用户创建日志",
    # 教师端服务
    "exercise_generator_service": "习题生成服务日志",
    "exercise_generator_api": "习题生成服务相关API请求日志",
    "ppt_generator_service": "PPT生成服务日志",
    "ppt_generator_api": "PPT生成服务相关API请求日志",
    # 学生端服务

    # 可根据需要扩展更多服务
}

def format_file_size(size_bytes: int) -> str:
    """格式化文件大小"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

async def get_log_services() -> LogServiceList:
    """获取所有日志服务（文件夹）"""
    # 确保日志目录存在
    if not LOG_DIR.exists():
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        return LogServiceList(services=[])

    log_services = []

    # 获取所有子文件夹
    for item in LOG_DIR.iterdir():
        if item.is_dir():
            service_name = item.name
            # 获取服务描述，如果没有预定义则使用默认描述
            description = SERVICE_DESCRIPTIONS.get(service_name, f"{service_name}服务")
            log_services.append(LogService(name=service_name, description=description))

    # 按名称排序
    log_services.sort(key=lambda x: x.name)
    return LogServiceList(services=log_services)

async def get_log_files(service_name: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> LogFileList:
    """获取指定服务的日志文件列表"""
    service_dir = LOG_DIR / service_name

    # 检查服务目录是否存在
    if not service_dir.exists() or not service_dir.is_dir():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"日志服务 '{service_name}' 不存在"
        )

    service_description = SERVICE_DESCRIPTIONS.get(service_name, f"{service_name}服务")
    log_files = []

    # 转换日期字符串为日期对象
    start_datetime = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
    end_datetime = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None

    # 查找所有日志文件
    for file_path in service_dir.glob("*.log*"):
        # 从文件名提取日期 (格式: name.log.YYYY-MM-DD)
        date_match = re.search(r'\.log\.(\d{4}-\d{2}-\d{2})$', file_path.name)
        date = None

        if date_match:
            try:
                date_str = date_match.group(1)
                date = datetime.strptime(date_str, "%Y-%m-%d")

                # 应用日期筛选
                if start_datetime and date.date() < start_datetime:
                    continue
                if end_datetime and date.date() > end_datetime:
                    continue

            except ValueError:
                pass

        # 获取文件大小并格式化
        size_bytes = file_path.stat().st_size
        formatted_size = format_file_size(size_bytes)

        log_files.append(LogFile(
            name=file_path.name,
            date=date,
            size=formatted_size
        ))

    # 按日期从新到旧排序
    log_files.sort(key=lambda x: x.date if x.date else datetime.min, reverse=True)

    return LogFileList(
        files=log_files,
        service_name=service_name,
        service_description=service_description
    )

async def get_log_content(service_name: str, file_name: str) -> LogContent:
    """获取日志文件内容"""
    service_dir = LOG_DIR / service_name
    log_file = service_dir / file_name

    # 检查服务目录和文件是否存在
    if not service_dir.exists() or not service_dir.is_dir():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"日志服务 '{service_name}' 不存在"
        )

    if not log_file.exists() or not log_file.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"日志文件 '{file_name}' 不存在"
        )

    try:
        # 读取文件内容
        with open(log_file, 'r', encoding='utf-8') as f:
            content = f.readlines()

        # 去除每行末尾的换行符
        content = [line.rstrip('\n') for line in content]

        return LogContent(
            content=content,
            file_name=file_name,
            service_name=service_name
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"读取日志文件失败: {str(e)}"
        )