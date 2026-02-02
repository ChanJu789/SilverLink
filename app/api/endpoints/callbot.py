import logging
import traceback
from typing import Dict, List
from datetime import datetime
import uuid

import urllib.parse
from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from app.core.container import Container
from app.core.middleware import inject_callbot
from app.callbot.services.callbot_service import CallbotService
from app.queue.sqs_client import SQSClient
from app.queue.message_schema import CallRequestMessage
from app.core.config import configs

# 로깅 설정
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 콘솔 핸들러 추가 (없으면)
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

router = APIRouter(
    prefix="/callbot",
    tags=["callbot"],
)

# Global In-Memory History (Key: CallSid, Value: List[dict])
# Note: In a production environment with multiple instances, use Redis or a Database.
conversation_history: Dict[str, List[dict]] = {}


# Request Schema for SQS Call Scheduling
class CallScheduleRequest(BaseModel):
    """통화 스케줄 요청 스키마"""
    schedule_id: int = Field(..., description="통화 스케줄 ID")
    elderly_id: int = Field(..., description="어르신 ID")
    elderly_name: str = Field(..., description="어르신 이름")
    phone_number: str = Field(..., description="전화번호 (E.164 형식: +821012345678)")
    scheduled_time: datetime = Field(..., description="예약된 통화 시간")
    
    class Config:
        json_schema_extra = {
            "example": {
                "schedule_id": 1,
                "elderly_id": 100,
                "elderly_name": "홍길동",
                "phone_number": "+821012345678",
                "scheduled_time": "2026-01-29T10:00:00"
            }
        }

@router.get("")
@inject_callbot
def get_post_list(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    logger.info("🔍 [GET /callbot] 테스트 엔드포인트 호출")
    try:
        result = service.test()
        logger.info("✅ [GET /callbot] 테스트 완료")
        return result
    except Exception as e:
        logger.error(f"❌ [GET /callbot] 에러 발생: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/call")
@inject_callbot
def get_call(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    logger.info("📞 [GET /callbot/call] 전화 걸기 요청")
    try:
        result = service.make_call()
        logger.info("✅ [GET /callbot/call] 전화 걸기 성공")
        return result
    except Exception as e:
        logger.error(f"❌ [GET /callbot/call] 에러 발생: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule-call")
@inject_callbot
def schedule_call(
    request: CallScheduleRequest,
    sqs_client: SQSClient = Depends(Provide[Container.sqs_client])
):
    """
    통화 스케줄 생성 및 SQS 큐에 발행
    
    Spring Boot BE에서 호출하거나, 직접 통화를 예약할 때 사용합니다.
    메시지는 SQS 큐에 발행되고, Worker가 비동기로 처리합니다.
    """
    logger.info("="*50)
    logger.info("📅 [POST /callbot/schedule-call] 통화 스케줄 요청")
    logger.info(f"   schedule_id: {request.schedule_id}")
    logger.info(f"   elderly_name: {request.elderly_name}")
    logger.info(f"   phone_number: {request.phone_number}")
    logger.info(f"   scheduled_time: {request.scheduled_time}")
    
    try:
        # 1. SQS 메시지 생성
        message = CallRequestMessage(
            message_id=str(uuid.uuid4()),
            schedule_id=request.schedule_id,
            elderly_id=request.elderly_id,
            elderly_name=request.elderly_name,
            phone_number=request.phone_number,
            scheduled_time=request.scheduled_time,
            retry_count=0
        )
        
        logger.debug(f"📝 생성된 메시지: {message.model_dump_json()}")
        
        # 2. SQS 큐에 발행
        message_id = sqs_client.publish(message)
        
        if message_id:
            logger.info(f"✅ [POST /callbot/schedule-call] SQS 발행 성공")
            logger.info(f"   SQS Message ID: {message_id}")
            logger.info("="*50)
            
            return {
                "status": "queued",
                "message_id": message_id,
                "schedule_id": request.schedule_id,
                "elderly_name": request.elderly_name,
                "scheduled_time": request.scheduled_time.isoformat(),
                "queue_url": sqs_client.queue_url
            }
        else:
            logger.error("❌ [POST /callbot/schedule-call] SQS 발행 실패")
            logger.error("="*50)
            raise HTTPException(
                status_code=500,
                detail="Failed to publish message to SQS"
            )
            
    except Exception as e:
        logger.error("="*50)
        logger.error(f"❌ [POST /callbot/schedule-call] 에러 발생!")
        logger.error(f"에러 타입: {type(e).__name__}")
        logger.error(f"에러 메시지: {e}")
        logger.error(f"스택 트레이스:\n{traceback.format_exc()}")
        logger.error("="*50)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule call: {str(e)}"
        )

    
@router.api_route("/voice", methods=["POST"])
@inject_callbot
async def voice(
    request: Request,
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """전화가 처음 연결되었을 때 실행"""
    logger.info("="*50)
    logger.info("📞 [POST /callbot/voice] Voice 엔드포인트 호출됨")
    
    try:
        # 1. Form 데이터 파싱
        logger.debug("1️⃣ Form 데이터 파싱 중...")
        form_data = await request.form()
        call_sid = form_data.get("CallSid", "unknown")
        logger.info(f"📋 CallSid: {call_sid}")
        logger.debug(f"전체 Form 데이터: {dict(form_data)}")
        
        # 2. 대화 히스토리 초기화
        logger.debug("2️⃣ 대화 히스토리 초기화...")
        conversation_history[call_sid] = []
        
        # 3. TwiML 생성
        logger.debug("3️⃣ TwiML 생성 중...")
        logger.debug(f"CALL_CONTROLL_URL: {configs.CALL_CONTROLL_URL}")
        
        twiml = service.build_greeting_gather_twiml(call_sid=call_sid)
        logger.debug(f"생성된 TwiML:\n{twiml[:500]}..." if len(twiml) > 500 else f"생성된 TwiML:\n{twiml}")
        
        logger.info("✅ [POST /callbot/voice] 성공적으로 TwiML 반환")
        logger.info("="*50)
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        logger.error("="*50)
        logger.error(f"❌ [POST /callbot/voice] 에러 발생!")
        logger.error(f"에러 타입: {type(e).__name__}")
        logger.error(f"에러 메시지: {e}")
        logger.error(f"스택 트레이스:\n{traceback.format_exc()}")
        logger.error("="*50)
        raise HTTPException(status_code=500, detail=f"Voice 처리 실패: {str(e)}")

@router.get("/stream_response")
@inject_callbot
async def stream_response(
    text: str,
    call_sid: str = None,
    mode: str = "chat",
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """Streams audio chunks dynamically generated from LLM -> TTS"""
    logger.info(f"🎵 [GET /callbot/stream_response] 스트림 응답 요청")
    logger.debug(f"   text: {text[:100]}..." if len(text) > 100 else f"   text: {text}")
    logger.debug(f"   call_sid: {call_sid}, mode: {mode}")
    
    try:
        if call_sid:
            history = conversation_history.get(call_sid, [])
        else:
            history = []
        logger.debug(f"   history 길이: {len(history)}")
        
        return StreamingResponse(
            service.ai_response_generator(text, history, mode),
            media_type="audio/basic",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Accel-Buffering": "no" # Disable Nginx buffering if any
            }
        )
    except Exception as e:
        logger.error(f"❌ [GET /callbot/stream_response] 에러: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    
@router.api_route("/gather", methods=["POST"])
@inject_callbot
async def gather(
    request: Request,
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """Twilio SpeechResult Handler"""
    logger.info("🎤 [POST /callbot/gather] Gather 엔드포인트 호출")
    
    try:
        form_data = await request.form()
        speech_result = form_data.get("SpeechResult")
        call_sid = form_data.get("CallSid")
        
        logger.debug(f"   CallSid: {call_sid}")
        logger.debug(f"   SpeechResult: {speech_result}")
            
        if not speech_result:
            logger.warning("   ⚠️ SpeechResult 없음, 재시도 TwiML 반환")
            twiml = """
            <Response>
                <Gather input="speech" action="/api/callbot/gather" method="POST" language="ko-KR" speechTimeout="auto">
                </Gather>
            </Response>
            """
            return Response(content=twiml, media_type="application/xml")

        logger.info(f"🎤 사용자 발화: {speech_result}")
        
        # Update History
        if call_sid:
            if call_sid not in conversation_history:
                conversation_history[call_sid] = []
            conversation_history[call_sid].append({"role": "user", "content": speech_result})
        
        # We pass the user text to the streaming endpoint via query param
        encoded_text = urllib.parse.quote(speech_result)
        # Ensure call_sid is also passed
        stream_url = f"{configs.CALL_CONTROLL_URL}/api/callbot/stream_response?text={encoded_text}&amp;call_sid={call_sid}"

        # Return TwiML that plays the stream
        # bargeIn="true" allows the user to interrupt the stream immediately
        twiml = f"""
        <Response>
            <Gather input="speech" action="/api/callbot/gather" method="POST" language="ko-KR" speechTimeout="auto" bargeIn="true">
                <Play contentType="audio/basic">{stream_url}</Play>
            </Gather>
        </Response>
        """
        logger.info("✅ [POST /callbot/gather] TwiML 응답 반환")
        return Response(content=twiml, media_type="application/xml")
    except Exception as e:
        logger.error(f"❌ [POST /callbot/gather] 에러 발생: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
