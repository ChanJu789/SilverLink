import { useState } from "react";
import { 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  MessageSquare
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inquiries = [
  {
    id: 1,
    title: "어머니 통화 시간 변경 요청",
    category: "서비스 요청",
    content: "어머니께서 오전 통화가 힘드시다고 하셔서 오후 2시경으로 변경 가능할까요?",
    status: "answered",
    createdAt: "2024-01-15 10:30",
    counselor: "김상담",
    messages: [
      { sender: "guardian", content: "어머니께서 오전 통화가 힘드시다고 하셔서 오후 2시경으로 변경 가능할까요?", time: "2024-01-15 10:30" },
      { sender: "counselor", content: "안녕하세요, 홍길동님. 통화 시간 변경 요청 확인했습니다. 내일부터 오후 2시로 변경해 드리겠습니다. 추가 문의사항 있으시면 말씀해 주세요.", time: "2024-01-15 11:45" },
    ]
  },
  {
    id: 2,
    title: "통화 녹음 다시 듣기 가능한가요?",
    category: "서비스 문의",
    content: "지난주 통화 내용을 다시 확인하고 싶은데 녹음을 들을 수 있는 방법이 있을까요?",
    status: "waiting",
    createdAt: "2024-01-14 15:20",
    counselor: "김상담",
    messages: [
      { sender: "guardian", content: "지난주 통화 내용을 다시 확인하고 싶은데 녹음을 들을 수 있는 방법이 있을까요?", time: "2024-01-14 15:20" },
    ]
  },
  {
    id: 3,
    title: "AI 분석 결과 해석 문의",
    category: "AI 관련",
    content: "AI 분석에서 '주의' 표시가 떴는데 구체적으로 어떤 의미인가요?",
    status: "answered",
    createdAt: "2024-01-12 09:15",
    counselor: "김상담",
    messages: [
      { sender: "guardian", content: "AI 분석에서 '주의' 표시가 떴는데 구체적으로 어떤 의미인가요?", time: "2024-01-12 09:15" },
      { sender: "counselor", content: "안녕하세요. AI 분석의 '주의' 표시는 어르신의 음성에서 평소와 다른 패턴이 감지되었을 때 나타납니다. 이 경우 우울감이나 피로감이 느껴지셨을 수 있습니다. 제가 확인한 결과 전날 수면이 부족하셨던 것으로 보입니다. 크게 걱정하실 상황은 아니지만 지속적으로 모니터링하겠습니다.", time: "2024-01-12 14:30" },
    ]
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "waiting":
      return <Badge className="bg-warning/10 text-warning border-0">답변 대기</Badge>;
    case "answered":
      return <Badge className="bg-success/10 text-success border-0">답변 완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const GuardianInquiry = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<typeof inquiries[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">1:1 문의</h1>
            <p className="text-muted-foreground mt-1">담당 상담사에게 문의하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 문의 작성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 문의 작성</DialogTitle>
                <DialogDescription>담당 상담사 김상담님께 문의를 보냅니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>문의 유형</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">서비스 요청</SelectItem>
                      <SelectItem value="question">서비스 문의</SelectItem>
                      <SelectItem value="ai">AI 관련</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>제목</Label>
                  <Input placeholder="문의 제목을 입력하세요" />
                </div>
                <div className="space-y-2">
                  <Label>문의 내용</Label>
                  <Textarea 
                    placeholder="문의 내용을 상세히 작성해 주세요"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={() => setIsDialogOpen(false)}>문의 등록</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
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
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">1</p>
                  <p className="text-sm text-muted-foreground">답변 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">2</p>
                  <p className="text-sm text-muted-foreground">답변 완료</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">문의 목록</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inquiries.map((inquiry) => (
                    <div 
                      key={inquiry.id}
                      className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status={inquiry.status} />
                        <span className="text-xs text-muted-foreground">{inquiry.createdAt.split(' ')[0]}</span>
                      </div>
                      <h3 className="font-medium line-clamp-1">{inquiry.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{inquiry.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <Card className="shadow-card border-0 h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={selectedInquiry.status} />
                        <Badge variant="outline">{selectedInquiry.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{selectedInquiry.title}</CardTitle>
                      <CardDescription>담당 상담사: {selectedInquiry.counselor}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedInquiry.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.sender === 'guardian' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.sender === 'guardian' 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-secondary rounded-bl-none'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender === 'guardian' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="메시지를 입력하세요..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-card border-0 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">문의를 선택하면 상세 내용을 확인할 수 있습니다</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuardianInquiry;
