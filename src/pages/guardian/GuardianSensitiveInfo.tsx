import { useState, useEffect } from "react";
import {
  Lock,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { guardianNavItems } from "@/config/guardianNavItems";
import { useAuth } from "@/contexts/AuthContext";
import guardiansApi from "@/api/guardians";
import accessRequestsApi, { AccessScope } from "@/api/accessRequests";
import { GuardianElderlyResponse } from "@/types/api";
import { toast } from "sonner";

const infoTypes = [
  { value: "HEALTH_INFO", label: "건강정보" },
  { value: "MEDICATION", label: "복약정보" },
  { value: "CALL_RECORDS", label: "통화기록" },
];

const GuardianSensitiveInfo = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [myElderly, setMyElderly] = useState<GuardianElderlyResponse[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  const [newRequest, setNewRequest] = useState({
    elderlyName: "",
    elderlyUserId: 0,
    infoType: "",
  });

  const fetchMyElderly = async () => {
    try {
      const data = await guardiansApi.getMyElderly();
      // getMyElderly returns a single object or array depending on API
      if (Array.isArray(data)) {
        setMyElderly(data);
      } else {
        setMyElderly(data ? [data] : []);
      }
    } catch (error) {
      console.error("Failed to fetch my elderly:", error);
    }
  };

  const mapScopeToLabel = (scope: string) => {
    const found = infoTypes.find(t => t.value === scope);
    return found ? found.label : scope;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await accessRequestsApi.getMyRequests();
      const mappedRequests = data.map(r => ({
        id: r.id,
        elderlyName: r.elderlyName,
        infoType: mapScopeToLabel(r.scope),
        scope: r.scope,
        status: r.status.toLowerCase(),
        statusDescription: r.statusDescription,
        documentVerified: r.documentVerified,
        requestDate: r.requestedAt ? r.requestedAt.split('T')[0] : '',
        decidedAt: r.decidedAt ? r.decidedAt.split('T')[0] : null,
        decisionNote: r.decisionNote,
        reviewedBy: r.reviewedBy,
        accessGranted: r.accessGranted,
      }));
      setRequests(mappedRequests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      fetchMyElderly();
    }
  };

  const handleElderlyChange = (name: string) => {
    const selected = myElderly.find(e => e.elderlyName === name);
    setNewRequest({
      ...newRequest,
      elderlyName: name,
      elderlyUserId: selected?.elderlyId || 0,
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.elderlyName.includes(searchTerm);
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
      case "revoked":
        return <Badge className="bg-muted text-muted-foreground border-0">철회됨</Badge>;
      case "expired":
        return <Badge className="bg-muted text-muted-foreground border-0">만료됨</Badge>;
      case "cancelled":
        return <Badge className="bg-muted text-muted-foreground border-0">취소됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.elderlyUserId || !newRequest.infoType) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      await accessRequestsApi.createRequest({
        elderlyUserId: newRequest.elderlyUserId,
        scope: newRequest.infoType as AccessScope,
        reason: "",
      });

      toast.success("민감정보 열람 요청이 전송되었습니다.");
      setIsDialogOpen(false);
      setNewRequest({ elderlyName: "", elderlyUserId: 0, infoType: "" });
      fetchRequests();
    } catch (error: any) {
      console.error("Request failed:", error);
      const message = error?.response?.data?.message || "요청 전송에 실패했습니다.";
      toast.error(message);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelTargetId) return;
    try {
      await accessRequestsApi.cancelRequest(cancelTargetId);
      toast.success("요청이 취소되었습니다.");
      setCancelDialogOpen(false);
      setCancelTargetId(null);
      fetchRequests();
    } catch (error: any) {
      console.error("Cancel failed:", error);
      const message = error?.response?.data?.message || "요청 취소에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <DashboardLayout
      role="guardian"
      userName={user?.name || "보호자"}
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">민감정보 열람 신청</h1>
            <p className="text-muted-foreground mt-1">어르신의 민감정보 열람을 위한 권한을 신청하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                새 신청
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>민감정보 열람 신청</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>어르신 선택</Label>
                  <Select
                    value={newRequest.elderlyName}
                    onValueChange={handleElderlyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="어르신을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {myElderly.map((elderly) => (
                        <SelectItem key={elderly.elderlyId} value={elderly.elderlyName}>
                          {elderly.elderlyName} ({elderly.relationType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>정보 유형</Label>
                  <Select
                    value={newRequest.infoType}
                    onValueChange={(value) => setNewRequest({ ...newRequest, infoType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="열람할 정보 유형을 선택하세요" />
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
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSubmitRequest} className="gap-2">
                  <Send className="w-4 h-4" />
                  신청하기
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
                  민감정보 열람은 관리자의 서류 확인 및 승인이 필요합니다.
                  승인 후 열람이 가능하며, 승인된 정보는 개인 목적으로만 사용해주세요.
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
                  <p className="text-sm text-muted-foreground">전체 신청</p>
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
                  placeholder="어르신 이름으로 검색..."
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
            <CardTitle>신청 목록</CardTitle>
            <CardDescription>민감정보 열람 신청 현황입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>어르신</TableHead>
                  <TableHead>정보 유형</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>처리일</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? "불러오는 중..." : "신청 내역이 없습니다."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.elderlyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.infoType}</Badge>
                      </TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.decidedAt || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => {
                                setCancelTargetId(request.id);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <X className="w-4 h-4" />
                              취소
                            </Button>
                          )}
                          {request.status === "approved" && (
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="w-4 h-4" />
                              열람
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신청 취소</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              이 민감정보 열람 신청을 취소하시겠습니까? 취소 후에는 다시 신청해야 합니다.
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                아니오
              </Button>
              <Button variant="destructive" onClick={handleCancelRequest}>
                취소하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GuardianSensitiveInfo;
