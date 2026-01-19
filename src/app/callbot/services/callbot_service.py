from app.callbot.repository.callbot_repository import CallbotRepository
from app.callbot.services.base_service import BaseService


class CallbotService(BaseService):
    def __init__(self, callbot_repository: CallbotRepository):
        self.callbot_repository= callbot_repository
        super().__init__(callbot_repository)
        
    def test(self):
        print('test')