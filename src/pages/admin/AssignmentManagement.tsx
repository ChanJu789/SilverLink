import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  RefreshCw,
  Plus,
  Loader2
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import counselorsApi from "@/api/counselors";
import adminsApi from "@/api/admins";
import assignmentsApi, { AssignmentResponse } from "@/api/assignments";
import { CounselorResponse } from "@/types/api";

interface CounselorWithAssignment extends CounselorResponse {
  assignedCount: number;
  capacity: number;
  region?: string;
}

interface SeniorDisplay {
  id: number;
  name: string;
  counselorName: string;
  assignedAt: string;
}

const AssignmentManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // API 데이터
  const [counselors, setCounselors] = useState<CounselorWithAssignment[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);

  // 폼 상태
  const [selectedElderlyId, setSelectedElderlyId] = useState<string>("");
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>("");

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 상담사 목록 조회
        const counselorList = await counselorsApi.getAllCounselors();

        // 각 상담사별 배정 현황 포함
        const counselorsWithStats: CounselorWithAssignment[] = counselorList.map(c => ({
          ...c,
          assignedCount: c.assignedElderlyCount || 0,
          capacity: 50, // 기본 용량
          region: "서울"
        }));
        setCounselors(counselorsWithStats);

        // 전체 배정 목록 (첫 번째 상담사 기준으로 조회하거나 별도 API 필요)
        // 현재는 각 상담사별로 조회
        const allAssignments: AssignmentResponse[] = [];
        for (const counselor of counselorList.slice(0, 5)) { // 최대 5명
          try {
            const counselorAssignments = await assignmentsApi.getCounselorAssignments(counselor.id);
            allAssignments.push(...counselorAssignments);
          } catch (e) {
            // 개별 오류는 무시
          }
        }
        setAssignments(allAssignments);

      } catch (error) {
        console.error("데이터 로드 실패:", error);
        // fallback 데이터 사용
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 새 배정 처리
  const handleAssign = async () => {
    if (!selectedElderlyId || !selectedCounselorId) {
      toast.error("어르신과 상담사를 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await assignmentsApi.assignCounselor({
        counselorId: parseInt(selectedCounselorId),
        elderlyId: parseInt(selectedElderlyId)
      });

      setAssignments([response, ...assignments]);
      setIsDialogOpen(false);
      setSelectedElderlyId("");
      setSelectedCounselorId("");
      toast.success("배정이 완료되었습니다.");
    } catch (error) {
      console.error("배정 실패:", error);
      toast.error("배정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 필터링된 배정 목록
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.elderlyName.includes(searchQuery) ||
      a.counselorName.includes(searchQuery);
    const matchesCounselor = selectedCounselor === "all" ||
      a.counselorId.toString() === selectedCounselor;
    return matchesSearch && matchesCounselor && a.status === 'ACTIVE';
  });

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="관리자" navItems={adminNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">배정 관리</h1>
            <p className="text-muted-foreground mt-1">상담사에게 어르신을 배정하고 관리합니다</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 배정
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 배정</DialogTitle>
                <DialogDescription>어르신을 담당 상담사에게 배정합니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>어르신 ID</Label>
                  <Input
                    type="number"
                    placeholder="어르신 ID를 입력하세요"
                    value={selectedElderlyId}
                    onChange={(e) => setSelectedElderlyId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>담당 상담사</Label>
                  <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="상담사를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {counselors.map(counselor => (
                        <SelectItem key={counselor.id} value={counselor.id.toString()}>
                          {counselor.name} ({counselor.assignedCount}/{counselor.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={handleAssign} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  배정하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Counselor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {counselors.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                등록된 상담사가 없습니다.
              </CardContent>
            </Card>
          ) : (
            counselors.map((counselor) => (
              <Card key={counselor.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {counselor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{counselor.name}</h3>
                      <p className="text-sm text-muted-foreground">{counselor.region || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">배정 현황</span>
                      <span className="font-medium">{counselor.assignedCount}/{counselor.capacity}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${counselor.assignedCount / counselor.capacity > 0.9 ? 'bg-destructive' :
                            counselor.assignedCount / counselor.capacity > 0.7 ? 'bg-warning' : 'bg-success'
                          }`}
                        style={{ width: `${Math.min((counselor.assignedCount / counselor.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {Math.max(counselor.capacity - counselor.assignedCount, 0)}명 추가 배정 가능
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assignment List */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">배정 현황</CardTitle>
                    <CardDescription>어르신별 담당 상담사 현황 ({filteredAssignments.length}건)</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="검색..."
                        className="pl-10 w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="상담사" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 상담사</SelectItem>
                        {counselors.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    배정 내역이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAssignments.map((assignment) => (
                      <div
                        key={assignment.assignmentId}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-info/10 text-info">
                              {assignment.elderlyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{assignment.elderlyName}</p>
                            <p className="text-sm text-muted-foreground">
                              배정일: {new Date(assignment.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{assignment.counselorName}</p>
                            <Badge variant="outline" className="text-xs">
                              {assignment.status === 'ACTIVE' ? '배정중' : '종료'}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            변경
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Changes - 최근 배정 내역 */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">최근 배정</CardTitle>
              <CardDescription>최근 배정 내역</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  배정 내역이 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.assignmentId} className="p-4 rounded-xl bg-secondary/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{assignment.elderlyName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{assignment.counselorName}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {assignment.assignedByAdminName} 배정
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentManagement;
