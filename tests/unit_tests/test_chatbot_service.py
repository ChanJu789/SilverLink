import pytest
import os
from unittest.mock import Mock, patch, AsyncMock

@pytest.fixture
def mock_embedding_service():
    service = Mock()
    service.create_embedding.return_value = [0.1] * 1536
    return service

@pytest.fixture
def mock_vector_store():
    store = Mock()
    # Milvus 검색 결과 모의 객체
    mock_hit = Mock()
    mock_hit.score = 0.95
    mock_hit.entity.get.side_effect = lambda key: {"question": "Q", "answer": "A"}.get(key)
    
    store.search_faq.return_value = [[mock_hit]]
    store.search_inquiry.return_value = [[mock_hit]]
    return store

@pytest.fixture
def mock_llm():
    llm = Mock()
    llm.invoke.return_value = Mock(content="Test Answer")
    llm.get_num_tokens_from_messages.return_value = 100
    return llm

@pytest.fixture
def chatbot_service(mock_embedding_service, mock_vector_store, mock_llm):
    # MemorySaver는 실제 인스턴스 사용 (Validation 통과 위해)
    from app.chatbot.services.chatbot_service import ChatbotService
    
    with patch("src.app.chatbot.services.chatbot_service.EmbeddingService", return_value=mock_embedding_service), \
         patch("src.app.chatbot.services.chatbot_service.VectorStoreService", return_value=mock_vector_store), \
         patch("src.app.chatbot.services.chatbot_service.ChatOpenAI", return_value=mock_llm):
            # MemorySaver patch 제거
        
        service = ChatbotService()
        
        # app.ainvoke Mocking (실제 그래프 실행 대신 결과만 모의)
        # 하지만 compile() 자체는 실제 MemorySaver로 성공해야 함
        service.app = AsyncMock()
        service.app.ainvoke.return_value = {"messages": [Mock(content="Final Answer")]}
        
        return service

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="Env vars missing")
@pytest.mark.asyncio
async def test_process_chat(chatbot_service):
    """ChatbotService.process_chat 단위 테스트"""
    
    # Given
    message = "약 먹는 시간 알려줘"
    thread_id = "test_thread"
    guardian_id = 1
    elderly_id = 1
    
    # When
    result = await chatbot_service.process_chat(message, thread_id, guardian_id, elderly_id)
    
    # Then
    assert result["answer"] == "Final Answer"
    assert result["confidence"] == 0.95
    assert len(result["sources"]) > 0
    assert result["sources"][0] in ["FAQ", "INQUIRY"]
    
    # Verify method calls
    chatbot_service.embedding_service.create_embedding.assert_called_once_with(message)
    # Async tasks (search) verification is tricky with partial mocks, focusing on flow result
