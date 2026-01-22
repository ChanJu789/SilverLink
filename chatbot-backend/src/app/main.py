from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.config.settings import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 구체적인 도메인으로 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- Services Initialization ---
# 전역 인스턴스로 관리 (실제 운영 시에는 DI 컨테이너 사용 권장)
from src.app.services.data_sync import DataSyncService
from src.app.models.langchain_agent import LangChainAgent
from src.app.models.chat_models import ChatRequest, ChatResponse

agent = LangChainAgent()
data_sync_service = DataSyncService()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    챗봇 질문 처리 엔드포인트
    """
    result = await agent.process_chat(
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

@app.post("/sync/faqs")
def sync_faqs():
    """FAQ 데이터 동기화"""
    try:
        data_sync_service.sync_all_faqs()
        return {"status": "success", "message": "FAQs synced successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/sync/inquiries")
def sync_inquiries():
    """Inquiry 데이터 동기화"""
    try:
        data_sync_service.sync_all_inquiries()
        return {"status": "success", "message": "Inquiries synced successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.app.main:app", host="0.0.0.0", port=8000, reload=True)
