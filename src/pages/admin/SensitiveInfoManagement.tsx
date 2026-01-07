import { useState } from "react";
import { 
  Home, 
  Users, 
  UserCog,
  BarChart3, 
  MessageSquare, 
  Settings,
  Megaphone,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const navItems = [
  { title: "홈", href: "/admin", icon: <Home className="w-5 h-5" /> },
  { title: "회원 관리", href: "/admin/members", icon: <Users className="w-5 h-5" /> },
  { title: "배정 관리", href: "/admin/assignments", icon: <UserCog className="w-5 h-5" /> },
  { title: "AI 성능 통계", href: "/admin/ai-stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "불편사항 관리", href: "/admin/complaints", icon: <MessageSquare className="w-5 h-5" />, badge: 8 },
  { title: "민감정보 요청", href: "/admin/sensitive-info", icon: <Lock className="w-5 h-5" />, badge: 2 },
  { title: "공지사항 관리", href: "/admin/notices", icon: <Megaphone className="w-5 h-5" /> },
  { title: "시스템 설정", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

const requests = [
  {
    id: 1,
    counselorName: "김상담",
    seniorName: "김순자",
    guardianName: "홍길동",
    infoType: "의료기록",
    reason: "어르신 건강 상태 파악을 위해 최근 진료 기록 확인 필요. 최근 통화에서 건강 이상 징후 감지됨.",
    status: "pending",
    requestDate: "2024-01-15",
    seniorConsent: true,
  },
  {
    id: 2,
    counselorName: "이복지",
    seniorName: "박영희",
    guardianName: "박민수",
    infoType: "재정정보",
    reason: "복지 서비스 신청을 위한 소득 정보 확인 필요. 기초생활수급 대상 여부 판단.",
    status: "pending",
    requestDate: "2024-01-15",
    seniorConsent: true,
  },
  {
    id: 3,
    counselorName: "박케어",
    seniorName: "이철수",
    guardianName: "이영희",
    infoType: "가족관계",
    reason: "긴급 연락처 업데이트를 위한 가족 정보 확인",
    status: "approved",
    requestDate: "2024-01-12",
    processDate: "2024-01-13",
    processedBy: "관리자1",
    seniorConsent: true,
  },
  {
    id: 4,
    counselorName: "최돌봄",
    seniorName: "정말자",
    guardianName: "정수민",
    infoType: "의료기록",
    reason: "정기 건강검진 결과 확인 및 상담 자료 필요",
    status: "rejected",
    requestDate: "2024-01-11",
    processDate: "2024-01-12",
    processedBy: "관리자2",
    rejectReason: "어르신 동의 확인 불가",
    seniorConsent: false,
  },
];

const SensitiveInfoManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.counselorName.includes(searchTerm) || 
      req.seniorName.includes(searchTerm) ||
      req.guardianName.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success border-0">승인됨</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-0">대기중</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-0">거부됨</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const handleApprove = () => {
    // Approve logic here
    setSelectedRequest(null);
  };

  const handleReject = () => {
    // Reject logic here
    setSelectedRequest(null);
    setRejectReason("");
  };

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">민감정보 요청 관리</h1>
          <p className="text-muted-foreground mt-1">상담사들의 민감정보 열람 요청을 승인하거나 거부하세요</p>
        </div>

        {/* Alert */}
        <Card className="border-info/50 bg-info/5 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">민감정보 관리 가이드</p>
                <p className="text-sm text-muted-foreground mt-1">
                  민감정보 열람 승인 시 반드시 어르신의 동의 여부를 확인하세요. 
                  승인된 정보는 업무 목적으로만 사용되어야 하며, 모든 열람 기록은 시스템에 저장됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-sm text-muted-foreground">전체 요청</p>
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
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">처리 대기</p>
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
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">승인됨</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">거부됨</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상담사, 어르신, 보호자 이름으로 검색..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>요청 목록</CardTitle>
            <CardDescription>대기 중인 요청을 우선 처리해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상담사</TableHead>
                  <TableHead>어르신</TableHead>
                  <TableHead>보호자</TableHead>
                  <TableHead>정보 유형</TableHead>
                  <TableHead>어르신 동의</TableHead>
                  <TableHead>요청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.counselorName}</TableCell>
                    <TableCell>{request.seniorName}</TableCell>
                    <TableCell>{request.guardianName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.infoType}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.seniorConsent ? (
                        <Badge className="bg-success/10 text-success border-0">동의함</Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-0">미동의</Badge>
                      )}
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          처리하기
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          상세
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Process Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>민감정보 요청 처리</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground">요청 상담사</p>
                <p className="font-medium">{selectedRequest?.counselorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">대상 어르신</p>
                <p className="font-medium">{selectedRequest?.seniorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">보호자</p>
                <p className="font-medium">{selectedRequest?.guardianName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">정보 유형</p>
                <p className="font-medium">{selectedRequest?.infoType}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">요청 사유</p>
              <p className="p-4 bg-secondary/30 rounded-xl text-sm">
                {selectedRequest?.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm">어르신 동의 확인됨</span>
            </div>

            <div className="space-y-2">
              <Label>거부 시 사유 (선택)</Label>
              <Textarea
                placeholder="거부 사유를 입력하세요..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              className="gap-1"
            >
              <XCircle className="w-4 h-4" />
              거부
            </Button>
            <Button 
              onClick={handleApprove}
              className="gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              승인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SensitiveInfoManagement;
