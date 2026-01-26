from typing import List, AsyncGenerator
import urllib.parse
import wave
import io
import audioop

from app.callbot.repository.callbot_repository import CallbotRepository
from app.callbot.services.base_service import BaseService
from app.integration.llm.openai_client import LLM
from app.integration.tts.luxia_client import TTS
from app.integration.call import CALL
from app.core.config import configs

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
        
    def build_greeting_gather_twiml(self, call_sid: str):
        greeting = "안녕하세요! 찬주님 실버링크에서 연락드렸습니다. 잘 지내시죠?"
        encoded_greeting = urllib.parse.quote(greeting)
        stream_url = f"{configs.CALL_CONTROLL_URL}/api/callbot/stream_response?text={encoded_greeting}&amp;call_sid={call_sid}&amp;mode=tts"

        twiml = f"""
        <Response>
            <Gather input="speech" action="/api/callbot/gather" method="POST" language="ko-KR" speechTimeout="auto" bargeIn="true">
                <Play contentType="audio/basic">{stream_url}</Play>
            </Gather>
        </Response>
        """
        return twiml
        
    def make_call(self):
        return self.call.calling()

    # --- Audio Utils ---
    def wav_to_ulaw(self, wav_bytes: bytes) -> bytes:
        """Converts WAV bytes to raw Mu-law audio (8kHz, Mono) without headers"""
        try:
            import audioop
        except ImportError:
            print("Audioop module is not available (removed in Python 3.13). Audio conversion disabled.")
            return b""

        try:
            with wave.open(io.BytesIO(wav_bytes), 'rb') as wav:
                # Resample and Convert
                n_channels = wav.getnchannels()
                framerate = wav.getframerate()
                sampwidth = wav.getsampwidth()
                n_frames = wav.getnframes()
                data = wav.readframes(n_frames)

                # Ensure Mono
                if n_channels > 1:
                    data = audioop.tomono(data, sampwidth, 0.5, 0.5)
                
                # Ensure 8000Hz
                if framerate != 8000:
                    data, _ = audioop.ratecv(data, sampwidth, 1, framerate, 8000, None)

                # Linear PCM -> Mu-law
                return audioop.lin2ulaw(data, sampwidth)
        except Exception as e:
            print(f"Audio Conv Error: {e}")
            return b""

    async def generate_tts_stream(self, text: str):
        """Calls Luxia TTS and returns raw WAV bytes"""
        # Note: We rely on the async method added to TTS integration
        content = await self.tts_client.asultlux(text)
        return content

    # --- Streaming Logic ---
    async def ai_response_generator(self, user_text: str, history: List[dict], mode: str = "chat") -> AsyncGenerator[bytes, None]:
        """
        The Core Pipeline: LLM Stream -> Text Buffer -> TTS -> Audio Stream
        """
        # Send a tiny amount of silence to start the stream (1 byte) just to trigger headers
        # yield b'\xff' * 1600  <- Reduced or removed to decrease initial delay
        # yield b'\xff' * 800

        if mode == "tts":
            # print(f"🗣️ TTS Only Mode: {user_text}") # Removed for speed
            wav_data = await self.generate_tts_stream(user_text)
            if wav_data:
                yield self.wav_to_ulaw(wav_data)
            return

        # Update history for this generation
        current_history = history.copy() # Make a copy to avoid modifying the original history
        
        # System Prompt injection if not present in history (or handled by caller)
        # Here we assume 'history' passed contains the context, but let's make sure we have the system prompt.
        # Ideally, the system prompt logic should be unified.
        # For now, I'll use the one from get_chatgpt_response but adapt it.
        
        system_prompt = {
            "role": "system", 
            "content": "You are a helpful voice assistant. Keep your answers concise (1-2 sentences) and suitable for speech synthesis."
        }
        
        # If history doesn't start with system prompt, prepend it?
        # Or just construct messages locally.
        messages = [system_prompt] + current_history[-10:] + [{"role": "user", "content": user_text}]

        full_response = ""
        buffer = ""
        
        try:
            # LLM Request
            stream = await self.llm_client.astream(messages)

            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    buffer += content
                    
                    # ⚡ Aggressive Chunking: Trigger TTS on punctuation OR length > 10
                    is_punct = any(p in content for p in [".", "?", "!", ",", "\n"])
                    is_long = len(buffer) > 10 and content.endswith(" ")
                    
                    if is_punct or is_long:
                        # Generate TTS for this chunk
                        # print(f"🗣️ TTS Chunk: {buffer}")
                        wav_data = await self.generate_tts_stream(buffer)
                        if wav_data:
                            ulaw_data = self.wav_to_ulaw(wav_data)
                            yield ulaw_data # Stream audio to Twilio
                        buffer = ""

            # Process remaining buffer
            if buffer.strip():
                wav_data = await self.generate_tts_stream(buffer)
                if wav_data:
                    yield self.wav_to_ulaw(wav_data)

            # Note: We can't easily update the outer history object here unless passed by reference or we return the full response.
            # But the generator just yields bytes. 
            # We might need to handle history update in the caller or logging.
            history.append({"role": "assistant", "content": full_response})
            # print(f"🤖 Full AI Response: {full_response}")

        except Exception as e:
            import traceback
            import os
            os.makedirs("logs", exist_ok=True)
            with open("logs/stream_error.log", "a", encoding="utf-8") as f:
                f.write(f"Stream Error: {e}\n")
                f.write(traceback.format_exc() + "\n")
            print(f"Stream Error: {e}")
