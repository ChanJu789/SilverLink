from app.ocr.repository.ocr_repository import OcrRepository
from app.ocr.services.base_service import BaseService


class OcrService(BaseService):
    def __init__(self, ocr_repository: OcrRepository):
        self.ocr_repository= ocr_repository
        super().__init__(ocr_repository)
        
    def test(self):
        print('test')