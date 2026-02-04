import time
import asyncio
import json
import re
import os
import multiprocessing
from typing import List, AsyncGenerator, Dict, Optional, Literal, Any
import urllib.parse
import wave
import io
import traceback
import boto3
import requests
import uuid # UUID 추가
from twilio.rest import Client as TwilioClient
from datetime import datetime
from qdrant_client import QdrantClient # Qdrant 직접 제어
from qdrant_client.models import PointStruct

# Disable Mem0 Telemetry to prevent PostHog connection errors
os.environ["MEM0_TELEMETRY"] = "false"

from pydantic import BaseModel, Field
from huggingface_hub import hf_hub_download
from llama_cpp import Llama, LlamaGrammar

# [New] Presidio Imports for PII Filtering
try:
    from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    PRESIDIO_AVAILABLE = True
except ImportError:
    print("⚠️ Presidio library not found. PII filtering will be disabled.")
    PRESIDIO_AVAILABLE = False

try:
    from mem0 import Memory
    MEM0_AVAILABLE = True
except ImportError:
    print("⚠️ Mem0 library not found. Memory feature will be disabled.")
    MEM0_AVAILABLE = False

from app.callbot.repository.callbot_repository import CallbotRepository
from app.callbot.services.base_service import BaseService
from app.integration.llm.openai_client import LLM
from app.integration.tts.luxia_client import TTS
from app.integration.call import CALL
from app.core.config import configs
from app.util.http_client import send_data_to_backend

# --- Data Models (From Orchestrator) ---
class SlotItem(BaseModel):
    category: Literal["식사 여부", "건강 상태", "기분", "하루 일정", "수면 상태"] = Field(
        description="""
        정확한 카테고리를 선택하세요:
        - '식사 여부': 밥, 식사, 끼니, 아침/점심/저녁, 배고픔 등 먹는 행위와 관련된 모든 것.
        - '건강 상태': 아픔, 통증, 병원, 약, 컨디션, 몸 상태 등 신체적 건강 관련.
        - '기분': 행복, 슬픔, 외로움, 즐거움 등 감정적 상태. (단, '배불러서 좋다'는 '식사 여부'와 '기분' 둘 다 가능하나, 밥을 먹었다는 사실은 '식사 여부'가 우선임)
        - '하루 일정': 복지관, 산책, 외출, 손님 방문, TV 시청 등 활동 계획.
        - '수면 상태': 잠, 불면증, 꿈, 피곤함 등 수면 관련.
        """
    )
    value: str = Field(description="사용자의 발화 내용을 요약한 값 (예: '밥 먹음', '허리가 아픔')")

class DialogueDecision(BaseModel):
    acknowledgment: str = Field(description="어르신의 말에 대한 공감과 과거 기억을 연결한 문장. (예: '목소리가 밝으셔서 다행이에요. 지난번에 무릎 아프다고 하셔서 걱정했거든요.')")
    question: str = Field(description="다음에 물어볼 질문. (예: '오늘은 좀 어떠세요?')")
    next_action: str = Field(description="'DEEP_DIVE' 또는 'SLOT_QUESTION'")
    topic: Optional[str] = Field(description="현재 주제")

class UnifiedAnalysisResult(BaseModel):
    extracted_slots: List[SlotItem] = Field(description="발견된 정보 리스트. 없으면 빈 리스트 [] 반환.")
    dialogue_decision: DialogueDecision = Field(description="대화 전략")

# --- Global State & Configuration ---
MODEL_NAME = "klue/roberta-small"
EMBEDDING_MODEL_NAME = "jhgan/ko-sroberta-multitask"
MANDATORY_SLOTS = ["식사 여부", "건강 상태", "기분", "하루 일정", "수면 상태"]
MAX_DEEP_DIVE_TURNS = 2

# Global Singleton for Heavy Models (Loaded once)
class OrchestratorEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OrchestratorEngine, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance
    
    def initialize(self):
        print("🚀 [OrchestratorEngine] Initializing...")
        self.presidio_analyzer = None
        self.presidio_anonymizer = None
        self.local_llm = None
        self.memory = None
        
        # 1. Initialize Presidio
        if PRESIDIO_AVAILABLE:
            try:
                configuration = {
                    "nlp_engine_name": "spacy",
                    "models": [{"lang_code": "ko", "model_name": "ko_core_news_lg"}],
                }
                provider = NlpEngineProvider(nlp_configuration=configuration)
                nlp_engine = provider.create_engine()
                analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["ko"])
                
                # Patterns
                korean_phone_pattern = Pattern(name="korean_phone_pattern", regex=r"01[016789][-.\]s]?\d{3,4}[-.\]s]?\d{4}", score=1.0)
                analyzer.registry.add_recognizer(PatternRecognizer(supported_entity="PHONE_NUMBER", patterns=[korean_phone_pattern], supported_language="ko"))
                
                korean_rrn_pattern = Pattern(name="korean_rrn_pattern", regex=r"\d{6}[-.\]s]?[1-4]\d{6}", score=1.0)
                analyzer.registry.add_recognizer(PatternRecognizer(supported_entity="KOREAN_RRN", patterns=[korean_rrn_pattern], supported_language="ko"))
                
                self.presidio_analyzer = analyzer
                self.presidio_anonymizer = AnonymizerEngine()
                print("✅ Presidio PII Engine Ready.")
            except Exception as e:
                print(f"⚠️ Presidio Init Failed: {e}")

        # 2. Initialize Local LLM (Qwen)
        print("🚀 [초경량 모드] Qwen 2.5 0.5B Q8_0 로드 중...")
        try:
            model_path = hf_hub_download(
                repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
                filename="qwen2.5-0.5b-instruct-q8_0.gguf"
            )
            cores = multiprocessing.cpu_count()
            self.local_llm = Llama(model_path=model_path, n_ctx=1024, n_threads=min(cores, 4), verbose=False)
            print("✅ Local LLM Ready.")
        except Exception as e:
            print(f"⚠️ Local LLM Load Failed: {e}")

        # 3. Initialize Memory
        if MEM0_AVAILABLE:
            try:
                from mem0 import Memory
                
                # 절대 경로 확보
                abs_db_path = os.path.join(configs.PROJECT_ROOT, "mem_db")
                os.makedirs(abs_db_path, exist_ok=True)
                
                print(f"📁 [Mem0] Setting standard path: {abs_db_path}")
                
                # Mem0 표준 설정 방식 (path 문자열 직접 전달)
                mem0_config = {
                    "vector_store": {
                        "provider": "qdrant", 
                        "config": {
                            "path": abs_db_path,
                            "collection_name": "silverlink_memories",
                            "embedding_model_dims": 768, # [Critical] 여기에 설정해야 함
                        }
                    },
                    "llm": {
                        "provider": "openai",
                        "config": {
                            "model": "gpt-4o-mini",
                            "temperature": 0.1
                        }
                    },
                    "embedder": {
                        "provider": "huggingface", 
                        "config": {
                            "model": EMBEDDING_MODEL_NAME,
                        }
                    }
                }
                self.memory = Memory.from_config(mem0_config)
                print(f"✅ Mem0 Memory Initialized with path: {abs_db_path}")
            except Exception as e:
                print(f"⚠️ Memory Load Failed: {e}")
                traceback.print_exc()

# Call Session State Manager (In-Memory for Demo)
# In production, use Redis.
class CallSession:
    _sessions: Dict[str, Dict] = {}

    @classmethod
    def get_session(cls, call_sid: str):
        if call_sid not in cls._sessions:
            cls._sessions[call_sid] = {
                "elderly_id": None,
                "elderly_name": None,
                "call_id": None, # Backend Call ID
                "slots": {slot: None for slot in MANDATORY_SLOTS},
                "deep_dive_count": 0,
                "current_topic": None,
                "last_action": None,
                "history": [],
                "final_analysis": None,
                "analysis_ready": False,
                "recording_ready": False,
                "s3_uri": None,
                "final_duration": 0
            }
        return cls._sessions[call_sid]

    @classmethod
    def update_session(cls, call_sid: str, data: Dict):
        cls._sessions[call_sid] = data
        
    @classmethod
    def clear_session(cls, call_sid: str):
        if call_sid in cls._sessions:
            del cls._sessions[call_sid]

orchestrator_engine = OrchestratorEngine()


class CallbotService(BaseService):
    def __init__(self, callbot_repository: CallbotRepository, llm:LLM, call:CALL, tts:TTS):
        self.callbot_repository= callbot_repository
        self.llm_client = llm
        self.gpt = llm.gpt 
        self.call = call
        self.tts_client = tts
        self.luxia = tts.sultlux
        super().__init__(callbot_repository)
        
    def test(self):
        print('test')
        
    async def _generate_personalized_greeting(self, elderly_name: str, memories: str) -> str:
        """장기 기억을 바탕으로 자연스러운 첫 인사말 생성"""
        name = elderly_name or "어르신"
        prompt = f"""
        역할: 노인 돌봄 AI 상담사 (실버링크)
        상황: 어르신에게 안부 전화를 거는 첫 순간
        어르신 성함: {name}
        과거 기억: {memories}
        
        미션: 과거 기억을 언급하며 아주 반갑고 따뜻하게 첫 인사말 한 문장을 작성하세요.
        - 형식: "안녕하세요! {name}님, 목소리 들으니 정말 반갑네요. 지난번에 [기억 언급] 하셨는데, 그동안 좀 어떠셨어요?"
        - 말투: 해요체 (친절하고 공손하게)
        - 길이: 50자 내외
        """
        try:
            response = await self.llm_client.aclient.chat.completions.create(
                model=configs.INFERENCE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"⚠️ Greeting Generation Error: {e}")
            return f"안녕하세요! {name}님, 목소리 들으니 정말 반갑네요. 잘 지내셨죠?"

    async def build_greeting_gather_twiml(self, call_sid: str, elderly_id: str = None, elderly_name: str = None, phone_number: str = None, initial_mem: str = ""):
        # Reset Session
        CallSession.clear_session(call_sid)
        session = CallSession.get_session(call_sid)
        session["elderly_id"] = elderly_id
        session["elderly_name"] = elderly_name

        # [New] Start Call in Backend to get call_id
        call_id = None
        if elderly_id:
            try:
                p_num = phone_number if phone_number else "unknown"
                call_id = await self._send_start_call_to_backend(elderly_id, elderly_name, p_num)
                if call_id:
                    session["call_id"] = call_id
                    print(f"✅ [Call Start] Assigned Call ID: {call_id}")
                else:
                    print("⚠️ [Call Start] Failed to get Call ID from Backend.")
            except Exception as e:
                print(f"❌ [Call Start] Backend Error: {e}")
        
        # [Improved] 전달받은 초기 기억 활용
        greeting = ""
        if initial_mem:
            print(f"🧠 [Greeting] Using pre-fetched memory: {initial_mem}")
            greeting = await self._generate_personalized_greeting(elderly_name, initial_mem)
        else:
            name_part = f"{elderly_name} 어르신 " if elderly_name else ""
            greeting = f"안녕하세요! {name_part}목소리 들으니 정말 반갑네요. 잘 지내셨죠?"

        # [New] Save First Greeting to Backend
        if call_id:
            try:
                # 첫 인사말 저장
                await self._send_message_to_backend(call_id, "CALLBOT", greeting)
                print("✅ [Call Start] Saved initial greeting to backend.")
            except Exception as e:
                print(f"⚠️ [Call Start] Failed to save greeting: {e}")

        encoded_greeting = urllib.parse.quote(greeting)
        
        # Initial greeting is pure TTS
        stream_url = f"{configs.CALL_CONTROLL_URL}/api/callbot/stream_response?text={encoded_greeting}&amp;call_sid={call_sid}&amp;mode=tts&amp;elderly_id={elderly_id}"

        # [Updated] TwiML 구조 개선: 명확한 Gather 설정 및 힌트 추가
        # bargeIn=true: 말하면 바로 듣기 시작
        # timeout=5: 말 끝난 후 5초 대기
        twiml = f"""
        <Response>
            <Gather input="speech" action="/api/callbot/gather?elderly_id={elderly_id}" method="POST" language="ko-KR" speechTimeout="auto" bargeIn="true" timeout="5" speechModel="phone_call">
                <Play contentType="audio/basic">{stream_url}</Play>
            </Gather>
            <Redirect>/api/callbot/gather?elderly_id={elderly_id}&amp;retry=0</Redirect>
        </Response>
        """
        return twiml
        
    def make_call(self, elderly_id: int, phone_number: str, elderly_name: str):
        """[Improved] 전화를 걸기 전에 기억을 먼저 검색하여 전달"""
        initial_mem = ""
        try:
            mem_user_id = f"elderly_{elderly_id}"
            all_mems = self.get_memories(elderly_id)
            res_list = all_mems.get("results", []) if isinstance(all_mems, dict) else all_mems
            if res_list:
                facts = [m.get('memory', m.get('data', '')) for m in res_list if m]
                initial_mem = facts[-1] if facts else ""
                print(f"🚀 [Pre-Call Search] Found memory: {initial_mem}")
        except Exception as e:
            print(f"⚠️ Pre-Call Search Error: {e}")

        # 통화 연결 (검색된 기억을 인자로 전달)
        return self.call.calling(elderly_id, phone_number, elderly_name, initial_mem)

    # --- Backend Communication (Token based) ---

    async def _login_backend(self):
        """로그인하여 Access Token을 발급받고 configs를 업데이트"""
        admin_id = os.getenv('ADMIN_ID', 'admin01')
        admin_pw = os.getenv('ADMIN_PW', 'admin01')
        
        url = f"{configs.SPRING_BOOT_URL}/api/auth/login"
        payload = {
            "loginId": admin_id,
            "password": admin_pw
        }
        
        print(f"🔑 [Backend] Logging in as '{admin_id}' to {url}...")
        res = await send_data_to_backend(url, payload)
        
        if res and isinstance(res, dict) and "accessToken" in res:
            access_token = res["accessToken"]
            configs.SPRING_BOOT_API_TOKEN = access_token
            print("✅ [Backend] Login Successful! Access Token acquired.")
            return True
        else:
            print(f"❌ [Backend] Login Failed. Response: {res}")
            return False

    async def _get_auth_headers(self):
        """인증 헤더 생성. 토큰이 없으면 로그인을 시도."""
        if not configs.SPRING_BOOT_API_TOKEN:
            await self._login_backend()
            
        headers = {"Content-Type": "application/json"}
        if configs.SPRING_BOOT_API_TOKEN:
            headers["Authorization"] = f"Bearer {configs.SPRING_BOOT_API_TOKEN}"
        return headers

    async def _call_backend_api(self, url: str, payload: dict, method: str = "POST"):
        """백엔드 API 호출을 담당하며, 401 에러 시 자동으로 재로그인 후 1회 재시도합니다."""
        headers = await self._get_auth_headers()
        res = await send_data_to_backend(url, payload, method=method, headers=headers)
        
        # 401 Unauthorized Error Handling
        if res and isinstance(res, dict) and res.get("error") == "UNAUTHORIZED_401":
            print("⚠️ [Backend] Token expired (401). Retrying login...")
            configs.SPRING_BOOT_API_TOKEN = None # Clear token
            await self._login_backend() # Re-login
            
            headers = await self._get_auth_headers() # Get new headers
            print(f"🔄 [Backend] Retrying request to {url}...")
            res = await send_data_to_backend(url, payload, method=method, headers=headers)
        
        return res

    async def _send_start_call_to_backend(self, elderly_id, name, phone_number):
        """통화 시작 API 호출 -> call_id 반환"""
        url = f"{configs.SPRING_BOOT_URL}/api/internal/callbot/calls"
        payload = {
            "elderlyId": int(elderly_id),
            "name": name,
            "phoneNumber": phone_number,
            "callAt": datetime.now().isoformat()
        }
        print(f"🚀 [Call Start] Requesting Call Creation: {payload}")
        res = await self._call_backend_api(url, payload)
        print(f"📥 [Call Start] Backend Response: {res}")
        
        if res and "data" in res and "callId" in res["data"]:
            return res["data"]["callId"]
        return None

    async def _send_message_to_backend(self, call_id: int, speaker: str, content: str, danger: bool = False, danger_reason: str = None):
        """대화 메시지 저장 API 호출 (CALLBOT 또는 ELDERLY)"""
        if not call_id: 
            return
        url = f"{configs.SPRING_BOOT_URL}/api/internal/callbot/calls/{call_id}/messages"
        payload = {
            "speaker": speaker,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "danger": danger,
            "dangerReason": danger_reason
        }
        print(f"📤 [_send_message_to_backend] Sending to {url}...")
        await self._call_backend_api(url, payload)

    async def _send_end_call_to_backend(self, call_id: int, duration: int, summary: str, emotion: str, daily_status: dict, recording_url: str = None):
        """통화 종료 API 호출 (EndCallRequest DTO 일치)"""
        if not call_id: 
            return
        url = f"{configs.SPRING_BOOT_URL}/api/internal/callbot/calls/{call_id}/end"
        
        # 제공해주신 EndCallRequest DTO 구조와 100% 일치시킴
        payload = {
            "callTimeSec": int(duration),   
            "recordingUrl": recording_url,
            "summary": {"content": summary},
            "emotion": {"emotionLevel": emotion},
            "dailyStatus": daily_status
        }
        
        # 디버깅을 위해 전송 직전 데이터를 정제해서 출력
        print(f"📤 [Backend Request] POST {url}")
        print(f"📦 [Payload] {json.dumps(payload, ensure_ascii=False)}")
        
        await self._call_backend_api(url, payload)

    # --- Orchestrator Logic ---
    async def anonymize_text_async(self, text: str) -> str:
        def _run():
            processed_text = text
            if orchestrator_engine.presidio_analyzer and orchestrator_engine.presidio_anonymizer:
                try:
                    results = orchestrator_engine.presidio_analyzer.analyze(
                        text=processed_text,
                        entities=["PHONE_NUMBER", "KOREAN_RRN", "EMAIL_ADDRESS", "PERSON"],
                        language='ko' 
                    )
                    anonymized_result = orchestrator_engine.presidio_anonymizer.anonymize(
                        text=processed_text,
                        analyzer_results=results,
                        operators={
                            "DEFAULT": OperatorConfig("replace", {"new_value": "<REDACTED>"}),
                            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<전화번호>"}),
                            "KOREAN_RRN": OperatorConfig("replace", {"new_value": "<주민번호>"}),
                            "PERSON": OperatorConfig("replace", {"new_value": "<이름>"}),
                        }
                    )
                    processed_text = anonymized_result.text
                except Exception as e:
                    print(f"⚠️ Presidio PII Error: {e}")

            phone_regex = r"01[016789][-.\]s]?\d{3,4}[-.\]s]?\d{4}|0\d{1,2}[-.\]s]?\d{3,4}[-.\]s]?\d{4}"
            processed_text = re.sub(phone_regex, "<전화번호>", processed_text)
            rrn_regex = r"\d{6}[-.\]s]?[1-4]\d{6}"
            processed_text = re.sub(rrn_regex, "<주민번호>", processed_text)
            return processed_text
        return await asyncio.to_thread(_run)

    async def get_intent_async(self, text: str) -> str:
        clean_text = text.strip()
        if len(clean_text) <= 5: 
            return "GENERAL"
        
        emergency_keywords = ["살려줘", "숨이 안", "숨 못", "가슴이 아파", "쓰러졌", "119", "죽을 것 같", "도와줘", "큰일났어"]
        if any(k in clean_text for k in emergency_keywords):
            return "EMERGENCY"

        if orchestrator_engine.local_llm:
            gbnf_grammar = r'root ::= ("General" | "Emergency")'
            grammar = LlamaGrammar.from_string(gbnf_grammar)
            prompt = f"""<|im_start|>system
You are a text classifier. Classify: 'General' or 'Emergency'.
<|im_end|>
<|im_start|>user
Input: "{clean_text}"
Output:<|im_end|>
<|im_start|>assistant
"""
            def _run_llm():
                try:
                    return orchestrator_engine.local_llm(
                        prompt, max_tokens=5, temperature=0.0, stop=["<|im_end|>"], grammar=grammar
                    )
                except Exception as e:
                    print(f"LLM Error: {e}")
                    return None
            output = await asyncio.to_thread(_run_llm)
            if output:
                return output["choices"][0]["text"].strip()
        return "GENERAL"

    async def process_conversation(self, call_sid: str, elderly_id: str, raw_user_input: str) -> Dict[str, Any]:
        """
        Main Orchestrator Logic: PII -> Intent -> Unified LLM -> Memory
        Returns: { "intent": str, "response": str, "session": dict }
        """
        from app.util.log import log_detailed
        start_total = time.time()
        session = CallSession.get_session(call_sid)
        timeouts = {}
        
        # [Updated] 대화 턴 수 계산 (현재 턴 포함) - 맨 위로 이동
        current_turn_count = len(session.get("history", [])) + 1
        
        # [Updated] Use call_id if available (registered at start)
        call_id = session.get("call_id")
        print(f"🕵️ [Process Conversation] CallSID: {call_sid} | Session CallID: {call_id}")
        
        # 1. PII Filtering
        timeouts['stt_processing'] = 'External (Twilio)'
        t_pii_start = time.time()
        user_input = await self.anonymize_text_async(raw_user_input)
        timeouts['pii_filtering'] = time.time() - t_pii_start
        
        # [New] Memory Retrieval
        t_mem_search_start = time.time()
        relevant_memories_text = "No relevant memories."
        if orchestrator_engine.memory:
            try:
                # elderly_id가 int일 경우를 대비해 확실히 str로 변환
                str_eid = str(elderly_id)
                mem_user_id = f"elderly_{str_eid}"
                
                print(f"🔍 [Memory Search] Looking for memories of: {mem_user_id} (Turn: {current_turn_count})")
                
                # 1단계: 일단 해당 사용자의 모든 기억을 다 긁어옴 (초반 턴 전수 검색)
                all_mems = orchestrator_engine.memory.get_all(user_id=mem_user_id)
                
                # Mem0 결과 구조 정규화 (버전 대응)
                results_list = []
                if isinstance(all_mems, dict) and "results" in all_mems:
                    results_list = all_mems["results"]
                elif isinstance(all_mems, list):
                    results_list = all_mems
                
                if results_list:
                    facts = [m.get('memory', m.get('data', '')) for m in results_list if m]
                    relevant_memories_text = "\n".join([f"- {f}" for f in facts if f])
                    print(f"✅ [Memory Found] Success! {len(results_list)} facts retrieved for {mem_user_id}")
                else:
                    # 2단계: get_all 실패 시 유사도 검색으로 한 번 더 시도
                    print(f"ℹ️ [Memory Search] get_all empty, trying semantic search...")
                    mem_results = await asyncio.to_thread(
                        orchestrator_engine.memory.search, 
                        user_input, 
                        user_id=mem_user_id, 
                        limit=3
                    )
                    if mem_results:
                        # 결과가 딕셔너리 리스트인지, 문자열 리스트인지 대응
                        extracted_facts = []
                        for m in mem_results:
                            if isinstance(m, dict):
                                extracted_facts.append(m.get('memory', m.get('data', str(m))))
                            else:
                                extracted_facts.append(str(m))
                        
                        relevant_memories_text = "\n".join([f"- {f}" for f in extracted_facts if f])
                        print(f"✅ [Memory Found] Semantic search success!")
                
                if relevant_memories_text != "No relevant memories.":
                    print("="*60)
                    print(f"🧠 [활용될 기억 데이터]\n{relevant_memories_text}")
                    print("="*60)
                else:
                    print(f"📭 [Memory Search] No memories found for {mem_user_id}")
                    
            except Exception as e:
                print(f"❌ [Memory Search] Error: {e}")
                traceback.print_exc()
        timeouts['memory_search'] = time.time() - t_mem_search_start
        
        # 2. Intent Classification
        t_intent_start = time.time()
        intent = await self.get_intent_async(user_input)
        timeouts['intent_check'] = time.time() - t_intent_start
        
        # [Updated] Send User Message to Backend
        if call_id:
            asyncio.create_task(self._send_message_to_backend(call_id, "ELDERLY", raw_user_input, danger=(intent=="EMERGENCY")))
        
        if intent == "EMERGENCY":
            final_response = "어르신, 지금 바로 119에 도움을 요청하겠습니다! 잠시만 기다려주세요."
            
            # Update History for Emergency
            if "history" not in session: 
                session["history"] = []
            session["history"].append({"user": user_input, "ai": final_response})
            
            timeouts['total_processing'] = time.time() - start_total
            log_detailed(raw_user_input, user_input, final_response, "EMERGENCY_STOP", "None", 0, {}, timeouts, call_sid)
            return {
                "intent": "EMERGENCY",
                "response": final_response,
                "session": session
            }
            
        # 3. Unified LLM (Logic & Generation)
        t_llm_start = time.time()
        # Calculate Logic State
        current_missing = [s for s, v in session["slots"].items() if v is None]
        target_slot = current_missing[0] if current_missing else "작별 인사 및 건강 당부"
        
        exit_keywords = ["그만", "다음", "됐어", "종료", "아니","끊어"]
        clean_input = user_input.strip()
        force_slot_question = any(k in clean_input for k in exit_keywords) or (session["deep_dive_count"] >= MAX_DEEP_DIVE_TURNS)
        
        if not current_missing:
            force_slot_question = False
            target_slot = "작별 인사 및 건강 당부"

        unified_system_prompt = f"""
    Role: Elderly Care AI (실버링크).
    
    [Long-term Memory (Previous Conversations)]
    {relevant_memories_text}
    
    [Current Context]
    - Turn: {current_turn_count}
    - Missing Slots: {current_missing}
    
    [Task: Dialogue Generation Strategy]
    
    **PHASE 1: Rapport Building (Turn 1~2)**
    - Check `Long-term Memory` content:
      - **CASE A: Memories EXIST (Not "No relevant memories.")**
        - **Rule**: Mention the memory in `acknowledgment`.
        - **Format**: 
          - `acknowledgment`: "Reaction + Memory Recall" (NO QUESTIONS HERE!)
          - `question`: "Follow-up Question based on Memory"
        - **Example**: 
          - Ack: "목소리가 밝으셔서 다행이에요! 지난번에 허리가 아파서 고생하셨다고 했는데,"
          - Q: "오늘은 좀 괜찮으세요?"
      
      - **CASE B: NO Memories (Empty or "No relevant memories.")**
        - **Rule**: Just empathy. Do NOT invent past events.
        - **Format**:
          - `acknowledgment`: "Warm reaction" (NO QUESTIONS HERE!)
          - `question`: "Simple well-being question"
        - **Example**:
          - Ack: "목소리가 밝으셔서 다행이에요!"
          - Q: "오늘 컨디션은 좀 어떠세요?"
    
    **PHASE 2: Slot Filling (Turn 3+)**
    - Only AFTER discussing the memory enough, start asking about '{target_slot}'.
    - Try to connect the slot question naturally to the previous topic.
    
    [Task: Information Extraction]
    - Even in Phase 1, if the user mentions any slot info (e.g., "밥 먹었어"), extract it immediately.
    """
        
        try:
            # Construct Messages with History
            messages = [{"role": "system", "content": unified_system_prompt}]
            recent_history = session.get("history", [])[-4:]
            for turn in recent_history:
                messages.append({"role": "user", "content": turn["user"]})
                messages.append({"role": "assistant", "content": turn["ai"]})
            messages.append({"role": "user", "content": user_input})

            completion = await self.llm_client.aclient.beta.chat.completions.parse(
                model=configs.INFERENCE_MODEL,
                messages=messages,
                response_format=UnifiedAnalysisResult,
                temperature=1.0,
                max_tokens=300, 
            )
            result = completion.choices[0].message.parsed
            timeouts['unified_llm_processing'] = time.time() - t_llm_start
            
            final_response = f"{result.dialogue_decision.acknowledgment} {result.dialogue_decision.question}"

            # [Updated] Send Bot Message to Backend
            if call_id:
                asyncio.create_task(self._send_message_to_backend(call_id, "CALLBOT", final_response))    
            
            # Update Slots
            for item in result.extracted_slots:
                if item.value and str(item.value).lower() not in ["null", "none", "없음"]:
                    session["slots"][item.category] = item.value

            # Update Logic State
            if target_slot in session["slots"] and session["slots"][target_slot] is not None:
                session["deep_dive_count"] += 1
            elif result.dialogue_decision.next_action == "DEEP_DIVE" and session["deep_dive_count"] > 0:
                session["deep_dive_count"] += 1
            else:
                session["deep_dive_count"] = 0
            
            session["current_topic"] = result.dialogue_decision.topic
            
            next_missing = [s for s, v in session["slots"].items() if v is None]
            next_target_slot = next_missing[0] if next_missing else "작별 인사 및 건강 당부"

            # Update History
            if "history" not in session:
                session["history"] = []
            session["history"].append({"user": user_input, "ai": final_response})
            
            timeouts['total_processing'] = time.time() - start_total
            
            filled_slots_dict = {s: v for s, v in session["slots"].items() if v is not None}
            log_detailed(
                raw_user_input, user_input, final_response, 
                target_slot, next_target_slot, session["deep_dive_count"], filled_slots_dict, 
                timeouts, call_sid
            )
            
            CallSession.update_session(call_sid, session)
            
            return {
                "intent": "GENERAL",
                "response": final_response,
                "session": session
            }

        except Exception as e:
            timeouts['unified_llm_processing'] = time.time() - t_llm_start
            timeouts['total_processing'] = time.time() - start_total
            print(f"Unified LLM Error: {e}")
            traceback.print_exc()
            return {
                "intent": "GENERAL",
                "response": "죄송해요, 잠시 제 귀가 어두웠나봐요. 다시 말씀해 주시겠어요?",
                "session": session
            }

    async def _summarize_conversation(self, history: List[Dict]) -> str:
        """Generates a concise summary of the conversation using OpenAI."""
        if not history: 
            return "대화 내용 없음."
        
        conversation_text = "\n".join([f"User: {turn['user']}\nAI: {turn['ai']}" for turn in history])
        
        prompt = f"""
        Summarize the following conversation with an elderly person in Korean.
        Focus on key information: Meal status, Health condition, Mood, and Schedule.
        Keep it concise (1-2 sentences).
        
        [Conversation]
        {conversation_text}
        """
        
        try:
            response = await self.llm_client.aclient.chat.completions.create(
                model=configs.INFERENCE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Summary Generation Error: {e}")
            return "요약 실패"

    async def _analyze_sentiment_with_llm(self, text: str) -> Optional[str]:
        """Analyzes sentiment (GOOD, BAD, NORMAL) using LLM."""
        if not text: return None
        
        prompt = f"""
        Analyze the sentiment of the following text regarding health or sleep condition.
        Classify into one of three categories: "GOOD", "BAD", "NORMAL".
        
        Text: "{text}"
        
        Output only the category name.
        """
        try:
            response = await self.llm_client.aclient.chat.completions.create(
                model=configs.INFERENCE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.0
            )
            result = response.choices[0].message.content.strip().upper()
            if "GOOD" in result: return "GOOD"
            if "BAD" in result: return "BAD"
            if "NORMAL" in result: return "NORMAL"
            return None
        except Exception as e:
            print(f"Sentiment Analysis Error: {e}")
            return None

    async def _analyze_meal_status_with_llm(self, text: str) -> Optional[bool]:
        """Analyzes meal status (True/False) using LLM."""
        if not text: return None
        
        prompt = f"""
        Determine if the user has eaten a meal based on the text.
        Text: "{text}"
        
        If they ate (or are full), output "TRUE".
        If they did not eat (or skipped), output "FALSE".
        If it's unclear or not mentioned, output "UNKNOWN".
        """
        try:
            response = await self.llm_client.aclient.chat.completions.create(
                model=configs.INFERENCE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=5,
                temperature=0.0
            )
            result = response.choices[0].message.content.strip().upper()
            if "TRUE" in result: return True
            if "FALSE" in result: return False
            return None
        except Exception as e:
            print(f"Meal Analysis Error: {e}")
            return None

    async def _map_slots_to_daily_status(self, slots: Dict) -> Dict:
        """Maps slots to DailyStatusRequest format (Async with LLM)"""
        # 1. Meal Analysis with LLM
        meal_text = slots.get("식사 여부")
        meal_taken = await self._analyze_meal_status_with_llm(meal_text)
        
        # 2. Status Analysis with LLM
        health_text = slots.get("건강 상태")
        sleep_text = slots.get("수면 상태")
        
        health_status = await self._analyze_sentiment_with_llm(health_text)
        sleep_status = await self._analyze_sentiment_with_llm(sleep_text)
        
        return {
            "mealTaken": meal_taken,
            "healthStatus": health_status,
            "healthDetail": health_text or "",
            "sleepStatus": sleep_status,
            "sleepDetail": sleep_text or ""
        }

    async def _analyze_overall_emotion(self, history: List[Dict]) -> str:
        """Infers overall emotion from conversation history using LLM"""
        if not history: 
            return None
        
        conversation_text = "\n".join([f"User: {turn['user']}\nAI: {turn['ai']}" for turn in history])
        
        prompt = f"""
        Analyze the overall emotional state of the elderly user in this conversation.
        Classify into one of: "GOOD", "NORMAL", "BAD", "DEPRESSED".
        
        [Conversation]
        {conversation_text}
        
        Output only the category name.
        """
        
        try:
            response = await self.llm_client.aclient.chat.completions.create(
                model=configs.INFERENCE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.0
            )
            result = response.choices[0].message.content.strip().upper()
            valid_emotions = ["GOOD", "NORMAL", "BAD", "DEPRESSED"]
            for emotion in valid_emotions:
                if emotion in result:
                    return emotion
            return "NORMAL"
        except Exception as e:
            print(f"Emotion Analysis Error: {e}")
            return "NORMAL"

    async def _upload_recordings(self, call_sid: str) -> Optional[tuple[str, int]]:
        """Twilio API를 통해 녹음 파일을 찾아 S3에 업로드하고 (URL, 시간) 반환"""
        def _sync_upload():
            try:
                twilio_client = TwilioClient(configs.TWILIO_SID, configs.TWILIO_TOKEN)
                
                # 녹음 파일이 생성될 때까지 최대 10초간 대기 (2초 간격 5회)
                recordings = None
                for i in range(5):
                    recordings = twilio_client.recordings.list(call_sid=call_sid, limit=1)
                    if recordings:
                        break
                    print(f"⏳ [Recording] Waiting for Twilio to process recording... ({i+1}/5)")
                    time.sleep(2)
                
                if not recordings:
                    print(f"⚠️ [Recording] No recordings found for {call_sid}")
                    return None, 0

                record = recordings[0]
                recording_sid = record.sid
                duration = getattr(record, 'duration', 0)
                media_url = f"https://api.twilio.com/2010-04-01/Accounts/{configs.TWILIO_SID}/Recordings/{recording_sid}.mp3"
                
                print(f"📥 [Recording] Downloading {media_url}...")
                response = requests.get(media_url, auth=(configs.TWILIO_SID, configs.TWILIO_TOKEN))
                
                if response.status_code == 200:
                    s3_client = boto3.client(
                        "s3",
                        region_name=configs.AWS_REGION,
                        aws_access_key_id=configs.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=configs.AWS_SECRET_ACCESS_KEY
                    )
                    file_key = f"private/voice/{recording_sid}.mp3"
                    s3_client.put_object(
                        Bucket=configs.AWS_S3_BUCKET_NAME,
                        Key=file_key,
                        Body=response.content,
                        ContentType="audio/mpeg"
                    )
                    s3_uri = f"s3://{configs.AWS_S3_BUCKET_NAME}/{file_key}"
                    print(f"✅ [Recording] S3 Upload Success: {s3_uri}")
                    return s3_uri, int(duration)
                return None, 0
            except Exception as e:
                print(f"❌ [Recording] Error: {e}")
                return None, 0
        
        return await asyncio.to_thread(_sync_upload)

    async def _perform_final_backend_update(self, call_sid: str, session: dict):
        """세션에 모인 모든 데이터(분석+녹음)를 백엔드에 최종 전송"""
        call_id = session.get("call_id")
        final_data = session.get("final_analysis")
        s3_uri = session.get("s3_uri")
        duration = session.get("final_duration", 0)

        if not call_id or not final_data:
            print(f"⚠️ [Final Update] Missing data for Call {call_sid}. ID: {call_id}, Analysis: {bool(final_data)}")
            return

        print(f"🚀 [Final Update] Sending to Backend: CallID={call_id}, Duration={duration}, S3={s3_uri}")
        await self._send_end_call_to_backend(
            call_id, 
            int(duration), 
            final_data["summary"], 
            final_data["emotion"], 
            final_data["daily_status"], 
            s3_uri
        )
        
        # 전송 완료 후 세션 삭제
        CallSession.clear_session(call_sid)
        print(f"✅ [Final Update] Call {call_id} fully processed and session cleared.")

    async def upload_recording_from_url(self, recording_url: str, recording_sid: str, call_sid: str = None, duration: int = None) -> Optional[str]:
        """Twilio Callback에서 받은 URL로 S3에 업로드 후, 분석 결과가 있다면 백엔드 전송"""
        def _sync_upload():
            try:
                media_url = f"{recording_url}.mp3"
                print(f"📥 [Callback Upload] Downloading {media_url}...")
                response = requests.get(media_url) 
                if response.status_code == 200:
                    s3_client = boto3.client("s3", region_name=configs.AWS_REGION, 
                                           aws_access_key_id=configs.AWS_ACCESS_KEY_ID, 
                                           aws_secret_access_key=configs.AWS_SECRET_ACCESS_KEY)
                    file_key = f"private/voice/{recording_sid}.mp3"
                    s3_client.put_object(Bucket=configs.AWS_S3_BUCKET_NAME, Key=file_key, 
                                       Body=response.content, ContentType="audio/mpeg")
                    return f"s3://{configs.AWS_S3_BUCKET_NAME}/{file_key}"
                return None
            except Exception as e:
                print(f"❌ [Callback Upload] S3 Error: {e}")
                return None

        s3_uri = await asyncio.to_thread(_sync_upload)
        
        if call_sid:
            session = CallSession.get_session(call_sid)
            session["s3_uri"] = s3_uri
            
            # 콜백으로 온 duration이 있다면 이를 최우선으로 사용 (0보다 클 때만)
            if duration is not None and int(duration) > 0:
                session["final_duration"] = int(duration)
                print(f"⏱️ [Callback Upload] Duration updated to recording length: {duration}s")
            
            session["recording_ready"] = True
            
            # finalize_call이 이미 분석을 마쳤다면 최종 전송
            if session.get("analysis_ready"):
                await self._perform_final_backend_update(call_sid, session)
            else:
                print("⏳ [Callback Upload] Recording ready, waiting for analysis to complete...")
        
        return s3_uri

    async def finalize_call(self, call_sid: str, duration: str = "0"):
        """통화 종료 시 분석 수행 후, 녹음이 준비되었다면 백엔드 전송"""
        session = CallSession.get_session(call_sid)
        history = session.get("history", [])
        call_id = session.get("call_id")
        elderly_id = session.get("elderly_id")
        
        print(f"🏁 [Finalize Call] Sid: {call_sid}, CallID: {call_id}, History: {len(history)} turns")

        if not call_id:
            print(f"⚠️ [Finalize Call] No call_id found. Clearing session.")
            CallSession.clear_session(call_sid)
            return

        # 1. 대화 분석 (요약, 감정, 상태)
        if history:
            summary = await self._summarize_conversation(history)
            daily_status = await self._map_slots_to_daily_status(session.get("slots", {}))
            emotion = await self._analyze_overall_emotion(history)
            
            # [Updated] Long-term Memory 저장 (어르신 고유 ID 사용)
            if orchestrator_engine.memory:
                mem_user_id = f"elderly_{elderly_id}"
                print(f"📞 [Call End] Saving history to long-term memory for {mem_user_id}")
                await self._save_full_history_async(mem_user_id, history)
        else:
            summary = "통화 내용 없음 (짧은 통화)"
            # 값이 없으면 None으로 전송 (백엔드에서 null 처리)
            daily_status = {
                "mealTaken": None, 
                "healthStatus": None, 
                "healthDetail": None, 
                "sleepStatus": None, 
                "sleepDetail": None
            }
            emotion = "NORMAL" # 감정은 분석 불가 시 NORMAL 유지 (또는 None)

        # 2. 분석 결과 세션에 저장
        session["final_analysis"] = {
            "summary": summary,
            "daily_status": daily_status,
            "emotion": emotion
        }
        session["analysis_ready"] = True
        
        # 콜백에서 아직 정확한 시간이 안 왔거나 현재 저장된 시간이 0인 경우에만 업데이트
        new_duration = 0
        try: 
            new_duration = int(duration)
        except Exception: 
            pass
        
        if (session.get("final_duration") or 0) == 0 and new_duration > 0:
            session["final_duration"] = new_duration
            print(f"⏱️ [Finalize Call] Duration set from Call Status: {new_duration}s")

        # 3. 녹음 콜백이 이미 도착했는지 확인 후 전송
        if session.get("recording_ready"):
            await self._perform_final_backend_update(call_sid, session)
        else:
            print("⏳ [Finalize Call] Analysis ready, waiting for Twilio Recording Callback...")
            # 안전장치: 만약 30초 내에 녹음 콜백이 안 오면 분석 결과만이라도 전송하도록 예약 가능 (생략 가능)
            async def _safety_fallback():
                await asyncio.sleep(30)
                active_session = CallSession.get_session(call_sid)
                if active_session.get("analysis_ready") and not active_session.get("recording_ready"):
                    print("🚨 [Safety Fallback] Recording callback timed out. Sending analysis only.")
                    await self._perform_final_backend_update(call_sid, active_session)
            asyncio.create_task(_safety_fallback())

    def get_memories(self, elderly_id: int) -> List[Dict]:
        """특정 어르신의 모든 기억 조회"""
        if not orchestrator_engine.memory:
            return []
        
        # 디버깅: 현재 사용 중인 실제 DB 경로 출력
        try:
            actual_path = getattr(orchestrator_engine.memory.vector_store.client, "_path", "Unknown")
            print(f"🔍 [Mem0 Debug] Active DB Path: {actual_path}")
        except: pass

        try:
            user_id = f"elderly_{elderly_id}"
            return orchestrator_engine.memory.get_all(user_id=user_id)
        except Exception as e:
            print(f"❌ Memory Fetch Error: {e}")
            return []

    async def _save_full_history_async(self, user_id: str, history: List[Dict]):
        """Helper to save summarized facts to Mem0 for better update performance"""
        if not orchestrator_engine.memory: 
            return
            
        def _batch_save():
            print(f"💾 [Mem0] Extracting facts and updating for {user_id}...")
            try:
                # 1. 이번 대화의 내용을 텍스트로 병합
                conversation_text = ""
                for turn in history:
                    conversation_text += f"사용자: {turn['user']}\n상담사: {turn['ai']}\n"
                
                # 2. Mem0 add 호출 (timestamp를 제거하여 동일 주제 업데이트 유도)
                res = orchestrator_engine.memory.add(
                    conversation_text, 
                    user_id=user_id,
                    metadata={"source": "callbot"} # 고정된 메타데이터 사용
                )
                print(f"✅ [Mem0] Memory update success: {res}")

            except Exception as e:
                print(f"❌ [Mem0] Update Failed: {e}")
                traceback.print_exc()
        
        await asyncio.to_thread(_batch_save)
    # --- Audio Utils ---
    def wav_to_ulaw(self, wav_bytes: bytes) -> bytes:
        """Converts WAV bytes to raw Mu-law audio (8kHz, Mono) without headers"""
        try:
            import audioop
        except ImportError:
            print("Audioop module is not available. Audio conversion disabled.")
            return b""

        try:
            with wave.open(io.BytesIO(wav_bytes), 'rb') as wav_file:
                n_channels = wav_file.getnchannels()
                framerate = wav_file.getframerate()
                sampwidth = wav_file.getsampwidth()
                n_frames = wav_file.getnframes()
                data = wav_file.readframes(n_frames)

                if n_channels > 1:
                    data = audioop.tomono(data, sampwidth, 0.5, 0.5)
                
                if framerate != 8000:
                    data, _ = audioop.ratecv(data, sampwidth, 1, framerate, 8000, None)

                return audioop.lin2ulaw(data, sampwidth)
        except Exception as e:
            print(f"Audio Conv Error: {e}")
            return b""

    async def generate_tts_stream(self, text: str):
        content = await self.tts_client.asultlux(text)
        return content

    # --- Streaming Logic (Modified for TTS only) ---
    async def ai_response_generator(self, text: str, history: List[dict], mode: str = "chat", start_ts: float = 0.0, elderly_id: str = None) -> AsyncGenerator[bytes, None]:
        """
        Sentence-level TTS Streaming: Splits text and streams audio for each sentence immediately.
        """
        if not text: 
            return
        
        try:
            sentences = re.split(r'(?<=[.!?])\s*', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if not sentences:
                sentences = [text]
                
            print(f"🔊 [TTS Streaming] Processing {len(sentences)} sentences from text len {len(text)}")
            
            for i, sentence in enumerate(sentences):
                if len(sentence) < 2 and sentence in [".", "!", "?", ","]:
                    continue
                    
                t_tts_start = time.time()
                try:
                    wav_data = await self.generate_tts_stream(sentence)
                    tts_duration = time.time() - t_tts_start
                    
                    if wav_data:
                        print(f"🔊 [TTS Gen {i+1}/{len(sentences)}]: {tts_duration:.3f}s | {len(wav_data)} bytes | '{sentence[:20]}...' ")
                        
                        if i == 0 and start_ts > 0:
                            first_byte_latency = time.time() - start_ts
                            print(f"⏱️ [Latency] Start to First Audio: {first_byte_latency:.3f}s")
                        
                        ulaw_data = self.wav_to_ulaw(wav_data)
                        if ulaw_data:
                            yield ulaw_data
                        else:
                            print(f"⚠️ WAV to ULAW conversion failed for sentence {i+1}")
                    else:
                        print(f"⚠️ TTS Generation failed (empty) for sentence {i+1}")
                        
                except Exception as e:
                    print(f"❌ Error processing sentence {i+1}: {e}")
                    continue

            if start_ts > 0:
                total_latency = time.time() - start_ts
                print(f"⏱️ [Latency] Total Process Time: {total_latency:.3f}s")
                
        except Exception as e:
            print(f"❌ Critical Error in ai_response_generator: {e}")
            traceback.print_exc()