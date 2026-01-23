import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# from app.api.v1.routes import routers as v1_routers
# from app.api.v2.routes import routers as v2_routers
from app.api.routes import routers
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
        @self.app.get(
            "/chat/status",
            tags=["Chatbot"],
            summary="챗봇 기능 상태 확인",
            description="챗봇 서비스의 핵심 기능(Milvus 연결, 설정 로드)이 정상적인지 확인합니다."
        )
        def chat_status():
            """챗봇 기능 상태 점검"""
            status = {
                "service": "SilverLink-Chatbot",
                "milvus_connection": "unknown",
                "ready_to_chat": False
            }
            
            # 1. 챗봇 서비스 로드 확인
            if hasattr(self, 'chatbot_service') and self.chatbot_service:
                status["chatbot_service"] = "loaded"
            
            # 2. Milvus 데이터베이스 연결 확인
            try:
                from pymilvus import connections
                # 'default' alias는 VectorStoreService나 EmbeddingService 초기화 시 설정됨
                if connections.has_connection("default"):
                    status["milvus_connection"] = "connected"
                    status["ready_to_chat"] = True
                else:
                    # 연결이 없다면 시도해볼 수도 있겠지만, 여기서는 상태만 체크
                    status["milvus_connection"] = "disconnected"
            except Exception as e:
                status["milvus_connection"] = f"error: {str(e)}"

            return status

        # self.app.include_router(v1_routers, prefix=configs.API_V1_STR)
        # self.app.include_router(v2_routers, prefix=configs.API_V2_STR)

        # --- Chatbot & Data Sync Routes ---
        from app.chatbot.services.chatbot_service import ChatbotService
        from app.chatbot.services.data_sync_service import DataSyncService
        from app.chatbot.schema.chat_schema import ChatRequest, ChatResponse

        # 서비스 인스턴스 생성 (실제 운영 시 DI 권장)
        self.chatbot_service = ChatbotService()
        self.data_sync_service = DataSyncService()

        @self.app.post(
            "/chat",
            response_model=ChatResponse,
            tags=["Chatbot"],
            summary="AI 챗봇 대화",
            description="""
            보호자가 어르신 돌봄 관련 질문을 하면 AI 챗봇이 답변합니다.
            
            **기능:**
            - FAQ 데이터 검색
            - 개인 문의(Inquiry) 이력 검색
            - 대화 컨텍스트 유지 (thread_id 기반)
            - OpenAI GPT 기반 답변 생성
            
            **필수 파라미터:**
            - message: 사용자 질문
            - thread_id: 대화 스레드 ID (예: guardian_123)
            - guardian_id: 보호자 ID
            - elderly_id: 어르신 ID
            """
        )
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

        @self.app.post(
            "/sync/faqs",
            tags=["Data Sync"],
            summary="FAQ 데이터 동기화",
            description="""
            Spring Boot 백엔드에서 FAQ 데이터를 가져와 Milvus 벡터 DB에 동기화합니다.
            
            **동작:**
            1. Spring Boot API에서 FAQ 데이터 조회
            2. 질문+답변 텍스트를 OpenAI 임베딩으로 변환
            3. Milvus FAQ 컬렉션에 저장
            
            **사용 시점:**
            - FAQ 데이터가 업데이트되었을 때
            - 초기 데이터 셋업 시
            """
        )
        def sync_faqs():
            """FAQ 데이터 동기화"""
            try:
                self.data_sync_service.sync_all_faqs()
                return {"status": "success", "message": "FAQs synced successfully"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

        @self.app.post(
            "/sync/inquiries",
            tags=["Data Sync"],
            summary="Inquiry 데이터 동기화",
            description="""
            Spring Boot 백엔드에서 Inquiry(문의) 데이터를 가져와 Milvus 벡터 DB에 동기화합니다.
            
            **동작:**
            1. Spring Boot API에서 Inquiry 데이터 조회
            2. 질문+답변 텍스트를 OpenAI 임베딩으로 변환
            3. Milvus Inquiry 컬렉션에 저장 (guardian_id, elderly_id 포함)
            
            **사용 시점:**
            - Inquiry 데이터가 업데이트되었을 때
            - 초기 데이터 셋업 시
            """
        )
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