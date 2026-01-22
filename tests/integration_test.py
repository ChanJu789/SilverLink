import requests
import json
import time

PYTHON_URL = "http://localhost:8000"
SPRING_URL = "http://localhost:8080"

def test_sync_faqs():
    print(f"\n[1] Testing FAQ Sync ({PYTHON_URL}/sync/faqs)...")
    try:
        response = requests.post(f"{PYTHON_URL}/sync/faqs")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 200:
             print("✅ FAQ Sync Successful")
        else:
             print("❌ FAQ Sync Failed")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_chat_proxy():
    print(f"\n[2] Testing Chat Proxy ({SPRING_URL}/api/chatbot/chat)...")
    
    # Assuming Guardian ID 1 and Elderly ID 1 exist and are related
    # Logic in ChatbotProxyController: extractGuardianId returns 1L hardcoded for now.
    payload = {
        "guardianId": 1,
        "elderlyId": 1,
        "message": "노인 장기 요양 보험이 뭐야?"
    }
    
    headers = {
        "Content-Type": "application/json"
        # Add Authorization header if needed by Spring Security, 
        # but current implementation seems to rely on @AuthenticationPrincipal which might need a mock user or token.
        # However, for a quick test, we might hit 403 if security is enabled.
        # Let's try without auth first, or assuming dev environment allows it.
    }

    try:
        response = requests.post(f"{SPRING_URL}/api/chatbot/chat", json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        try:
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        except:
             print(f"Response Text: {response.text}")

        if response.status_code == 200:
            print("✅ Chat Request Successful")
        elif response.status_code == 403 or response.status_code == 401:
            print("⚠️ Auth Error - You may need to log in or disable security for testing.")
        else:
            print("❌ Chat Request Failed")
            
    except Exception as e:
        print(f"❌ Connection Error to Spring Boot: {e}")

if __name__ == "__main__":
    test_sync_faqs()
    test_chat_proxy()
