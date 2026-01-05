import { useState } from "react";
import { 
  Home, 
  Phone, 
  BarChart3, 
  MessageSquare, 
  HelpCircle,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
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

const navItems = [
  { title: "홈", href: "/guardian", icon: <Home className="w-5 h-5" /> },
  { title: "통화 기록", href: "/guardian/calls", icon: <Phone className="w-5 h-5" />, badge: 3 },
  { title: "통계", href: "/guardian/stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "1:1 문의", href: "/guardian/inquiry", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "불편 접수", href: "/guardian/complaint", icon: <AlertTriangle className="w-5 h-5" /> },
  { title: "복지 서비스", href: "/guardian/welfare", icon: <FileText className="w-5 h-5" /> },
  { title: "FAQ", href: "/guardian/faq", icon: <HelpCircle className="w-5 h-5" /> },
];

const complaints = [
  {
    id: 1,
    title: "담당 상담사 응대 불만",
    category: "상담사 관련",
    content: "담당 상담사가 어머니께 통화 시 불친절하게 응대했습니다. 개선을 요청드립니다.",
    status: "in_progress",
    createdAt: "2024-01-15 10:30",
    response: null
  },
  {
    id: 2,
    title: "통화 연결 지연 문제",
    category: "서비스 품질",
    content: "예정된 시간에 통화가 연결되지 않아 어머니께서 불안해하셨습니다.",
    status: "completed",
    createdAt: "2024-01-10 15:20",
    response: "불편을 드려 죄송합니다. 시스템 점검으로 인한 일시적 지연이었으며, 재발 방지를 위해 모니터링을 강화하였습니다."
  },
  {
    id: 3,
    title: "AI 응답 오류",
    category: "AI 관련",
    content: "AI가 어머니의 말씀을 제대로 인식하지 못하고 엉뚱한 답변을 했습니다.",
    status: "pending",
    createdAt: "2024-01-08 09:15",
    response: null
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-0">접수</Badge>;
    case "in_progress":
      return <Badge className="bg-info/10 text-info border-0">처리중</Badge>;
    case "completed":
      return <Badge className="bg-success/10 text-success border-0">완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const GuardianComplaint = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null);

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">불편 사항 접수</h1>
            <p className="text-muted-foreground mt-1">서비스 이용 중 불편한 점을 접수하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                불편 접수하기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>불편 사항 접수</DialogTitle>
                <DialogDescription>불편 사항을 관리자에게 전달합니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>불편 유형</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counselor">상담사 관련</SelectItem>
                      <SelectItem value="service">서비스 품질</SelectItem>
                      <SelectItem value="ai">AI 관련</SelectItem>
                      <SelectItem value="system">시스템 오류</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>제목</Label>
                  <Input placeholder="불편 사항 제목을 입력하세요" />
                </div>
                <div className="space-y-2">
                  <Label>상세 내용</Label>
                  <Textarea 
                    placeholder="불편 사항을 상세히 작성해 주세요. 구체적으로 작성해 주시면 빠른 처리에 도움이 됩니다."
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={() => setIsDialogOpen(false)}>접수하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">1</p>
                  <p className="text-sm text-muted-foreground">접수</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-info">1</p>
                  <p className="text-sm text-muted-foreground">처리중</p>
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
                  <p className="text-2xl font-bold text-success">1</p>
                  <p className="text-sm text-muted-foreground">완료</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">접수 내역</CardTitle>
            <CardDescription>불편 사항 접수 및 처리 현황</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={complaint.status} />
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{complaint.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{complaint.content}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{complaint.createdAt}</p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground mt-2 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-lg">
            {selectedComplaint && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={selectedComplaint.status} />
                    <Badge variant="outline">{selectedComplaint.category}</Badge>
                  </div>
                  <DialogTitle>{selectedComplaint.title}</DialogTitle>
                  <DialogDescription>{selectedComplaint.createdAt}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">접수 내용</p>
                    <p>{selectedComplaint.content}</p>
                  </div>
                  {selectedComplaint.response && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-sm text-success font-medium mb-1">처리 결과</p>
                      <p className="text-foreground">{selectedComplaint.response}</p>
                    </div>
                  )}
                  {!selectedComplaint.response && (
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">처리 중입니다. 빠른 시일 내에 답변드리겠습니다.</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)}>닫기</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GuardianComplaint;
