import logging
import sys
from logging.handlers import TimedRotatingFileHandler

from app.config import SERVER_DIR

# 日志保存目录
LOG_DIR = SERVER_DIR/ "app" / "logs"
LOG_DIR.mkdir(exist_ok=True)

# 日志格式
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logger(name: str, log_level=logging.INFO):
    """
    设置并返回一个命名的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # 避免重复添加处理器
    if not logger.handlers:
        # 控制台处理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
        logger.addHandler(console_handler)

        # 文件处理器 (按天轮转)
        file_handler = TimedRotatingFileHandler(
            LOG_DIR / f"{name}.log",
            when="midnight",
            backupCount=7
        )
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
        logger.addHandler(file_handler)

    return logger


# 创建应用程序主日志记录器
app_logger = setup_logger("app")