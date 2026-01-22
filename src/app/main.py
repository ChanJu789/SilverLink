import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# from app.api.v1.routes import routers as v1_routers
# from app.api.v2.routes import routers as v2_routers
from app.core.config import configs
from app.core.container import Container
from app.util.class_object import singleton

@singleton
class AppCreator:
    def __init__(self):
        # set app default
        self.app = FastAPI(
            title=configs.PROJECT_NAME,
            openapi_url=f"{configs.API}/openapi.json",
            version="0.0.1",
        )

        # set db and container
        self.container = Container()
        # self.db = self.container.db()
        # self.db.create_database()

        # set cors
        if configs.BACKEND_CORS_ORIGINS:
            self.app.add_middleware(
                CORSMiddleware,
                allow_origins=[str(origin) for origin in configs.BACKEND_CORS_ORIGINS],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )

        # set routes
        @self.app.get("/")
        def root():
            return "service is working"

        @self.app.get("/health")
        def health_check():
            return {"status": "healthy"}

        # self.app.include_router(v1_routers, prefix=configs.API_V1_STR)
        # self.app.include_router(v2_routers, prefix=configs.API_V2_STR)

        # --- Chatbot & Data Sync Routes ---
        from app.chatbot.services.chatbot_service import ChatbotService
        from app.chatbot.services.data_sync_service import DataSyncService
        from app.chatbot.schema.chat_schema import ChatRequest, ChatResponse

        # 서비스 인스턴스 생성 (실제 운영 시 DI 권장)
        self.chatbot_service = ChatbotService()
        self.data_sync_service = DataSyncService()

        @self.app.post("/chat", response_model=ChatResponse)
        async def chat_endpoint(request: ChatRequest):
            """챗봇 질문 처리"""
            result = await self.chatbot_service.process_chat(
                message=request.message,
                thread_id=request.thread_id,
                guardian_id=request.guardian_id,
                elderly_id=request.elderly_id
            )
            return ChatResponse(
                answer=result["answer"],
                thread_id=request.thread_id,
                sources=result["sources"],
                confidence=result["confidence"]
            )

        @self.app.post("/sync/faqs")
        def sync_faqs():
            """FAQ 데이터 동기화"""
            try:
                self.data_sync_service.sync_all_faqs()
                return {"status": "success", "message": "FAQs synced successfully"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

        @self.app.post("/sync/inquiries")
        def sync_inquiries():
            """Inquiry 데이터 동기화"""
            try:
                self.data_sync_service.sync_all_inquiries()
                return {"status": "success", "message": "Inquiries synced successfully"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

app_creator = AppCreator()
app = app_creator.app
# db = app_creator.db
container = app_creator.container

print('Documents: http://localhost:8000/docs')

if __name__ == '__main__':
    uvicorn.run("app.main:app", reload=True)