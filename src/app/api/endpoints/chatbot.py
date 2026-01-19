from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
from app.chatbot.schema.base_schema import Blank
from app.chatbot.services.chatbot_service import ChatbotService


router = APIRouter(
    prefix="/chatbot",
    tags=["chatbot"],
)


@router.get("")
@inject_callbot
def get_post_list(
    service: ChatbotService = Depends(Provide[Container.chatbot_service]),
):
    return service.test()
    