import logging
import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# from app.api.v1.routes import routers as v1_routers
# from app.api.v2.routes import routers as v2_routers
from app.api.routes import routers
from app.core.config import configs
from app.core.container import Container
from app.util.class_object import singleton

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# httpcore와 httpx의 DEBUG 로그 비활성화
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

@singleton
class AppCreator:
    def __init__(self):
        # set app default
        self.app = FastAPI(
            title=configs.PROJECT_NAME,
            openapi_url="/openapi.json",
            docs_url="/docs",
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

        @self.app.get("/")
        def root():
            return "service is working" 
        
        self.app.include_router(routers, prefix=configs.API_STR)

app_creator = AppCreator()
app = app_creator.app
# db = app_creator.db
container = app_creator.container

# Prefetch Greeting Audio
greeting = "안녕하세요! 찬주님 실버링크에서 연락드렸습니다. 잘 지내시죠?"
print("⏳ Prefetching Greeting TTS...")
try:
    @app.on_event("startup")
    async def prefetch_greeting():
        tts_service = container.tts()
        await tts_service.asultlux(greeting)
        print("✅ Greeting TTS Prefetched!")
except Exception as e:
    print(f"⚠️ Prefetch failed: {e}")

print(f'Documents: http://localhost:{configs.PORT}/docs')

if __name__ == '__main__':
    uvicorn.run("app.main:app", host="0.0.0.0", port=configs.PORT, reload=True)