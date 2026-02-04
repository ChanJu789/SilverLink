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
  Loader2
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
import { MyProfileResponse, CounselorResponse, CallRecordSummaryResponse, UnreviewedCountResponse, NoticeResponse } from "@/types/api";
import UnreadNoticeAlert from "@/components/notice/UnreadNoticeAlert";
import { NoticePopup } from "@/components/notice/NoticePopup";
// Mock data removed - using real API data instead

const EmotionBadge = ({ emotion }: { emotion: string | null }) => {
  if (!emotion) return <Badge variant="outline">대기중</Badge>;

  switch (emotion) {
    case "good":
      return <Badge className="bg-success/10 text-success border-0">좋음</Badge>;
    case "neutral":
      return <Badge className="bg-warning/10 text-warning border-0">보통</Badge>;
    case "bad":
      return <Badge className="bg-destructive/10 text-destructive border-0">주의</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "alert":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    case "pending":
      return <Clock className="w-4 h-4 text-muted-foreground" />;
    default:
      return null;
  }
};

const CounselorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  // userProfile state removed
  const [counselorInfo, setCounselorInfo] = useState<CounselorResponse | null>(null);
  const [callRecords, setCallRecords] = useState<CallRecordSummaryResponse[]>([]);
  const [unreviewedCount, setUnreviewedCount] = useState(0);
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

        // 사용자 프로필 조회 (Removed)


        // 상담사 정보 조회
        const counselor = await counselorsApi.getMyInfo();
        setCounselorInfo(counselor);

        // 통화 기록 조회
        const callsResponse = await callReviewsApi.getCallRecordsForCounselor({ size: 10 });
        setCallRecords(callsResponse.content);

        // 미확인 통화 건수
        const unreviewedResponse = await callReviewsApi.getUnreviewedCount();
        setUnreviewedCount(unreviewedResponse.count);

        // 통계 설정
        setStats({
          totalSeniors: counselor.assignedElderlyCount || 0,
          todayCalls: callsResponse.content.length,
          pendingReviews: unreviewedResponse.count,
          urgentAlerts: callsResponse.content.filter(c => c.emotion === 'BAD').length,
        });

        // 읽지 않은 공지사항 조회
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

  // 팝업 공지사항 조회
  const fetchUnreadNotices = async () => {
    try {
      // 팝업 공지사항 조회
      const popupNotices = await noticesApi.getPopups();

      console.log("=== 팝업 공지사항 필터링 (상담사) ===");
      console.log("전체 팝업 공지사항 수:", popupNotices.length);

      // 오늘 하루 보지 않기로 설정한 공지 확인
      const hiddenNotices = getHiddenNotices();

      // 게시중인 팝업 공지사항 필터링 (읽음 여부 무관)
      const visibleList = popupNotices.filter(notice => {
        const isPopup = notice.isPopup; // 팝업 공지
        const isPublished = notice.status === 'PUBLISHED'; // 게시중
        const isHidden = hiddenNotices.includes(notice.id); // 오늘 하루 보지 않기 설정됨

        console.log(`공지 ${notice.id}: 팝업=${isPopup}, 게시중=${isPublished}, 숨김=${isHidden}`);

        // 팝업 공지이고 게시중이며 숨김 처리되지 않은 것만
        return isPopup && isPublished && !isHidden;
      });

      console.log("표시할 팝업 공지사항 수:", visibleList.length);
      console.log("팝업 공지 목록:", visibleList.map(n => ({ id: n.id, title: n.title })));

      if (visibleList.length > 0) {
        setUnreadNotices(visibleList);
        setShowUnreadAlert(true);
      } else {
        console.log("표시할 팝업 공지사항이 없습니다.");
        setShowUnreadAlert(false);
      }
    } catch (error) {
      console.error('Failed to fetch popup notices:', error);
    }
  };

  // 오늘 하루 보지 않기로 설정한 공지 목록 가져오기
  const getHiddenNotices = (): number[] => {
    const stored = localStorage.getItem('hidden_popup_notices');
    if (!stored) return [];

    try {
      const data = JSON.parse(stored);
      const today = new Date().toDateString();

      // 오늘 날짜가 아니면 초기화
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">안녕하세요, {user?.name || "상담사"}님</h1>
            <p className="text-muted-foreground mt-1">오늘의 상담 현황을 확인하세요</p>
          </div>

          {/* Urgent Alerts - Only show if there are alerts from real data */}
          {stats.urgentAlerts > 0 && (
            <Card className="border-destructive/50 bg-destructive/5 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-lg text-destructive">긴급 알림</CardTitle>
                  <Badge variant="destructive">{stats.urgentAlerts}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {callRecords.filter(c => c.emotion === 'BAD').map((call) => (
                  <div
                    key={call.callId}
                    className="flex items-center justify-between p-4 rounded-xl bg-card shadow-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive/10">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{call.elderlyName}</span>
                          <Badge variant="outline" className="text-xs">주의</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">AI 감정 분석: 부정적 신호 감지</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {call.callAt}
                      </span>
                      <Button size="sm" variant="destructive" onClick={() => handleViewDetail(call.callId)}>
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
                    <p className="text-sm text-muted-foreground">오늘 통화</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats.todayCalls}</p>
                    <p className="text-xs text-success flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      84% 완료
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

          {/* Seniors List */}
          <Card className="shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">오늘의 통화 현황</CardTitle>
                <CardDescription>담당 어르신별 통화 상태를 확인하세요</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAll}>
                전체보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {callRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  오늘 통화 기록이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">어르신</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">통화 일시</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">통화 시간</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">감정 상태</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">확인 상태</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callRecords.slice(0, 5).map((call) => (
                        <tr key={call.callId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                  {call.elderlyName?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{call.elderlyName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {call.callAt}
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {call.duration || '-'}
                          </td>
                          <td className="py-4 px-4">
                            <EmotionBadge emotion={call.emotion === 'GOOD' ? 'good' : call.emotion === 'BAD' ? 'bad' : 'neutral'} />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon status={call.reviewed ? 'completed' : 'pending'} />
                              <span className="text-sm text-muted-foreground">
                                {call.reviewed ? '확인됨' : '미확인'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(call.callId)}>
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
