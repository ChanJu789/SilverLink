import { useState } from "react";
import { 
  Home, 
  Users, 
  UserCog,
  BarChart3, 
  MessageSquare, 
  Settings,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const navItems = [
  { title: "홈", href: "/admin", icon: <Home className="w-5 h-5" /> },
  { title: "회원 관리", href: "/admin/members", icon: <Users className="w-5 h-5" /> },
  { title: "배정 관리", href: "/admin/assignments", icon: <UserCog className="w-5 h-5" /> },
  { title: "AI 성능 통계", href: "/admin/ai-stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "불편사항 관리", href: "/admin/complaints", icon: <MessageSquare className="w-5 h-5" />, badge: 8 },
  { title: "시스템 설정", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

const complaints = [
  { 
    id: 1, 
    guardian: "홍길동", 
    counselor: "김상담",
    senior: "김순자",
    category: "상담사 응대",
    title: "상담사 불친절 불만",
    content: "담당 상담사가 통화 시 불친절하게 응대하였습니다. 어머니께서 상담사의 말투가 차갑다고 느끼셨습니다.",
    status: "pending",
    createdAt: "2024-01-15 10:30",
    priority: "high"
  },
  { 
    id: 2, 
    guardian: "박민수", 
    counselor: "이복지",
    senior: "박영희",
    category: "통화 품질",
    title: "통화 연결 지연",
    content: "예정된 시간에 통화가 연결되지 않아 어머니께서 불안해하셨습니다.",
    status: "in_progress",
    createdAt: "2024-01-14 15:20",
    priority: "medium"
  },
  { 
    id: 3, 
    guardian: "이영희", 
    counselor: "최상담",
    senior: "이철수",
    category: "서비스 불만",
    title: "AI 응답 부정확",
    content: "AI가 아버지의 말씀을 제대로 이해하지 못하고 엉뚱한 답변을 했습니다.",
    status: "completed",
    createdAt: "2024-01-13 09:15",
    priority: "low",
    response: "AI 모델 개선 작업을 진행하였습니다. 추가 모니터링 중입니다."
  },
  { 
    id: 4, 
    guardian: "정철수", 
    counselor: "김상담",
    senior: "정미영",
    category: "상담사 변경",
    title: "담당 상담사 변경 요청",
    content: "현재 담당 상담사와의 소통이 원활하지 않아 변경을 요청드립니다.",
    status: "pending",
    createdAt: "2024-01-15 14:45",
    priority: "medium"
  },
];

const stats = {
  total: 24,
  pending: 8,
  inProgress: 6,
  completed: 10,
};

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

const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">긴급</Badge>;
    case "medium":
      return <Badge variant="outline">보통</Badge>;
    case "low":
      return <Badge variant="secondary">낮음</Badge>;
    default:
      return null;
  }
};

const ComplaintManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null);
  const [response, setResponse] = useState("");

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">불편사항 관리</h1>
          <p className="text-muted-foreground mt-1">보호자 불편사항을 접수하고 처리합니다</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">전체</p>
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
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">접수</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
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
                  <p className="text-2xl font-bold text-success">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">완료</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="보호자, 상담사, 어르신 이름으로 검색..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="pending">접수</SelectItem>
                  <SelectItem value="in_progress">처리중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card className="shadow-card border-0">
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
                        <PriorityBadge priority={complaint.priority} />
                        <StatusBadge status={complaint.status} />
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{complaint.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{complaint.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>보호자: {complaint.guardian}</span>
                        <span>상담사: {complaint.counselor}</span>
                        <span>어르신: {complaint.senior}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{complaint.createdAt}</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        상세보기 <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl">
            {selectedComplaint && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} />
                    <Badge variant="outline">{selectedComplaint.category}</Badge>
                  </div>
                  <DialogTitle>{selectedComplaint.title}</DialogTitle>
                  <DialogDescription>
                    {selectedComplaint.createdAt} · 보호자: {selectedComplaint.guardian}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm text-muted-foreground mb-1">불편사항 내용</p>
                    <p>{selectedComplaint.content}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">보호자</p>
                      <p className="font-medium">{selectedComplaint.guardian}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">담당 상담사</p>
                      <p className="font-medium">{selectedComplaint.counselor}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">어르신</p>
                      <p className="font-medium">{selectedComplaint.senior}</p>
                    </div>
                  </div>
                  {selectedComplaint.response && (
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-sm text-success font-medium mb-1">답변 완료</p>
                      <p className="text-foreground">{selectedComplaint.response}</p>
                    </div>
                  )}
                  {selectedComplaint.status !== "completed" && (
                    <div className="space-y-2">
                      <Label>답변 작성</Label>
                      <Textarea 
                        placeholder="불편사항에 대한 답변을 작성하세요..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedComplaint(null)}>닫기</Button>
                  {selectedComplaint.status !== "completed" && (
                    <>
                      <Button variant="secondary">처리중으로 변경</Button>
                      <Button>답변 등록</Button>
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintManagement;
