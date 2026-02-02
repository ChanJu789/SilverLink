from twilio.rest import Client

class CALL:
    def __init__(self, account_sid: str, auth_token: str, url: str, number: str, silverlink_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.url = url
        self.number = number
        self.silverlink_number = silverlink_number
        
    def calling(self) -> None:
        # 계정 정보
        account_sid = self.account_sid
        auth_token = self.auth_token
        client = Client(account_sid, auth_token)

        # ngrok 주소 뒤에 /voice 라우트를 붙여줍니다.
        # 예: https://abcd-1234.ngrok-free.app/voice
        my_server_url = f"{self.url}/api/callbot/voice"

        client.calls.create(
            to='+821053915653',      # 받는 사람 번호
            from_=self.silverlink_number,    # Twilio 발신 번호
            url=my_server_url        # 우리가 만든 AI 서버 주소
        )
        
