from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
from app.callbot.schema.base_schema import Blank
# from app.schema.post_tag_schema import FindPost, FindPostWithTagsResult, PostWithTags, UpsertPostWithTags
# from app.services.post_service import PostService
from app.callbot.services.callbot_service import CallbotService


router = APIRouter(
    prefix="/callbot",
    tags=["callbot"],
)


@router.get("")
@inject_callbot
def get_post_list(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    return service.test()
    