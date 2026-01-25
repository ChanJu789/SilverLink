from typing import Dict, List
from dependency_injector.wiring import Provide
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response, StreamingResponse

from app.core.container import Container
from app.core.middleware import inject_callbot
from app.callbot.services.callbot_service import CallbotService
from app.core.config import configs

import urllib.parse

router = APIRouter(
    prefix="/callbot",
    tags=["callbot"],
)

# Global In-Memory History (Key: CallSid, Value: List[dict])
# Note: In a production environment with multiple instances, use Redis or a Database.
conversation_history: Dict[str, List[dict]] = {}

@router.get("")
@inject_callbot
def get_post_list(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    return service.test()
    
@router.get("/call")
@inject_callbot
def get_call(
    service: CallbotService = Depends(Provide[Container.callbot_service]),
):
    return service.make_call()

    
@router.api_route("/voice", methods=["POST"])
@inject_callbot
async def voice(
    request: Request,
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """전화가 처음 연결되었을 때 실행"""
    import os
    import traceback
    
    log_path = "logs/debug_voice.log"
    os.makedirs("logs", exist_ok=True)
    
    with open(log_path, "a", encoding="utf-8") as f:
        f.write("--- Voice Endpoint Hit ---\n")
    
    try:
        # Initialize history for this call
        form_data = await request.form()
        call_sid = form_data.get("CallSid", "unknown")
        
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"CallSid: {call_sid}\n")
        
        conversation_history[call_sid] = []
        
        twiml = service.build_greeting_gather_twiml(call_sid=call_sid)
        
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"Generated TwiML: {twiml}\n")
            
        return Response(content=twiml, media_type="application/xml")
    except Exception as e:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"ERROR: {e}\n")
            f.write(traceback.format_exc() + "\n")
        raise e

@router.get("/stream_response")
@inject_callbot
async def stream_response(
    text: str,
    call_sid: str = None,
    mode: str = "chat",
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """Streams audio chunks dynamically generated from LLM -> TTS"""
    # history = conversation_history.get(call_sid, []) if call_sid else []
    if call_sid:
        history = conversation_history.get(call_sid, [])
    else:
        history = []
    
    return StreamingResponse(
        service.ai_response_generator(text, history, mode),
        media_type="audio/basic",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Accel-Buffering": "no" # Disable Nginx buffering if any
        }
    )
    
@router.api_route("/gather", methods=["POST"])
@inject_callbot
async def gather(
    request: Request,
    service: CallbotService = Depends(Provide[Container.callbot_service])
):
    """Twilio SpeechResult Handler"""
    try:
        form_data = await request.form()
        speech_result = form_data.get("SpeechResult")
        call_sid = form_data.get("CallSid")
            
        if not speech_result:
            # Simple Retry
            twiml = """
            <Response>
                <Gather input="speech" action="/api/callbot/gather" method="POST" language="ko-KR" speechTimeout="auto">
                </Gather>
            </Response>
            """
            return Response(content=twiml, media_type="application/xml")

        print(f"🎤 User said: {speech_result}")
        
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
        return Response(content=twiml, media_type="application/xml")
    except Exception as e:
        print(f"Gather Error: {e}")
        raise e
