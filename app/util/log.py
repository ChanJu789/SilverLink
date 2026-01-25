import os
import datetime
import json
import time
from contextlib import contextmanager

LOG_LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}
CURRENT_LOG_LEVEL = "INFO"

LOG_DIR = "logs"
LOG_CONV_DIR = os.path.join(LOG_DIR, "conversations")
LOG_EVAL_DIR = os.path.join(LOG_DIR, "evaluations")

for d in [LOG_CONV_DIR, LOG_EVAL_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

LOG_FILE = "call_history.txt"

def safe_print(text):
    """윈도우 콘솔 인코딩 에러 방지 출력"""
    try:
        print(text)
    except UnicodeEncodeError:
        try:
            print(text.encode('utf-8').decode('cp949', 'ignore'))
        except:
            print(text.encode('ascii', 'ignore').decode('ascii'))

def log_conversation(role, message, session_id=None, latency=None, level="INFO"):
    """대화 내용을 콘솔과 파일에 기록 (세션별 로그 분리 + 로그 레벨 + 세션 구분)"""
    if LOG_LEVELS.get(level, 20) < LOG_LEVELS.get(CURRENT_LOG_LEVEL, 20):
        return

    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    s_id_tag = f"[{session_id[:8]}]" if session_id else "[Global]"
    
    log_entry = f"[{timestamp}] [{level}] {s_id_tag} {role}: {message}"
    if latency is not None:
        log_entry += f" (Latency: {latency:.2f}s)"
    
    if role == "User":
        safe_print(f"\n👤 {s_id_tag} 사용자: {message}")
    elif role == "AI":
        safe_print(f"🤖 {s_id_tag} AI: {message}")
    else:
        safe_print(f"ℹ️  {s_id_tag} {message}")

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_entry + "\n")
    except Exception as e:
        print(f"File Write Error: {e}")

    if session_id:
        session_log_path = os.path.join(LOG_CONV_DIR, f"log_{session_id}.log")
        try:
            with open(session_log_path, "a", encoding="utf-8") as f:
                f.write(log_entry + "\n")
        except Exception as e:
            print(f"Session Log Write Error: {e}")

def evaluate_turn(session_id, role, text, latency):
    """단락(User/AI)마다 성능 평가 로그 기록 (evaluations 폴더)"""
    if not session_id:
        return

    eval_log_path = os.path.join(LOG_EVAL_DIR, f"eval_{session_id}.log")
    
    eval_data = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "role": role,
        "text_length": len(text) if text else 0,
        "latency_seconds": latency if latency is not None else 0.0,
    }
    
    try:
        with open(eval_log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(eval_data, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Eval Log Write Error: {e}")

@contextmanager
def measure_execution(session_id, role):
    """
    실행 시간 측정 및 로그/평가 자동화를 위한 Context Manager
    """
    start_time = time.time()
    context = {'text': ''}
    try:
        yield context
    finally:
        duration = time.time() - start_time
        if context['text']:
            log_conversation(role, context['text'], session_id=session_id, latency=duration)
            evaluate_turn(session_id, role, context['text'], duration)