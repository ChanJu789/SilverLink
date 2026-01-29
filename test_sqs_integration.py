"""
SQS 통합 테스트 스크립트

실제 AWS SQS와 연동하여 메시지 발행/수신을 테스트합니다.
"""
import asyncio
import sys
from datetime import datetime
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

from app.core.container import Container
from app.queue.message_schema import CallRequestMessage


async def test_sqs_publish():
    """SQS 메시지 발행 테스트"""
    print("="*50)
    print("🧪 SQS 메시지 발행 테스트")
    print("="*50)
    
    # Container에서 SQS 클라이언트 가져오기
    container = Container()
    sqs_client = container.sqs_client()
    
    # 테스트 메시지 생성
    test_message = CallRequestMessage(
        message_id="test-integration-001",
        schedule_id=999,
        elderly_id=100,
        elderly_name="테스트 어르신",
        phone_number="+821012345678",
        scheduled_time=datetime.utcnow()
    )
    
    print(f"\n📝 발행할 메시지:")
    print(f"   schedule_id: {test_message.schedule_id}")
    print(f"   elderly_name: {test_message.elderly_name}")
    print(f"   phone_number: {test_message.phone_number}")
    
    # 메시지 발행
    print(f"\n📤 SQS 큐에 메시지 발행 중...")
    message_id = sqs_client.publish(test_message)
    
    if message_id:
        print(f"✅ 발행 성공!")
        print(f"   SQS Message ID: {message_id}")
        print(f"   Queue URL: {sqs_client.queue_url}")
        return True
    else:
        print(f"❌ 발행 실패!")
        return False


async def test_sqs_receive():
    """SQS 메시지 수신 테스트"""
    print("\n" + "="*50)
    print("🧪 SQS 메시지 수신 테스트")
    print("="*50)
    
    container = Container()
    sqs_client = container.sqs_client()
    
    print(f"\n📥 SQS 큐에서 메시지 수신 중...")
    print(f"   (최대 5초 대기)")
    
    messages = sqs_client.receive(
        max_messages=1,
        wait_time_seconds=5,
        visibility_timeout=30
    )
    
    if messages:
        print(f"✅ 메시지 수신 성공! ({len(messages)}개)")
        for msg in messages:
            print(f"\n📨 메시지 내용:")
            print(f"   MessageId: {msg.get('MessageId')}")
            print(f"   Body: {msg.get('Body')[:100]}...")
            
            # 메시지 삭제 (테스트이므로)
            receipt_handle = msg.get('ReceiptHandle')
            if receipt_handle:
                sqs_client.delete(receipt_handle)
                print(f"   🗑️ 메시지 삭제 완료")
        return True
    else:
        print(f"ℹ️ 수신된 메시지 없음 (큐가 비어있음)")
        return False


async def test_queue_stats():
    """SQS 큐 통계 조회 테스트"""
    print("\n" + "="*50)
    print("🧪 SQS 큐 통계 조회 테스트")
    print("="*50)
    
    container = Container()
    sqs_client = container.sqs_client()
    
    print(f"\n📊 큐 통계 조회 중...")
    attrs = sqs_client.get_queue_attributes()
    
    if attrs:
        print(f"✅ 통계 조회 성공!")
        print(f"\n📈 큐 상태:")
        print(f"   대기 중 메시지: {attrs.get('ApproximateNumberOfMessages', 0)}")
        print(f"   처리 중 메시지: {attrs.get('ApproximateNumberOfMessagesNotVisible', 0)}")
        print(f"   지연 메시지: {attrs.get('ApproximateNumberOfMessagesDelayed', 0)}")
        return True
    else:
        print(f"❌ 통계 조회 실패!")
        return False


async def test_dlq_stats():
    """DLQ 통계 조회 테스트"""
    print("\n" + "="*50)
    print("🧪 DLQ 통계 조회 테스트")
    print("="*50)
    
    container = Container()
    dlq_handler = container.dlq_handler()
    
    print(f"\n📊 DLQ 통계 조회 중...")
    stats = dlq_handler.get_dlq_stats()
    
    if 'error' not in stats:
        print(f"✅ DLQ 통계 조회 성공!")
        print(f"\n📈 DLQ 상태:")
        print(f"   실패 메시지 수: {stats.get('approximate_message_count', 0)}")
        print(f"   처리 중 메시지: {stats.get('approximate_not_visible', 0)}")
        return True
    else:
        print(f"❌ DLQ 통계 조회 실패: {stats.get('error')}")
        return False


async def main():
    """메인 테스트 함수"""
    print("\n" + "="*60)
    print("   SilverLink-AI SQS 통합 테스트")
    print("="*60)
    
    results = []
    
    # 1. 메시지 발행 테스트
    try:
        result = await test_sqs_publish()
        results.append(("메시지 발행", result))
    except Exception as e:
        print(f"❌ 에러: {e}")
        results.append(("메시지 발행", False))
    
    # 2. 큐 통계 테스트
    try:
        result = await test_queue_stats()
        results.append(("큐 통계 조회", result))
    except Exception as e:
        print(f"❌ 에러: {e}")
        results.append(("큐 통계 조회", False))
    
    # 3. 메시지 수신 테스트
    try:
        result = await test_sqs_receive()
        results.append(("메시지 수신", result))
    except Exception as e:
        print(f"❌ 에러: {e}")
        results.append(("메시지 수신", False))
    
    # 4. DLQ 통계 테스트
    try:
        result = await test_dlq_stats()
        results.append(("DLQ 통계 조회", result))
    except Exception as e:
        print(f"❌ 에러: {e}")
        results.append(("DLQ 통계 조회", False))
    
    # 결과 요약
    print("\n" + "="*60)
    print("   테스트 결과 요약")
    print("="*60)
    
    for test_name, result in results:
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{status} - {test_name}")
    
    success_count = sum(1 for _, result in results if result)
    total_count = len(results)
    
    print(f"\n총 {total_count}개 테스트 중 {success_count}개 성공")
    print("="*60)
    
    return success_count == total_count


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ 테스트 중단됨")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
