from openai import OpenAI
from dependency_injector import containers, providers

# from app.core.database import Database
from app.callbot.repository import CallbotRepository
from app.chatbot.repository import ChatbotRepository
from app.ocr.repository import OcrRepository
from app.callbot.services import CallbotService
from app.chatbot.services import ChatbotService
from app.ocr.services import OcrService
from app.core.config import configs
from app.integration.llm.openai_client import LLM
from app.integration.stt.clova_client import STT
from app.integration.tts.luxia_client import TTS
from app.integration.call import CALL


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.endpoints.callbot",
            "app.api.endpoints.chatbot",
            "app.api.endpoints.ocr",
        ]
    )

    # db = providers.Singleton(Database, db_url=configs.DATABASE_URI)
    llm = providers.Singleton(LLM, model_version=configs.INFERENCE_MODEL, api_key=configs.OPENAI_API_KEY)
    # stt = providers.Singleton(STT, model_name="naver", secret_key=configs.CLOVA_SECRET_KEY, url=configs.CLOVA_STT_URL)
    tts = providers.Singleton(TTS, api_key=configs.LUXIA_API_KEY, url=configs.CALL_CONTROLL_URL)
    call = providers.Singleton(CALL, account_sid=configs.TWILIO_SID, auth_token=configs.TWILIO_TOKEN, url=configs.CALL_CONTROLL_URL, number=configs.NUMBER, silverlink_number=configs.SILVERLINK_NUMBER)
     
    callbot_repository = providers.Factory(CallbotRepository)
    chatbot_repository = providers.Factory(ChatbotRepository)
    ocr_repository = providers.Factory(OcrRepository)

    callbot_service = providers.Factory(CallbotService, callbot_repository=callbot_repository, llm=llm, call=call, tts=tts)
    chatbot_service = providers.Factory(ChatbotService, chatbot_repository=chatbot_repository)
    ocr_service = providers.Factory(OcrService, ocr_repository=ocr_repository)