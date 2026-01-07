import { useState } from "react";
import { 
  Home, 
  Users, 
  Phone, 
  FileText, 
  MessageSquare, 
  Bell,
  Megaphone,
  Lock,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Send
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
  DialogTrigger,
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
  { title: "홈", href: "/counselor", icon: <Home className="w-5 h-5" /> },
  { title: "담당 어르신", href: "/counselor/seniors", icon: <Users className="w-5 h-5" /> },
  { title: "통화 기록", href: "/counselor/calls", icon: <Phone className="w-5 h-5" /> },
  { title: "상담 기록", href: "/counselor/records", icon: <FileText className="w-5 h-5" /> },
  { title: "보호자 문의", href: "/counselor/inquiries", icon: <MessageSquare className="w-5 h-5" />, badge: 5 },
  { title: "긴급 알림", href: "/counselor/alerts", icon: <Bell className="w-5 h-5" />, badge: 2 },
  { title: "공지사항", href: "/counselor/notices", icon: <Megaphone className="w-5 h-5" /> },
  { title: "민감정보 요청", href: "/counselor/sensitive-info", icon: <Lock className="w-5 h-5" /> },
];

const requests = [
  {
    id: 1,
    seniorName: "김순자",
    guardianName: "홍길동",
    infoType: "의료기록",
    reason: "어르신 건강 상태 파악을 위해 최근 진료 기록 확인 필요",
    status: "approved",
    requestDate: "2024-01-10",
    processDate: "2024-01-11",
    processedBy: "관리자1",
  },
  {
    id: 2,
    seniorName: "박영희",
    guardianName: "박민수",
    infoType: "재정정보",
    reason: "복지 서비스 신청을 위한 소득 정보 확인 필요",
    status: "pending",
    requestDate: "2024-01-15",
    processDate: null,
    processedBy: null,
  },
  {
    id: 3,
    seniorName: "이철수",
    guardianName: "이영희",
    infoType: "가족관계",
    reason: "긴급 연락처 업데이트를 위한 가족 정보 확인",
    status: "rejected",
    requestDate: "2024-01-12",
    processDate: "2024-01-13",
    processedBy: "관리자2",
    rejectReason: "어르신 동의 미확보",
  },
  {
    id: 4,
    seniorName: "정말자",
    guardianName: "정수민",
    infoType: "의료기록",
    reason: "정기 건강검진 결과 확인 및 상담 자료 필요",
    status: "pending",
    requestDate: "2024-01-14",
    processDate: null,
    processedBy: null,
  },
];

const infoTypes = [
  { value: "medical", label: "의료기록" },
  { value: "financial", label: "재정정보" },
  { value: "family", label: "가족관계" },
  { value: "address", label: "주거정보" },
  { value: "other", label: "기타" },
];

const CounselorSensitiveInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    seniorName: "",
    guardianName: "",
    infoType: "",
    reason: "",
  });

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.seniorName.includes(searchTerm) || req.guardianName.includes(searchTerm);
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

  const handleSubmitRequest = () => {
    // Submit logic here
    setIsDialogOpen(false);
    setNewRequest({ seniorName: "", guardianName: "", infoType: "", reason: "" });
  };

  return (
    <DashboardLayout
      role="counselor"
      userName="김상담"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">민감정보 요청</h1>
            <p className="text-muted-foreground mt-1">어르신 민감정보 열람을 위한 권한을 요청하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                새 요청
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>민감정보 열람 요청</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>어르신 성함</Label>
                  <Input
                    placeholder="어르신 성함을 입력하세요"
                    value={newRequest.seniorName}
                    onChange={(e) => setNewRequest({ ...newRequest, seniorName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>보호자 성함</Label>
                  <Input
                    placeholder="보호자 성함을 입력하세요"
                    value={newRequest.guardianName}
                    onChange={(e) => setNewRequest({ ...newRequest, guardianName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>정보 유형</Label>
                  <Select
                    value={newRequest.infoType}
                    onValueChange={(value) => setNewRequest({ ...newRequest, infoType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="정보 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {infoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>요청 사유</Label>
                  <Textarea
                    placeholder="민감정보가 필요한 사유를 상세히 작성해주세요"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSubmitRequest} className="gap-2">
                  <Send className="w-4 h-4" />
                  요청하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alert */}
        <Card className="border-warning/50 bg-warning/5 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">민감정보 열람 안내</p>
                <p className="text-sm text-muted-foreground mt-1">
                  민감정보 열람은 어르신의 동의와 관리자의 승인이 필요합니다. 
                  요청 사유를 명확히 작성해주시고, 승인된 정보는 업무 목적으로만 사용해주세요.
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
                  <p className="text-sm text-muted-foreground">대기중</p>
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
                  placeholder="어르신 또는 보호자 이름으로 검색..."
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
            <CardDescription>민감정보 열람 요청 현황입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>어르신</TableHead>
                  <TableHead>보호자</TableHead>
                  <TableHead>정보 유형</TableHead>
                  <TableHead>요청 사유</TableHead>
                  <TableHead>요청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.seniorName}</TableCell>
                    <TableCell>{request.guardianName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.infoType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">{request.reason}</p>
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "approved" && (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          열람
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
    </DashboardLayout>
  );
};

export default CounselorSensitiveInfo;
