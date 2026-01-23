from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
from app.chatbot.services.chatbot_service import ChatbotService


router = APIRouter(
    prefix="/chatbot",
    tags=["chatbot"],
)


@router.get(
    "",
    summary="챗봇 서비스 테스트",
    description="챗봇 서비스가 정상적으로 작동하는지 테스트합니다. (개발용)"
)
@inject_callbot
def get_post_list(
    service: ChatbotService = Depends(Provide[Container.chatbot_service]),
):
    return service.test()
    