import asyncio
import logging
from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage, trim_messages, BaseMessage
from langchain_openai import ChatOpenAI
from src.app.config.settings import get_settings
from src.app.services.embedding_service import EmbeddingService
from src.app.services.vector_store import VectorStoreService

settings = get_settings()
logger = logging.getLogger(__name__)

class ChatbotState(MessagesState):
    context: str

class LangChainAgent:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )
        self.memory = MemorySaver()
        self.app = self._build_workflow()

    def _build_workflow(self):
        workflow = StateGraph(state_schema=ChatbotState)
        workflow.add_node("chat", self._call_model)
        workflow.set_entry_point("chat")
        workflow.set_finish_point("chat")
        return workflow.compile(checkpointer=self.memory)

    async def _search_faq_async(self, embedding: list[float]):
        """FAQ 비동기 검색"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.vector_store.search_faq(embedding, limit=3)
        )

    async def _search_inquiry_async(self, embedding: list[float], guardian_id: int, elderly_id: int):
        """Inquiry 비동기 검색"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.vector_store.search_inquiry(embedding, guardian_id, elderly_id, limit=2)
        )

    def _merge_and_rank_results(self, faq_results, inquiry_results):
        """결과 병합 및 유사도 정렬"""
        combined = []
        
        # FAQ 처리 (pymilvus search result parsing)
        if faq_results:
            for hits in faq_results:
                for hit in hits:
                     combined.append({
                        "source": "FAQ",
                        "score": hit.score,
                        "question": hit.entity.get("question"),
                        "answer": hit.entity.get("answer")
                    })

        # Inquiry 처리
        if inquiry_results:
            for hits in inquiry_results:
                for hit in hits:
                    combined.append({
                        "source": "INQUIRY",
                        "score": hit.score,
                        "question": hit.entity.get("question"),
                        "answer": hit.entity.get("answer")
                    })
        
        # 점수 내림차순 정렬
        return sorted(combined, key=lambda x: x["score"], reverse=True)

    def _build_context_string(self, results: list) -> str:
        if not results:
            return "관련된 참고 정보가 없습니다."
        
        context_parts = []
        for item in results[:5]: # 상위 5개
            context_parts.append(f"[{item['source']}] Q: {item['question']}\nA: {item['answer']}")
        
        return "\n\n".join(context_parts)

    def _count_tokens(self, messages: List[BaseMessage]) -> int:
        # 간단한 길이 기반 카운팅 (실제 토큰 수와 다름, 예시용)
        # tiktoken을 사용하는 것이 정확함
        return sum(len(m.content) for m in messages) // 4

    def _call_model(self, state: ChatbotState):
        messages = state["messages"]
        context = state.get("context", "")
        
        # 시스템 메시지 구성 (컨텍스트 포함)
        system_prompt = f"""당신은 어르신 돌봄 플랫폼 SilverLink의 AI 상담사입니다.
다음 참고 정보를 바탕으로 보호자의 질문에 친절하게 답변해주세요.
참고 정보에 없는 내용은 "죄송하지만 확인이 필요합니다"라고 답변하세요.

[참고 정보]
{context}
"""
        
        # 메시지 트리밍 (최근 메시지 위주, 시스템 메시지 제외하고 트리밍 후 시스템 메시지 추가)
        # LangChain trim_messages 사용
        trimmed = trim_messages(
            messages,
            max_tokens=3000,
            strategy="last",
            token_counter=self.llm.get_num_tokens_from_messages, # LLM의 토크나이저 사용
            include_system=False, # 시스템 메시지는 별도로 관리
            start_on="human"
        )
        
        # 최종 메시지 리스트: System + Trimmed History
        final_messages = [SystemMessage(content=system_prompt)] + trimmed
        
        response = self.llm.invoke(final_messages)
        return {"messages": [response]}

    async def process_chat(self, message: str, thread_id: str, guardian_id: int, elderly_id: int):
        # 1. 임베딩
        embedding = self.embedding_service.create_embedding(message)
        
        # 2. 병렬 검색
        faq_task = asyncio.create_task(self._search_faq_async(embedding))
        inquiry_task = asyncio.create_task(self._search_inquiry_async(embedding, guardian_id, elderly_id))
        
        faq_results, inquiry_results = await asyncio.gather(faq_task, inquiry_task)
        
        # 3. 결과 병합
        all_results = self._merge_and_rank_results(faq_results, inquiry_results)
        
        # 4. 컨텍스트 생성
        context = self._build_context_string(all_results)
        
        # 5. Graph 실행
        config = {"configurable": {"thread_id": thread_id}}
        
        # 입력 상태 준비
        input_state = {
            "messages": [HumanMessage(content=message)],
            "context": context
        }
        
        result = await self.app.ainvoke(input_state, config)
        
        last_message = result["messages"][-1]
        
        return {
            "answer": last_message.content,
            "sources": [r["source"] for r in all_results[:3]] if all_results else [],
            "confidence": all_results[0]["score"] if all_results else 0.0
        }
