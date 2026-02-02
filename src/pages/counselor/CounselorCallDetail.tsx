import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  Utensils,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  MessageCircle,
  Heart,
  FileText,
  MessageSquare,
  User,
  Loader2,
  Radio
} from "lucide-react";
import { counselorNavItems } from "@/config/counselorNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import callReviewsApi from "@/api/callReviews";
import usersApi from "@/api/users";
import { CounselorCallRecordResponse, MyProfileResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

const EmotionDisplay = ({ emotion, score }: { emotion: string; score: number }) => {
  const config: Record<string, { icon: typeof Smile; color: string; bg: string; label: string }> = {
    POSITIVE: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    good: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    NEUTRAL: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    neutral: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    NEGATIVE: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
    bad: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
  };
  const { icon: Icon, color, bg, label } = config[emotion] || config.NEUTRAL;

  return (
    <div className={`p-6 rounded-2xl ${bg}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">감정 상태</p>
          <p className={`text-2xl font-bold ${color}`}>{label}</p>
          <p className="text-sm text-muted-foreground">점수: {score}/100</p>
        </div>
      </div>
    </div>
  );
};

interface LiveMessage {
  id: number;
  type: 'PROMPT' | 'REPLY';
  content: string;
  timestamp: Date;
}

const CounselorCallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [callDetail, setCallDetail] = useState<CounselorCallRecordResponse | null>(null);
  const { user } = useAuth();

  // 실시간 모니터링 상태 (자동 시작)
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // const profile = await usersApi.getMyProfile(); (Removed)
        // setUserProfile(profile); (Removed)

        const detail = await callReviewsApi.getCallRecordDetail(parseInt(id));
        setCallDetail(detail);
      } catch (error) {
        console.error('Failed to fetch call detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 실시간 모니터링 시작/종료
  useEffect(() => {
    if (!id || !isLiveMonitoring) {
      // 연결 종료
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setSseConnected(false);
      }
      return;
    }

    // 1. 기존 로그 가져오기
    fetch(`/api/internal/callbot/calls/${id}/logs`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const historyLogs: LiveMessage[] = data.data.map((item: any) => ({
            id: item.id,
            type: item.type,
            content: item.content,
            timestamp: new Date(item.timestamp)
          }));
          setLiveMessages(historyLogs);
        }
      })
      .catch(err => console.error("Failed to fetch logs", err));

    // 2. SSE 연결
    const eventSource = new EventSource(`/api/internal/callbot/calls/${id}/sse`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE Connected');
      setSseConnected(true);
    };

    eventSource.addEventListener('connect', () => {
      console.log('SSE Connection confirmed');
    });

    eventSource.addEventListener('prompt', (e: MessageEvent) => {
      const newLog: LiveMessage = {
        id: Date.now(),
        type: 'PROMPT',
        content: e.data,
        timestamp: new Date()
      };
      setLiveMessages(prev => [...prev, newLog]);
    });

    eventSource.addEventListener('reply', (e: MessageEvent) => {
      const newLog: LiveMessage = {
        id: Date.now(),
        type: 'REPLY',
        content: e.data,
        timestamp: new Date()
      };
      setLiveMessages(prev => [...prev, newLog]);
    });

    eventSource.onerror = (e) => {
      console.error('SSE Error', e);
      setSseConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setSseConnected(false);
    };
  }, [id, isLiveMonitoring]);

  // 실시간 메시지 자동 스크롤
  useEffect(() => {
    if (liveScrollRef.current && isLiveMonitoring) {
      liveScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages, isLiveMonitoring]);

  if (isLoading) {
    return (
      <DashboardLayout role="counselor" userName="로딩중..." navItems={counselorNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!callDetail) {
    return (
      <DashboardLayout role="counselor" userName={user?.name || "상담사"} navItems={counselorNavItems}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">통화 기록을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/counselor/calls")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const emotionScore = callDetail.emotionScore || 60;
  const emotion = callDetail.emotion || 'NEUTRAL';

  return (
    <DashboardLayout
      role="counselor"
      userName={user?.name || "상담사"}
      navItems={counselorNavItems}
    >
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div>
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/counselor/calls")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            통화 기록으로 돌아가기
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">통화 상세 기록</h1>
                <Badge variant="outline" className="text-sm">
                  <User className="w-3 h-3 mr-1" />
                  {callDetail.elderlyName}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {callDetail.callDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {callDetail.callTime}
                </span>
                <Badge variant="secondary">{callDetail.duration}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 실시간 모니터링 카드 */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Radio className="w-5 h-5 text-primary" />
                    실시간 통화 모니터링
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {sseConnected && (
                      <Badge variant="outline" className="animate-pulse text-green-600 border-green-600">
                        ● Live
                      </Badge>
                    )}
                    <Button
                      variant={isLiveMonitoring ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
                    >
                      {isLiveMonitoring ? "모니터링 중지" : "모니터링 시작"}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {isLiveMonitoring
                    ? "실시간으로 통화 내용을 확인하고 있습니다"
                    : "버튼을 클릭하여 실시간 모니터링을 시작하세요"}
                </CardDescription>
              </CardHeader>
              {isLiveMonitoring && (
                <CardContent>
                  <div className="bg-secondary/30 rounded-xl p-4 h-[400px] overflow-y-auto">
                    <div className="space-y-3">
                      {liveMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          대화 내용을 기다리고 있습니다...
                        </div>
                      ) : (
                        liveMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.type === 'PROMPT' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'PROMPT'
                                  ? 'bg-primary/10 text-foreground'
                                  : 'bg-primary text-primary-foreground'
                                }`}
                            >
                              <div className="text-xs opacity-70 mb-1">
                                {msg.type === 'PROMPT' ? 'AI 상담봇' : '어르신'} • {msg.timestamp.toLocaleTimeString()}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={liveScrollRef} />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Summary Card */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  통화 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {callDetail.summary || "요약 정보가 없습니다."}
                </p>
              </CardContent>
            </Card>

            {/* Audio Player */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-primary" />
                  통화 녹음
                </CardTitle>
                <CardDescription>AI 안부 전화 녹음을 들어보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="default"
                      size="icon"
                      className="w-12 h-12 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary rounded-full" />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>00:00</span>
                        <span>{callDetail.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  대화 내용
                </CardTitle>
                <CardDescription>AI와 어르신의 대화 기록입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {callDetail.transcript ? (
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <p className="text-sm whitespace-pre-wrap">{callDetail.transcript}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      대화 내용이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emotion */}
            <EmotionDisplay emotion={emotion} score={emotionScore} />

            {/* Status Cards */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">오늘의 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Health Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">건강 상태</span>
                  </div>
                  <p className="font-medium text-success">
                    {callDetail.riskLevel === 'LOW' ? '양호' :
                      callDetail.riskLevel === 'MEDIUM' ? '보통' :
                        callDetail.riskLevel === 'HIGH' ? '주의' : '정보 없음'}
                  </p>
                </div>

                {/* Review Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-info" />
                    <span className="font-medium">리뷰 상태</span>
                  </div>
                  <p className={`font-medium ${callDetail.isReviewed ? 'text-success' : 'text-warning'}`}>
                    {callDetail.isReviewed ? '리뷰 완료' : '리뷰 대기'}
                  </p>
                </div>

                {/* Special Notes */}
                {callDetail.counselorNote && (
                  <div className="p-4 rounded-xl bg-info/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-info" />
                      <span className="font-medium text-info">상담사 메모</span>
                    </div>
                    <p className="text-sm">{callDetail.counselorNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">AI 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">감정 상태</p>
                  <Badge
                    className={
                      emotion === 'POSITIVE' || emotion === 'good'
                        ? 'bg-success/10 text-success'
                        : emotion === 'NEGATIVE' || emotion === 'bad'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                    }
                  >
                    {emotion === 'POSITIVE' || emotion === 'good' ? '긍정적' :
                      emotion === 'NEGATIVE' || emotion === 'bad' ? '부정적' : '중립'}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">위험도</p>
                  <Badge
                    className={
                      callDetail.riskLevel === 'LOW'
                        ? 'bg-success/10 text-success'
                        : callDetail.riskLevel === 'HIGH'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                    }
                  >
                    {callDetail.riskLevel === 'LOW' ? '낮음' :
                      callDetail.riskLevel === 'MEDIUM' ? '보통' :
                        callDetail.riskLevel === 'HIGH' ? '높음' : '정보 없음'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-3" />
                보호자에게 알림 전송
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-3" />
                긴급 케이스 등록
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CounselorCallDetail;
