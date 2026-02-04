import { useState, useEffect } from "react";
import {
  Heart,
  Utensils,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  MessageSquare,
  FileText,
  HelpCircle,
  Loader2
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import guardiansApi from "@/api/guardians";
import callReviewsApi from "@/api/callReviews";
import usersApi from "@/api/users";
import noticesApi from "@/api/notices";
import { GuardianElderlyResponse, GuardianCallReviewResponse, MyProfileResponse, NoticeResponse } from "@/types/api";
import UnreadNoticeAlert from "@/components/notice/UnreadNoticeAlert";
import { NoticePopup } from "@/components/notice/NoticePopup";

// EmotionIcon 컴포넌트

const EmotionIcon = ({ emotion }: { emotion: string }) => {
  switch (emotion) {
    case "good":
      return <Smile className="w-5 h-5 text-success" />;
    case "neutral":
      return <Meh className="w-5 h-5 text-warning" />;
    case "bad":
      return <Frown className="w-5 h-5 text-destructive" />;
    default:
      return <Meh className="w-5 h-5 text-muted-foreground" />;
  }
};

const translateRelation = (relation: string) => {
  const map: Record<string, string> = {
    CHILD: "자녀",
    SON: "아들",
    DAUGHTER: "딸",
    SPOUSE: "배우자",
    Relative: "친척",
    FRIEND: "지인",
    OTHER: "기타",
  };
  return map[relation] || relation;
};

const GuardianDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);
  const [elderlyData, setElderlyData] = useState<GuardianElderlyResponse | null>(null);
  const [unreadNotices, setUnreadNotices] = useState<NoticeResponse[]>([]);
  const [showUnreadAlert, setShowUnreadAlert] = useState(false);
  const [recentCalls, setRecentCalls] = useState<GuardianCallReviewResponse[]>([]);
  const [emotionStats, setEmotionStats] = useState({ good: 0, neutral: 0, bad: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 사용자 프로필 조회
        const profile = await usersApi.getMyProfile();
        setUserProfile(profile);

        // 내 어르신 목록 조회
        const elderlyResponse = await guardiansApi.getMyElderly();
        setElderlyData(elderlyResponse);

        // 첫 번째 어르신의 통화 기록 조회 (현재 1:1 관계이므로 바로 조회)
        if (elderlyResponse) {
          const elderlyId = elderlyResponse.elderlyId;
          const callsResponse = await callReviewsApi.getCallReviewsForGuardian(elderlyId);
          setRecentCalls(callsResponse.content.slice(0, 3)); // 최근 3건

          // 감정 통계 계산
          const stats = { good: 0, neutral: 0, bad: 0 };
          callsResponse.content.forEach((call) => {
            if (call.emotionLevel === 'GOOD') stats.good++;
            else if (call.emotionLevel === 'NEUTRAL') stats.neutral++;
            else if (call.emotionLevel === 'BAD') stats.bad++;
          });
          const total = callsResponse.content.length || 1;
          setEmotionStats({
            good: Math.round((stats.good / total) * 100),
            neutral: Math.round((stats.neutral / total) * 100),
            bad: Math.round((stats.bad / total) * 100),
          });
        }

        // 팝업 공지사항 조회 (보호자 대상)
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
      // 팝업 공지사항 조회 (보호자 대상)
      const popupNotices = await noticesApi.getPopups();

      console.log("=== 팝업 공지사항 필터링 ===");
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

  // 알림 닫기
  const handleCloseUnreadAlert = () => {
    setShowUnreadAlert(false);
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <DashboardLayout role="guardian" userName="로딩중..." navItems={guardianNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // 어르신 정보 (단일 객체)
  const parentStatus = {
    name: elderlyData?.elderlyName || "정보 없음",
    age: 0, // 나이는 현재 API 응답에 없음 (추후 추가 필요)
    relationType: elderlyData?.relationType || "",
  };

  return (
    <>
      <NoticePopup userRole="GUARDIAN" />
      <DashboardLayout
        role="guardian"
        userName={userProfile?.name || "보호자"}
        navItems={guardianNavItems}
      >
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">안녕하세요, {userProfile?.name}님</h1>
            <p className="text-muted-foreground mt-1">부모님의 오늘 상태를 확인하세요</p>
          </div>

          {/* Parent Status Summary */}
          <Card className="border-0 shadow-elevated overflow-hidden">
            <div className="bg-gradient-primary p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm">가족</p>
                  <h2 className="text-2xl font-bold mt-1">{parentStatus.name} 어르신</h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">{parentStatus.age}세</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">마지막 통화</span>
                  </div>
                  <p className="font-semibold text-foreground">오늘 10:30</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Smile className="w-4 h-4" />
                    <span className="text-sm">감정 상태</span>
                  </div>
                  <p className="font-semibold text-foreground">좋음</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Utensils className="w-4 h-4" />
                    <span className="text-sm">관계</span>
                  </div>
                  <p className="font-semibold text-foreground">{translateRelation(parentStatus.relationType) || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">나이</span>
                  </div>
                  <p className="font-semibold text-foreground">{parentStatus.age}세</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Calls */}
            <div className="lg:col-span-2">
              <Card className="shadow-card border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">최근 통화 기록</CardTitle>
                    <CardDescription>최근 3일간의 통화 내용입니다</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    전체보기 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.callId}
                      className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/guardian/calls/${call.callId}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-card">
                          <EmotionIcon emotion={call.emotionLevel?.toLowerCase() || 'neutral'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{call.callAt?.split('T')[0]}</span>
                            <span className="text-sm text-muted-foreground">{call.callAt?.split('T')[1]?.substring(0, 5)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {call.duration}분
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {call.summary}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Emotion Stats */}
            <div>
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">이번 주 감정 통계</CardTitle>
                  <CardDescription>통화 중 감지된 감정 상태</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-success" />
                        <span className="text-sm">좋음</span>
                      </div>
                      <span className="text-sm font-medium">{emotionStats.good}%</span>
                    </div>
                    <Progress value={emotionStats.good} className="h-2 bg-muted" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Meh className="w-4 h-4 text-warning" />
                        <span className="text-sm">보통</span>
                      </div>
                      <span className="text-sm font-medium">{emotionStats.neutral}%</span>
                    </div>
                    <Progress value={emotionStats.neutral} className="h-2 bg-muted" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Frown className="w-4 h-4 text-destructive" />
                        <span className="text-sm">주의 필요</span>
                      </div>
                      <span className="text-sm font-medium">{emotionStats.bad}%</span>
                    </div>
                    <Progress value={emotionStats.bad} className="h-2 bg-muted" />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">지난 주 대비 10% 개선</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-card border-0 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">빠른 메뉴</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/guardian/inquiry')}>
                    <MessageSquare className="w-4 h-4 mr-3" />
                    상담사에게 문의하기
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/guardian/welfare')}>
                    <FileText className="w-4 h-4 mr-3" />
                    복지 서비스 확인
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/guardian/faq')}>
                    <HelpCircle className="w-4 h-4 mr-3" />
                    자주 묻는 질문
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
            noticesPath="/guardian/notices"
          />
        )}
      </DashboardLayout>
    </>
  );
};

export default GuardianDashboard;
