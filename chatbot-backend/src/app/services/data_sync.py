import requests
import logging
from src.app.config.settings import get_settings
from src.app.services.embedding_service import EmbeddingService
from src.app.services.vector_store import VectorStoreService

settings = get_settings()
logger = logging.getLogger(__name__)

class DataSyncService:
    """Spring Boot API와 데이터 동기화 서비스"""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.base_url = settings.SPRING_BOOT_URL

    def sync_all_faqs(self):
        """전체 FAQ 동기화"""
        try:
            url = f"{self.base_url}/api/data/faqs/all"
            response = requests.get(url)
            response.raise_for_status()
            faqs = response.json()
            
            if not faqs:
                logger.info("No FAQs to sync")
                return

            ids = []
            embeddings = []
            categories = []
            questions = []
            answers = []

            for faq in faqs:
                text = f"{faq['question']} {faq['answerText']}"
                embedding = self.embedding_service.create_embedding(text)
                
                ids.append(faq['faqId'])
                embeddings.append(embedding)
                categories.append(faq['category'])
                questions.append(faq['question'])
                answers.append(faq['answerText'])

            # Milvus Insert
            self.vector_store.insert_faq([ids, embeddings, categories, questions, answers])
            logger.info(f"Synced {len(faqs)} FAQs")

        except Exception as e:
            logger.error(f"Failed to sync FAQs: {e}")
            raise

    def sync_all_inquiries(self):
        """전체 Inquiry 동기화"""
        try:
            url = f"{self.base_url}/api/data/inquiries/answered"
            response = requests.get(url)
            response.raise_for_status()
            inquiries = response.json()

            if not inquiries:
                logger.info("No Inquiries to sync")
                return

            ids = []
            embeddings = []
            guardian_ids = []
            elderly_ids = []
            questions = []
            answers = []

            for inquiry in inquiries:
                text = f"{inquiry['question']} {inquiry['answer']}"
                embedding = self.embedding_service.create_embedding(text)
                
                ids.append(inquiry['inquiryId'])
                embeddings.append(embedding)
                guardian_ids.append(inquiry['guardianUserId'])
                elderly_ids.append(inquiry['elderlyUserId'])
                questions.append(inquiry['question'])
                answers.append(inquiry['answer'])

            # Milvus Insert
            self.vector_store.insert_inquiry([ids, embeddings, guardian_ids, elderly_ids, questions, answers])
            logger.info(f"Synced {len(inquiries)} Inquiries")

        except Exception as e:
            logger.error(f"Failed to sync Inquiries: {e}")
            raise
