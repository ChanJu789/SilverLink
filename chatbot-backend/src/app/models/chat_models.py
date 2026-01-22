from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    thread_id: str
    guardian_id: int
    elderly_id: int

class ChatbotRequest(BaseModel):
    message: str
    thread_id: str
    guardian_id: int
    elderly_id: int

class ChatResponse(BaseModel):
    answer: str
    thread_id: str
    sources: List[str] = []
    confidence: float = 0.0
