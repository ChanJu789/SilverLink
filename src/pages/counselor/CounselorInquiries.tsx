import { useState } from "react";
import { 
  Search,
  Send,
  Clock,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { counselorNavItems } from "@/config/counselorNavItems";

const inquiries = [
  {
    id: 1,
    guardianName: "홍길동",
    seniorName: "김순자",
    title: "어머니 건강 상태 문의",
    status: "waiting",
    createdAt: "2024-01-15 14:30",
    lastMessage: "어머니께서 요즘 식사를 잘 안하신다고 하셔서 걱정됩니다...",
    messages: [
      {
        id: 1,
        sender: "guardian",
        content: "안녕하세요, 어머니 담당 상담사님. 어머니께서 요즘 식사를 잘 안하신다고 하셔서 걱정됩니다. 혹시 통화하실 때 특이사항이 있으셨나요?",
        timestamp: "2024-01-15 14:30"
      }
    ]
  },
  {
    id: 2,
    guardianName: "박민수",
    seniorName: "박영희",
    title: "정기 통화 시간 변경 요청",
    status: "answered",
    createdAt: "2024-01-14 10:00",
    lastMessage: "변경 완료되었습니다. 앞으로 오전 10시에 연락드리겠습니다.",
    messages: [
      {
        id: 1,
        sender: "guardian",
        content: "안녕하세요, 아버지 통화 시간을 오전 10시로 변경 부탁드립니다.",
        timestamp: "2024-01-14 10:00"
      },
      {
        id: 2,
        sender: "counselor",
        content: "안녕하세요, 보호자님. 네, 변경 완료되었습니다. 앞으로 오전 10시에 연락드리겠습니다.",
        timestamp: "2024-01-14 11:30"
      }
    ]
  },
  {
    id: 3,
    guardianName: "이영희",
    seniorName: "이철수",
    title: "우울증상 관련 상담 요청",
    status: "waiting",
    createdAt: "2024-01-15 09:00",
    lastMessage: "아버지께서 요즘 많이 우울해하시는 것 같아요...",
    messages: [
      {
        id: 1,
        sender: "guardian",
        content: "상담사님, 아버지께서 요즘 많이 우울해하시는 것 같아요. 손자가 해외로 유학을 가서 그런 것 같은데, 전문적인 상담이 필요할까요?",
        timestamp: "2024-01-15 09:00"
      }
    ]
  },
  {
    id: 4,
    guardianName: "정수민",
    seniorName: "정말자",
    title: "복지 서비스 신청 도움 요청",
    status: "waiting",
    createdAt: "2024-01-14 16:00",
    lastMessage: "어머니께서 복지 서비스 신청을 원하시는데...",
    messages: [
      {
        id: 1,
        sender: "guardian",
        content: "안녕하세요, 어머니께서 노인복지관 이용을 원하시는데 신청 방법을 잘 모르시겠다고 하세요. 도움을 받을 수 있을까요?",
        timestamp: "2024-01-14 16:00"
      }
    ]
  },
  {
    id: 5,
    guardianName: "최미영",
    seniorName: "최영호",
    title: "약 복용 시간 확인 요청",
    status: "answered",
    createdAt: "2024-01-13 13:00",
    lastMessage: "네, 통화 시마다 꼭 확인해드리겠습니다.",
    messages: [
      {
        id: 1,
        sender: "guardian",
        content: "아버지께서 약 드시는 걸 자주 잊으시는데, 통화하실 때 확인 부탁드려도 될까요?",
        timestamp: "2024-01-13 13:00"
      },
      {
        id: 2,
        sender: "counselor",
        content: "안녕하세요, 보호자님. 네, 통화 시마다 꼭 확인해드리겠습니다. 걱정 마세요.",
        timestamp: "2024-01-13 14:30"
      }
    ]
  },
];

const CounselorInquiries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<typeof inquiries[0] | null>(inquiries[0]);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredInquiries = inquiries.filter((inquiry) =>
    inquiry.title.includes(searchTerm) || 
    inquiry.guardianName.includes(searchTerm) ||
    inquiry.seniorName.includes(searchTerm)
  );

  const waitingCount = inquiries.filter(i => i.status === "waiting").length;
  const answeredCount = inquiries.filter(i => i.status === "answered").length;

  const handleReply = () => {
    if (!replyMessage.trim() || !selectedInquiry) return;
    // Add reply logic here
    setReplyMessage("");
  };

  return (
    <DashboardLayout
      role="counselor"
      userName="김상담"
      navItems={counselorNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">보호자 문의</h1>
            <p className="text-muted-foreground mt-1">보호자님들의 문의사항을 확인하고 답변하세요</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="문의 검색..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inquiries.length}</p>
                  <p className="text-sm text-muted-foreground">전체 문의</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{waitingCount}</p>
                  <p className="text-sm text-muted-foreground">답변 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{answeredCount}</p>
                  <p className="text-sm text-muted-foreground">답변 완료</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inquiry List */}
          <Card className="shadow-card border-0 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">문의 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1 p-4 pt-0">
                  {filteredInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className={`p-4 rounded-xl cursor-pointer transition-colors ${
                        selectedInquiry?.id === inquiry.id 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {inquiry.guardianName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">{inquiry.guardianName}</span>
                            <Badge 
                              variant={inquiry.status === "waiting" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {inquiry.status === "waiting" ? "대기" : "완료"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {inquiry.seniorName} 어르신 보호자
                          </p>
                          <p className="text-sm text-foreground mt-1 truncate">{inquiry.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{inquiry.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="shadow-card border-0 lg:col-span-2">
            {selectedInquiry ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedInquiry.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedInquiry.guardianName} ({selectedInquiry.seniorName} 어르신 보호자)
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={selectedInquiry.status === "waiting" ? "destructive" : "secondary"}
                    >
                      {selectedInquiry.status === "waiting" ? "답변 대기" : "답변 완료"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px] p-6">
                    <div className="space-y-4">
                      {selectedInquiry.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "counselor" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.sender === "counselor"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-secondary rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              message.sender === "counselor" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="답변을 입력하세요..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button 
                        className="px-4"
                        onClick={handleReply}
                        disabled={!replyMessage.trim()}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                문의를 선택해주세요
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CounselorInquiries;
