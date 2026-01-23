from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
# from app.schema.post_tag_schema import FindPost, FindPostWithTagsResult, PostWithTags, UpsertPostWithTags
# from app.services.post_service import PostService
from app.callbot.services.callbot_service import CallbotService


router = APIRouter(
    prefix="/callbot",
    tags=["callbot"],
)


@router.get(
    "",
    summary="콜봇 서비스 테스트",
    description="콜봇 서비스가 정상적으로 작동하는지 테스트합니다. (개발용)"
)
@inject_callbot
def get_post_list(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    return service.test()
    