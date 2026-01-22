from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "SilverLink Chatbot"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Milvus / Zilliz
    MILVUS_URI: str
    MILVUS_TOKEN: str
    FAQ_COLLECTION_NAME: str = "faq_collection"
    INQUIRY_COLLECTION_NAME: str = "inquiry_collection"
    
    # Spring Boot backend
    SPRING_BOOT_URL: str = "http://localhost:8080"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
