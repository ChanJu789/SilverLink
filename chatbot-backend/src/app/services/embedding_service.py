from langchain_openai import OpenAIEmbeddings
from src.app.config.settings import get_settings

settings = get_settings()

class EmbeddingService:
    """OpenAI 임베딩 서비스"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY
        )

    def create_embedding(self, text: str) -> list[float]:
        """텍스트를 벡터로 변환"""
        return self.embeddings.embed_query(text)

    def create_embeddings(self, texts: list[str]) -> list[list[float]]:
        """여러 텍스트를 벡터로 변환"""
        return self.embeddings.embed_documents(texts)
