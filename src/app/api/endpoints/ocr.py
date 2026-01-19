from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
from app.ocr.schema.base_schema import Blank
from app.ocr.services.ocr_service import OcrService


router = APIRouter(
    prefix="/ocr",
    tags=["ocr"],
)


@router.get("")
@inject_callbot
def get_post_list(
    service: OcrService = Depends(Provide[Container.ocr_service]),
):
    return service.test()
    