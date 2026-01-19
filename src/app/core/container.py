from dependency_injector import containers, providers

# from app.core.database import Database
from app.callbot.repository import *
from app.chatbot.repository import *
from app.ocr.repository import *
from app.callbot.services import *
from app.chatbot.services import *
from app.ocr.services import *


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.endpoints.callbot",
            "app.api.endpoints.chatbot",
            "app.api.endpoints.ocr",
        ]
    )

    # db = providers.Singleton(Database, db_url=configs.DATABASE_URI)

    callbot_repository = providers.Factory(CallbotRepository)
    chatbot_repository = providers.Factory(ChatbotRepository)
    ocr_repository = providers.Factory(OcrRepository)

    callbot_service = providers.Factory(CallbotService, callbot_repository=callbot_repository)
    chatbot_service = providers.Factory(ChatbotService, chatbot_repository=chatbot_repository)
    ocr_service = providers.Factory(OcrService, ocr_repository=ocr_repository)
