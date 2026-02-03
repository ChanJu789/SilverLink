import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  User,
  Phone,
  ArrowLeft,
  Clock,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getMySchedule, createScheduleChangeRequest, getMyChangeRequests, CallScheduleResponse, ScheduleChangeRequest } from "@/api/callSchedules";
import { useAuth } from "@/contexts/AuthContext";

const DAY_LABELS: Record<string, string> = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
};

const SeniorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<CallScheduleResponse | null>(null);
  const [requests, setRequests] = useState<ScheduleChangeRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 변경 요청 폼
  const [newTime, setNewTime] = useState("09:00");
  const [newDays, setNewDays] = useState<string[]>(["MON", "WED", "FRI"]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleData, requestsData] = await Promise.all([
        getMySchedule(),
        getMyChangeRequests(),
      ]);
      setSchedule(scheduleData);
      setRequests(requestsData);

      if (scheduleData.preferredCallTime) {
        setNewTime(scheduleData.preferredCallTime);
      }
      if (scheduleData.preferredCallDays?.length > 0) {
        setNewDays(scheduleData.preferredCallDays);
      }
    } catch (err: any) {
      console.error("Failed to load schedule:", err);
      const message = err.response?.data?.message || err.message || "알 수 없는 오류";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (newDays.length === 0) {
      toast.error("통화 요일을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createScheduleChangeRequest({
        preferredCallTime: newTime,
        preferredCallDays: newDays,
      });
      toast.success("변경 요청이 접수되었습니다. 상담사 승인 후 적용됩니다.");
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || "변경 요청에 실패했습니다.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingRequest = requests.some(r => r.status === "PENDING");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12"
            onClick={() => navigate("/senior")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Heart className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">내 정보</h1>
              <p className="text-sm sm:text-base text-muted-foreground">계정 설정</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto space-y-5">
          {/* Profile Info Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">프로필 정보</CardTitle>
                  <CardDescription className="text-base">
                    내 계정 정보를 확인하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">이름</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg">{user?.name || "어르신"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  휴대폰 번호
                </Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg">010-****-****</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Schedule Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">통화 스케줄</CardTitle>
                    <CardDescription className="text-base">
                      정기 통화 일정을 확인하세요
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : schedule ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">스케줄 상태</Label>
                    <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                      {schedule.callScheduleEnabled ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-lg text-green-700">활성화됨</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400" />
                          <p className="text-lg text-gray-500">비활성화</p>
                        </>
                      )}
                    </div>
                  </div>

                  {schedule.callScheduleEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          통화 시간
                        </Label>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-xl font-bold">{schedule.preferredCallTime || "미설정"}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          통화 요일
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {schedule.preferredCallDays?.length > 0 ? (
                            schedule.preferredCallDays.map((day) => (
                              <Badge key={day} className="px-4 py-2 text-base">
                                {DAY_LABELS[day] || day}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">설정된 요일이 없습니다</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full h-14 text-lg"
                    variant="outline"
                    disabled={hasPendingRequest}
                  >
                    {hasPendingRequest ? "변경 요청 대기 중..." : "스케줄 변경 요청"}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">스케줄 정보를 불러올 수 없습니다</p>
                  {error && (
                    <p className="text-sm text-red-500">오류: {error}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="mt-4"
                  >
                    다시 시도
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Request History */}
          {requests.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">변경 요청 내역</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      <Badge
                        variant={
                          req.status === "APPROVED" ? "default" :
                            req.status === "REJECTED" ? "destructive" : "secondary"
                        }
                      >
                        {req.status === "APPROVED" ? "승인됨" :
                          req.status === "REJECTED" ? "거절됨" : "대기중"}
                      </Badge>
                    </div>
                    <p className="text-base">
                      {req.requestedCallTime} / {req.requestedCallDays.map(d => DAY_LABELS[d]).join(", ")}
                    </p>
                    {req.rejectReason && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {req.rejectReason}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Change Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">스케줄 변경 요청</DialogTitle>
            <DialogDescription>
              원하시는 통화 시간과 요일을 선택해주세요.
              상담사 승인 후 적용됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>선호 통화 시간</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                    <SelectItem key={time} value={time} className="text-lg py-2">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>선호 통화 요일</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DAY_LABELS).map(([value, label]) => (
                  <Badge
                    key={value}
                    variant={newDays.includes(value) ? "default" : "outline"}
                    className="cursor-pointer px-5 py-2 text-base"
                    onClick={() => {
                      setNewDays(prev =>
                        prev.includes(value)
                          ? prev.filter(d => d !== value)
                          : [...prev, value]
                      );
                    }}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-12 text-lg"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting || newDays.length === 0}
              className="h-12 text-lg"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              요청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeniorProfile;
