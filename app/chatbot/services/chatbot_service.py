import asyncio
import logging
import time
from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage, trim_messages
from langchain_openai import ChatOpenAI
from app.core.config import configs
from app.chatbot.services.embedding_service import EmbeddingService
from app.chatbot.repository.chatbot_repository import ChatbotRepository
from app.chatbot.services.base_service import BaseService

logger = logging.getLogger(__name__)

class ChatbotState(MessagesState):
    context: str

class ChatbotService(BaseService):
    """LangChart Agent Service"""
    
    def __init__(self, chatbot_repository: ChatbotRepository):
        self.chatbot_repository = chatbot_repository
        self.embedding_service = EmbeddingService()
        self.llm = ChatOpenAI(
            model=configs.OPENAI_MODEL,
            api_key=configs.OPENAI_API_KEY,
            temperature=0.7
        )
        self.memory = MemorySaver()
        self.app = self._build_workflow()
        super().__init__(chatbot_repository)

    def _build_workflow(self):
        workflow = StateGraph(state_schema=ChatbotState)
        workflow.add_node("chat", self._call_model)
        workflow.set_entry_point("chat")
        workflow.set_finish_point("chat")
        return workflow.compile(checkpointer=self.memory)

    async def _search_faq_async(self,chatbot_repository: ChatbotRepository, embedding: list[float]):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: chatbot_repository.search_faq(embedding, limit=3)
        )

    async def _search_inquiry_async(self,chatbot_repository: ChatbotRepository, embedding: list[float], guardian_id: int, elderly_id: int):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: chatbot_repository.search_inquiry(embedding, guardian_id, elderly_id, limit=2)
        )

    def _merge_and_rank_results(self, faq_results, inquiry_results):
        combined = []
        if faq_results:
            for hits in faq_results:
                for hit in hits:
                     combined.append({
                        "source": "FAQ",
                        "score": hit.score,
                        "question": hit.entity.get("question"),
                        "answer": hit.entity.get("answer")
                    })

        if inquiry_results:
            for hits in inquiry_results:
                for hit in hits:
                    combined.append({
                        "source": "INQUIRY",
                        "score": hit.score,
                        "question": hit.entity.get("question"),
                        "answer": hit.entity.get("answer")
                    })
        
        return sorted(combined, key=lambda x: x["score"], reverse=True)

    def _build_context_string(self, results: list) -> str:
        if not results:
            return "관련된 참고 정보가 없습니다."
        
        context_parts = []
        for item in results[:5]: 
            context_parts.append(f"[{item['source']}] Q: {item['question']}\nA: {item['answer']}")
        
        return "\n\n".join(context_parts)

    def _call_model(self, state: ChatbotState):
        messages = state["messages"]
        context = state.get("context", "")
        
        system_prompt = f"""
        당신은 어르신 돌봄 플랫폼 SilverLink의 AI 상담사입니다.
        다음 참고 정보를 바탕으로 보호자의 질문에 친절하게 답변해주세요.
        답변은 300자 내외로 답변해주세요.
        참고 정보에 없는 내용은 "죄송하지만 확인이 필요합니다"라고 답변하세요.

        [참고 정보]
        {context}
        """
        trimmed = trim_messages(
            messages,
            max_tokens=3000,
            strategy="last",
            token_counter=self.llm.get_num_tokens_from_messages,
            include_system=False,
            start_on="human"
        )
        
        final_messages = [SystemMessage(content=system_prompt)] + trimmed
        response = self.llm.invoke(final_messages)
        return {"messages": [response]}

    async def process_chat(self, message: str, thread_id: str, guardian_id: int, elderly_id: int):
        total_start = time.time()
        
        # 1. 임베딩 생성
        embed_start = time.time()
        embedding = self.embedding_service.create_embedding(message)
        embed_time = time.time() - embed_start
        logger.info(f"⏱️ [1/4] 임베딩 생성: {embed_time:.2f}초")
        
        # 2. FAQ/Inquiry 병렬 검색
        search_start = time.time()
        faq_task = asyncio.create_task(self._search_faq_async(self.chatbot_repository, embedding))
        inquiry_task = asyncio.create_task(self._search_inquiry_async(self.chatbot_repository, embedding, guardian_id, elderly_id))
        
        faq_results, inquiry_results = await asyncio.gather(faq_task, inquiry_task)
        search_time = time.time() - search_start
        logger.info(f"⏱️ [2/4] 벡터 검색 (FAQ+Inquiry): {search_time:.2f}초")
        
        # 3. 결과 병합
        merge_start = time.time()
        all_results = self._merge_and_rank_results(faq_results, inquiry_results)
        context = self._build_context_string(all_results)
        merge_time = time.time() - merge_start
        logger.info(f"⏱️ [3/4] 결과 병합: {merge_time:.2f}초")
        
        # 4. LLM 응답 생성
        llm_start = time.time()
        config = {"configurable": {"thread_id": thread_id}}
        input_state = {
            "messages": [HumanMessage(content=message)],
            "context": context
        }
        
        result = await self.app.ainvoke(input_state, config)
        last_message = result["messages"][-1]
        llm_time = time.time() - llm_start
        logger.info(f"⏱️ [4/4] LLM 응답 생성: {llm_time:.2f}초")
        
        # 총 소요 시간
        total_time = time.time() - total_start
        logger.info(f"✅ 총 소요 시간: {total_time:.2f}초 (임베딩:{embed_time:.2f}s + 검색:{search_time:.2f}s + 병합:{merge_time:.2f}s + LLM:{llm_time:.2f}s)")
        
        return {
            "answer": last_message.content,
            "sources": [r["source"] for r in all_results[:3]] if all_results else [],
            "confidence": all_results[0]["score"] if all_results else 0.0
        }
