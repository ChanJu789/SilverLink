from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional

from app.core.container import Container
from app.core.middleware import inject_ocr
from app.ocr.services.ocr_service import OcrService


router = APIRouter(
    prefix="/ocr",
    tags=["ocr"],
)


# Request/Response 스키마
class ValidateMedicationRequest(BaseModel):
    ocr_text: str
    elderly_user_id: Optional[int] = None


class MedicationInfo(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    times: List[str]
    instructions: Optional[str] = None
    confidence: float


class ValidateMedicationResponse(BaseModel):
    success: bool
    medications: List[MedicationInfo]
    raw_ocr_text: str
    llm_analysis: str
    warnings: List[str]
    error_message: Optional[str] = None


@router.get(
    "",
    summary="OCR 서비스 테스트",
    description="OCR 서비스가 정상적으로 작동하는지 테스트합니다. (개발용)"
)
@inject_ocr
def get_post_list(
    service: OcrService = Depends(Provide[Container.ocr_service]),
):
    return service.test()


@router.post(
    "/validate-medication",
    summary="OCR 텍스트 LLM 검증",
    description="OCR로 추출된 약봉투 텍스트를 LLM으로 검증하고 약 정보를 추출합니다.",
    response_model=ValidateMedicationResponse
)
@inject_ocr
async def validate_medication_ocr(
    request: ValidateMedicationRequest,
    service: OcrService = Depends(Provide[Container.ocr_service]),
):
    """
    OCR 텍스트를 LLM으로 분석하여 약 정보를 추출합니다.
    
    - medication_name: 약 이름
    - dosage: 용량 (예: 1정, 5mg)
    - times: 복용 시간 (morning, noon, evening, night)
    - instructions: 복용법 (예: 식후 30분)
    - confidence: 신뢰도 (0.0 ~ 1.0)
    """
    return await service.validate_medication(request.ocr_text, request.elderly_user_id)
    