import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Megaphone,
  Pin,
  Calendar,
  Volume2
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: "공지" | "긴급" | "이벤트";
  isPinned: boolean;
  date: string;
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "설날 연휴 상담 안내",
    content: "설날 연휴 기간(2월 9일~12일)에도 긴급 상담은 정상 운영됩니다.\n\n긴급한 상황이 있으시면 언제든지 긴급 연락 버튼을 눌러주세요.\n\n명절 연휴 건강하게 보내세요!",
    category: "긴급",
    isPinned: true,
    date: "2024-02-01",
  },
  {
    id: "2",
    title: "2024년 새해 복 많이 받으세요",
    content: "새해 첫날, 어르신들의 건강과 행복을 기원합니다.\n\n올해도 마음돌봄이 함께 하겠습니다.\n\n늘 건강하시고 행복하세요!",
    category: "공지",
    isPinned: true,
    date: "2024-01-01",
  },
  {
    id: "3",
    title: "봄맞이 건강 프로그램 안내",
    content: "봄을 맞아 어르신들을 위한 특별 건강 프로그램이 진행됩니다.\n\n참여를 원하시면 담당 상담사에게 말씀해주세요.\n\n- 일시: 3월 중\n- 내용: 스트레칭, 건강 강좌",
    category: "이벤트",
    isPinned: false,
    date: "2024-02-15",
  },
];

const SeniorNotices = () => {
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
  };

  const handleSpeak = () => {
    if (!selectedNotice) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${selectedNotice.title}. ${selectedNotice.content}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "긴급":
        return "bg-destructive text-destructive-foreground";
      case "이벤트":
        return "bg-success text-success-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "긴급":
        return <Badge className="bg-destructive/10 text-destructive border-0 text-base px-3 py-1">긴급</Badge>;
      case "이벤트":
        return <Badge className="bg-success/10 text-success border-0 text-base px-3 py-1">이벤트</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-0 text-base px-3 py-1">공지</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-warning text-warning-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/senior")}
            className="text-warning-foreground hover:bg-warning-foreground/20 p-3"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-foreground/20 flex items-center justify-center">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">공지사항</h1>
              <p className="text-warning-foreground/80 text-sm">새로운 소식을 확인해요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-4">
        {mockNotices.map((notice) => (
          <button
            key={notice.id}
            onClick={() => handleNoticeClick(notice)}
            className="w-full text-left"
          >
            <Card className="hover:shadow-lg transition-all active:scale-[0.98]">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${getCategoryStyle(notice.category)} flex items-center justify-center flex-shrink-0`}>
                    {notice.isPinned ? (
                      <Pin className="w-7 h-7" />
                    ) : (
                      <Megaphone className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryBadge(notice.category)}
                      {notice.isPinned && (
                        <Badge variant="outline" className="text-sm">고정</Badge>
                      )}
                    </div>
                    <p className="font-bold text-lg line-clamp-2">{notice.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{notice.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </main>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSelectedNotice(null);
      }}>
        <DialogContent className="max-w-lg mx-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedNotice && getCategoryBadge(selectedNotice.category)}
            </div>
            <DialogTitle className="text-2xl leading-tight">
              {selectedNotice?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {selectedNotice?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg whitespace-pre-wrap leading-relaxed">
              {selectedNotice?.content}
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:flex-col">
            <Button
              onClick={handleSpeak}
              className={`w-full h-16 text-lg font-bold rounded-xl gap-3 ${
                isSpeaking ? "bg-warning hover:bg-warning/90" : ""
              }`}
            >
              <Volume2 className="w-6 h-6" />
              {isSpeaking ? "읽기 중지" : "소리로 읽어주기"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setSelectedNotice(null);
              }}
              className="w-full h-14 text-lg font-bold rounded-xl"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeniorNotices;
