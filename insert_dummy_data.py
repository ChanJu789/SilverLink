# -*- coding: utf-8 -*-
"""
Inquiry 더미 데이터 추가 스크립트
실행: python insert_dummy_data.py
"""
from pymilvus import connections, Collection, utility
from app.core.config import configs
from app.chatbot.services.embedding_service import EmbeddingService

# 더미 데이터 (guardian_id=1, elderly_id=1)
DUMMY_INQUIRIES = [
    # 서비스 이용
    {"id": 1, "question": "요양보호사 방문 일정을 변경할 수 있나요?", "answer": "네, 48시간 전에 요청하시면 일정 변경이 가능합니다."},
    {"id": 2, "question": "목욕 서비스 신청하고 싶어요", "answer": "주 2회 목욕 서비스 가능하며, 앱에서 신청하실 수 있습니다."},
    {"id": 3, "question": "병원 동행 서비스는 어떻게 이용하나요?", "answer": "앱에서 병원 동행 서비스 신청 후 담당자가 연락드립니다."},
    {"id": 4, "question": "다음 병원 예약 일정이 언제인가요?", "answer": "2월 5일 오전 10시 내과 정기검진 예약되어 있습니다."},
    {"id": 5, "question": "응급 상황 시 연락처가 어떻게 되나요?", "answer": "119 또는 실버링크 긴급번호로 연락주세요."},
    # 식사/영양
    {"id": 6, "question": "어르신이 오늘 식사를 잘 하셨나요?", "answer": "아침 죽 한 그릇, 점심 밥 반 공기와 반찬을 드셨습니다."},
    {"id": 7, "question": "어르신 식단에서 주의할 점이 있나요?", "answer": "저염식을 권장하며, 튀김류와 짠 음식은 피해주세요."},
    {"id": 8, "question": "어르신이 식욕이 없다고 하시는데요", "answer": "소량씩 자주 드시도록 하고, 3일 이상 지속되면 병원 상담을 권장합니다."},
    {"id": 9, "question": "어르신이 물을 잘 안 드시려고 해요", "answer": "목마르지 않아도 수시로 조금씩 드시도록 권해주세요."},
    {"id": 10, "question": "저녁 식사 메뉴 추천해주세요", "answer": "소화가 잘 되는 죽이나 부드러운 반찬을 권장드립니다."},
    # 일상 돌봄
    {"id": 11, "question": "어르신 수면 상태는 어떤가요?", "answer": "어젯밤 7시간 주무셨고, 편안하게 주무셨습니다."},
    {"id": 12, "question": "어르신이 밤에 잠을 못 주무신다고 하세요", "answer": "취침 전 따뜻한 우유와 가벼운 스트레칭을 권장드립니다."},
    {"id": 13, "question": "오늘 어르신 산책은 하셨나요?", "answer": "오전 10시에 30분간 아파트 주변을 산책하셨습니다."},
    {"id": 14, "question": "어르신이 외출하고 싶어하시는데요", "answer": "날씨와 건강 상태 확인 후, 동행 서비스 신청을 권장드립니다."},
    {"id": 15, "question": "어르신 기분 상태는 어떠세요?", "answer": "오늘은 컨디션이 좋으시고, 가족 통화 후 기분이 밝아지셨습니다."},
    # 약/건강 일반
    {"id": 16, "question": "어르신 약 복용 시간이 언제인가요?", "answer": "아침 8시, 점심 12시, 저녁 6시에 식후 30분에 복용하시면 됩니다."},
    {"id": 17, "question": "어르신 복용 약품 목록을 알려주세요", "answer": "담당 의사 처방에 따라 복용 중이며, 상세 내용은 앱에서 확인 가능합니다."},
    {"id": 18, "question": "어르신이 두통을 호소하시는데 어떻게 해야 하나요?", "answer": "충분히 휴식을 취하시고, 2시간 후에도 지속되면 병원 방문을 권장합니다."},
    {"id": 19, "question": "어르신이 열이 나시는 것 같아요", "answer": "체온을 확인하시고 37.5도 이상이면 병원 방문을 권장드립니다."},
    {"id": 20, "question": "어르신이 넘어지셨어요", "answer": "다친 곳이 있는지 확인하시고, 통증이 있으면 즉시 병원 방문해주세요."},
]

def main():
    # 1. Milvus 연결
    print("[1/4] Connecting to Milvus...")
    connections.connect(
        alias="default",
        uri=configs.MILVUS_URI,
        token=configs.MILVUS_TOKEN
    )
    print("  - Connected!")

    # 2. 컬렉션 확인
    print("[2/4] Checking collection...")
    collection_name = configs.INQUIRY_COLLECTION_NAME
    if not utility.has_collection(collection_name):
        print(f"  - ERROR: '{collection_name}' not found!")
        return
    
    collection = Collection(collection_name)
    print(f"  - Collection: {collection_name}")
    print(f"  - Current entities: {collection.num_entities}")

    # 3. 임베딩 생성
    print("[3/4] Creating embeddings...")
    embedding_service = EmbeddingService()
    
    ids = []
    embeddings = []
    guardian_ids = []
    elderly_ids = []
    questions = []
    answers = []

    for item in DUMMY_INQUIRIES:
        text = f"{item['question']} {item['answer']}"
        embedding = embedding_service.create_embedding(text)
        
        ids.append(item["id"])
        embeddings.append(embedding)
        guardian_ids.append(1)  # guardian1
        elderly_ids.append(1)   # elder1
        questions.append(item["question"])
        answers.append(item["answer"])
        print(f"  - [{item['id']}] {item['question'][:30]}...")

    # 4. 데이터 삽입
    print("[4/4] Inserting data...")
    data = [ids, embeddings, guardian_ids, elderly_ids, questions, answers]
    collection.insert(data)
    collection.flush()
    
    print(f"\n[DONE] Inserted {len(DUMMY_INQUIRIES)} inquiries!")
    print(f"  - Total entities now: {collection.num_entities}")

if __name__ == "__main__":
    main()
