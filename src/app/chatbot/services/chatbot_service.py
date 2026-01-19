from app.chatbot.repository.chatbot_repository import ChatbotRepository
from app.chatbot.services.base_service import BaseService


class ChatbotService(BaseService):
    def __init__(self, chatbot_repository: ChatbotRepository):
        self.chatbot_repository= chatbot_repository
        super().__init__(chatbot_repository)
        
    def test(self):
        print('test')