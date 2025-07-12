import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, AsyncGenerator

from openai import OpenAI

from app.config import DEEPSEEK_API_KEY, SERVER_DIR
from app.core.logger import setup_logger
from app.models.user_common import UserRole
from app.schemas.chat_sch import (
    ChatMessage, ChatRequest, ChatStreamResponse, ChatMessageRole
)

# 设置日志
logger = setup_logger("chat_service")

# 聊天历史存储目录
CHAT_HISTORY_DIR = SERVER_DIR / "app" / "documents" / "chat_history"
CHAT_HISTORY_DIR.mkdir(exist_ok=True, parents=True)

# 创建 API 客户端
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# 内存缓存聊天历史
chat_history_cache = {}

def get_system_prompt(user_role: UserRole) -> str:
    base_prompt = "你是一个教育辅助AI助手，名为Lumino教学助手。"
    if user_role == UserRole.TEACHER:
        return base_prompt + "你将协助教师解答教学问题，提供教学建议和资源。"
    elif user_role == UserRole.STUDENT:
        return base_prompt + "你将帮助学生解答学习问题，提供知识讲解和学习方法指导，但不直接提供作业答案。"
    else:
        return base_prompt + "你将提供全面的教育服务支持。"


async def process_chat_request(
        request: ChatRequest,
        user_id: str,
        user_role: UserRole
) -> AsyncGenerator[ChatStreamResponse, None]:
    """处理聊天请求并返回AI回答的生成器"""
    logger.info(f"处理聊天请求: 用户ID={user_id}, 角色={user_role}")

    # 生成聊天ID
    chat_id = str(uuid.uuid4())

    try:
        # 准备系统提示词
        system_prompt = get_system_prompt(user_role)

        # 构建完整消息列表，包括系统提示
        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # 添加用户消息
        for msg in request.messages:
            messages.append({
                "role": msg.role.value,
                "content": msg.content
            })

        # 调用AI服务获取回答
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True
        )

        # 处理流式响应
        full_content = ""
        for chunk in response:
            if hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                content_chunk = chunk.choices[0].delta.content
                full_content += content_chunk

                # 返回当前累积的响应
                yield ChatStreamResponse(
                    id=chat_id,
                    content=full_content,
                    is_complete=False
                )

        # 最终完整响应
        yield ChatStreamResponse(
            id=chat_id,
            content=full_content,
            is_complete=True
        )
        logger.info(f"聊天请求处理完成: 用户ID={user_id}, 聊天ID={chat_id}")

        logger.info(f"准备保存聊天历史: 用户ID={user_id}, 聊天ID={chat_id}")
        # 保存聊天历史
        save_chat_history(
            chat_id,
            user_id,
            request.messages,
            ChatMessage(role=ChatMessageRole.ASSISTANT, content=full_content)
        )
        logger.info(f"聊天历史已保存: 用户ID={user_id}, 聊天ID={chat_id}")

    except Exception as e:
        logger.error(f"聊天请求处理失败: {str(e)}")
        yield ChatStreamResponse(
            id=chat_id,
            content=f"处理请求时发生错误: {str(e)}",
            is_complete=True
        )


def save_chat_history(
        chat_id: str,
        user_id: str,
        user_messages: List[ChatMessage],
        assistant_response: ChatMessage
) -> None:
    """保存聊天历史"""
    # 确保用户在缓存中有记录
    if user_id not in chat_history_cache:
        chat_history_cache[user_id] = {}

    # 保存当前对话
    chat_history_cache[user_id][chat_id] = {
        "messages": [msg.model_dump() for msg in user_messages] + [assistant_response.model_dump()],
        "created_at": datetime.now().isoformat()
    }

    # 保存到文件
    try:
        chat_file = CHAT_HISTORY_DIR / f"chat_{user_id}_{chat_id}.json"
        import json
        with open(chat_file, "w", encoding="utf-8") as f:
            json.dump(chat_history_cache[user_id][chat_id], f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"保存聊天历史到文件失败: {str(e)}")


async def get_chat_history(user_id: str, chat_id: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
    """获取聊天历史"""
    # 如果用户没有聊天记录
    if user_id not in chat_history_cache:
        return {"chats": []}

    # 如果请求特定聊天ID
    if chat_id:
        if chat_id in chat_history_cache[user_id]:
            return chat_history_cache[user_id][chat_id]
        return {"messages": [], "created_at": ""}

    # 返回最近的聊天记录
    recent_chats = sorted(
        chat_history_cache[user_id].items(),
        key=lambda x: x[1]["created_at"],
        reverse=True
    )[:limit]

    return {
        "chats": [
            {
                "chat_id": cid,
                "created_at": data["created_at"],
                "preview": data["messages"][-1]["content"][:50] + "..." if data["messages"] else ""
            }
            for cid, data in recent_chats
        ]
    }