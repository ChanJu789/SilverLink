from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends

from app.core.container import Container
from app.core.middleware import inject_callbot
# from app.model.user import User
from app.ocr.services.ocr_service import OcrService


router = APIRouter(
    prefix="/ocr",
    tags=["ocr"],
)


@router.get(
    "",
    summary="OCR 서비스 테스트",
    description="OCR 서비스가 정상적으로 작동하는지 테스트합니다. (개발용)"
)
@inject_callbot
def get_post_list(
    service: OcrService = Depends(Provide[Container.ocr_service]),
):
    return service.test()
    