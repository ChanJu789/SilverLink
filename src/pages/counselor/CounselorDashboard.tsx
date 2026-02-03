import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
  Search,
  Users,
  MessageSquare,
  Clock,
  Loader2,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { counselorNavItems } from "@/config/counselorNavItems";
import { useAuth } from "@/contexts/AuthContext";
import usersApi from "@/api/users";
import counselorsApi from "@/api/counselors";
import callReviewsApi from "@/api/callReviews";
import noticesApi from "@/api/notices";
import emergencyAlertsApi, { EmergencyAlertSummary } from "@/api/emergencyAlerts";
import { MyProfileResponse, CounselorResponse, CallRecordSummaryResponse, UnreviewedCountResponse, NoticeResponse } from "@/types/api";
import UnreadNoticeAlert from "@/components/notice/UnreadNoticeAlert";
import { NoticePopup } from "@/components/notice/NoticePopup";
// Mock data


const EmotionBadge = ({ emotion }: { emotion: string | null }) => {
  if (!emotion) return <Badge variant="outline">대기중</Badge>;

  switch (emotion) {
    case "GOOD":
      return <Badge className="bg-success/10 text-success border-0">좋음</Badge>;
    case "NEUTRAL":
      return <Badge className="bg-warning/10 text-warning border-0">보통</Badge>;
    case "BAD":
      return <Badge className="bg-destructive/10 text-destructive border-0">주의</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "FAILED":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4 text-muted-foreground" />;
    case "ANSWERED":
      return <PhoneCall className="w-4 h-4 text-primary" />;
    case "REQUESTED":
    case "IN_PROGRESS":
      return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    case "PENDING":
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const CounselorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [counselorInfo, setCounselorInfo] = useState<CounselorResponse | null>(null);
  const [callRecords, setCallRecords] = useState<CallRecordSummaryResponse[]>([]);
  const [realUrgentAlerts, setRealUrgentAlerts] = useState<EmergencyAlertSummary[]>([]);
  const [unreadNotices, setUnreadNotices] = useState<NoticeResponse[]>([]);
  const [showUnreadAlert, setShowUnreadAlert] = useState(false);

  const [stats, setStats] = useState({
    totalSeniors: 0,
    todayCalls: 0,
    pendingReviews: 0,
    urgentAlerts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. 상담사 정보 조회
        const counselor = await counselorsApi.getMyInfo();
        setCounselorInfo(counselor);

        // 2. 통화 기록 조회 (최근 10건)
        const callsResponse = await callReviewsApi.getCallRecordsForCounselor({ size: 10 });
        setCallRecords(callsResponse.content);

        // 3. 미확인 통화 건수
        const unreviewedResponse = await callReviewsApi.getUnreviewedCount();

        // 4. 긴급 알림 (미처리) 조회 - NEW
        const pendingAlerts = await emergencyAlertsApi.getPendingAlertsForCounselor();
        setRealUrgentAlerts(pendingAlerts);

        // 5. 통계 설정
        setStats({
          totalSeniors: counselor.assignedElderlyCount || 0,
          todayCalls: callsResponse.content.length, // This might need a proper "Today's calls" API if records are historical
          pendingReviews: unreviewedResponse.count,
          urgentAlerts: pendingAlerts.length,
        });

        // 6. 읽지 않은 공지사항 조회
        await fetchUnreadNotices();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 페이지가 다시 포커스될 때 공지사항 다시 확인
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("페이지가 다시 활성화됨 - 공지사항 재확인");
        fetchUnreadNotices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 팝업 공지사항 조회 logic...
  const fetchUnreadNotices = async () => {
    try {
      const popupNotices = await noticesApi.getPopups();
      const hiddenNotices = getHiddenNotices();

      const visibleList = popupNotices.filter(notice => {
        const isPopup = notice.isPopup;
        const isPublished = notice.status === 'PUBLISHED';
        const isHidden = hiddenNotices.includes(notice.id);
        return isPopup && isPublished && !isHidden;
      });

      if (visibleList.length > 0) {
        setUnreadNotices(visibleList);
        setShowUnreadAlert(true);
      } else {
        setShowUnreadAlert(false);
      }
    } catch (error) {
      console.error('Failed to fetch popup notices:', error);
    }
  };

  const getHiddenNotices = (): number[] => {
    const stored = localStorage.getItem('hidden_popup_notices');
    if (!stored) return [];
    try {
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date !== today) {
        localStorage.removeItem('hidden_popup_notices');
        return [];
      }
      return data.noticeIds || [];
    } catch {
      return [];
    }
  };

  const handleCloseUnreadAlert = () => {
    setShowUnreadAlert(false);
  };

  const handleViewAll = () => {
    navigate("/counselor/calls");
  };

  const handleViewDetail = (callId: number) => {
    navigate(`/counselor/calls/${callId}`);
  };

  const handleAlertClick = (alertId: number) => {
    navigate(`/counselor/alerts`); // Or specific detail? Alerts page seems safer
  };

  if (isLoading) {
    return (
      <DashboardLayout role="counselor" userName="로딩중..." navItems={counselorNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <NoticePopup userRole="COUNSELOR" />
      <DashboardLayout
        role="counselor"
        userName={user?.name || "상담사"}
        navItems={counselorNavItems}
      >
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">안녕하세요, {user?.name || "상담사"}님</h1>
              <p className="text-muted-foreground mt-1">오늘의 상담 현황을 확인하세요</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="어르신 검색..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Urgent Alerts (Real Data) */}
          {realUrgentAlerts.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-lg text-destructive">긴급 알림</CardTitle>
                  <Badge variant="destructive">{realUrgentAlerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {realUrgentAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className="flex items-center justify-between p-4 rounded-xl bg-card shadow-card cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAlertClick(alert.alertId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.severity === "CRITICAL" ? "bg-destructive/10" : "bg-warning/10"
                        }`}>
                        <AlertTriangle className={`w-5 h-5 ${alert.severity === "CRITICAL" ? "text-destructive" : "text-warning"
                          }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.elderlyName}</span>
                          <Badge variant="outline" className="text-xs">{alert.alertTypeText}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{alert.timeAgo}</span>
                      <Button size="sm" variant="destructive">
                        확인하기
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">담당 어르신</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats.totalSeniors}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">최근 통화</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats.todayCalls}</p>
                    <p className="text-xs text-success flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <PhoneCall className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">미확인 통화</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingReviews}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">긴급 알림</p>
                    <p className="text-3xl font-bold text-destructive mt-1">{stats.urgentAlerts}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call Records List (Real Data) */}
          <Card className="shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">최근 통화 현황</CardTitle>
                <CardDescription>담당 어르신별 최근 통화 기록입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAll}>
                전체보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {callRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  최근 통화 기록이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">어르신</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">통화 시간</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">감정 상태</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callRecords.map((record) => (
                        <tr key={record.callId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                  {record.elderlyName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{record.elderlyName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{new Date(record.callAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-4 px-4">
                            <EmotionBadge emotion={record.emotionLevel} />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon status={record.state} />
                              <span className="text-sm text-muted-foreground">
                                {record.stateKorean}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record.callId)}>
                              상세보기
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 읽지 않은 공지사항 알림 */}
        {showUnreadAlert && (
          <UnreadNoticeAlert
            notices={unreadNotices.map(notice => ({
              id: notice.id,
              title: notice.title,
              isPriority: notice.isPriority
            }))}
            onClose={handleCloseUnreadAlert}
            noticesPath="/counselor/notices"
          />
        )}
      </DashboardLayout>
    </>
  );
};

export default CounselorDashboard;
