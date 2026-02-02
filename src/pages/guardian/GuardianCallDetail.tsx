import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
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
  Loader2,
  Radio
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import callReviewsApi from "@/api/callReviews";
import usersApi from "@/api/users";
import { GuardianCallReviewResponse, MyProfileResponse } from "@/types/api";

const EmotionDisplay = ({ emotion }: { emotion: string }) => {
  const config = {
    good: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    neutral: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    bad: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
  };
  const emotionKey = emotion?.toLowerCase() as keyof typeof config;
  const { icon: Icon, color, bg, label } = config[emotionKey] || config.neutral;

  return (
    <div className={`p-6 rounded-2xl ${bg}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">감정 상태</p>
          <p className={`text-2xl font-bold ${color}`}>{label}</p>
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

const formatTimeAMPM = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
};

const GuardianCallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);
  const [callDetail, setCallDetail] = useState<GuardianCallReviewResponse | null>(null);

  // 실시간 모니터링 상태 (자동 시작)
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);
  const liveContainerRef = useRef<HTMLDivElement>(null);
  const prevIsCallActiveRef = useRef<boolean | null>(null);

  // 통화 상태 확인
  const isCallActive = callDetail?.state === 'ANSWERED';

  const fetchCallDetail = async (showLoading = true) => {
    if (!id) return;
    try {
      if (showLoading) setIsLoading(true);

      const profile = await usersApi.getMyProfile();
      setUserProfile(profile);

      const callId = parseInt(id);
      const detail = await callReviewsApi.getCallDetailForGuardian(callId);
      setCallDetail(detail);
    } catch (error) {
      console.error('Failed to fetch call detail:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallDetail();
  }, [id]);

  // 통화 진행 중일 때 자동으로 모니터링 시작 + 종료 감지
  useEffect(() => {
    if (isCallActive) {
      setIsLiveMonitoring(true);
    } else {
      setIsLiveMonitoring(false);
      if (prevIsCallActiveRef.current === true) {
        setTimeout(() => fetchCallDetail(false), 2000);
      }
    }
    prevIsCallActiveRef.current = isCallActive ?? null;
  }, [isCallActive]);

  // 통화 중일 때 5초마다 상태 폴링 (종료 감지)
  useEffect(() => {
    if (!isCallActive || !id) return;
    const interval = setInterval(() => {
      fetchCallDetail(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCallActive, id]);

  // 대화 내용 조합 (prompts + responses 시간순 정렬)
  const transcript = useMemo(() => {
    if (!callDetail) return [];
    if (!callDetail.prompts?.length && !callDetail.responses?.length) {
      return [];
    }
    const allMessages = [
      ...(callDetail.prompts || []).map(p => ({
        id: p.promptId,
        type: 'PROMPT' as const,
        content: p.content,
        timestamp: new Date(p.createdAt)
      })),
      ...(callDetail.responses || []).map(r => ({
        id: r.responseId,
        type: 'REPLY' as const,
        content: r.content,
        timestamp: new Date(r.respondedAt),
        danger: r.danger,
        dangerReason: r.dangerReason
      }))
    ];
    return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [callDetail]);

  // SSE 연결은 isCallActive에 연동 (모니터링 중지해도 SSE는 유지)
  useEffect(() => {
    if (!id || !isCallActive) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setSseConnected(false);
      }
      return;
    }

    // 기존 대화 내용(prompts + responses)을 모니터링 초기 메시지로 설정
    const initialMessages: LiveMessage[] = [
      ...(callDetail?.prompts || []).map(p => ({
        id: p.promptId,
        type: 'PROMPT' as const,
        content: p.content,
        timestamp: new Date(p.createdAt)
      })),
      ...(callDetail?.responses || []).map(r => ({
        id: r.responseId,
        type: 'REPLY' as const,
        content: r.content,
        timestamp: new Date(r.respondedAt)
      }))
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setLiveMessages(initialMessages);

    // SSE 연결
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

    eventSource.addEventListener('callEnded', () => {
      console.log('Call ended via SSE');
      eventSource.close();
      setSseConnected(false);
      setTimeout(() => fetchCallDetail(false), 2000);
    });

    eventSource.onerror = (e) => {
      console.error('SSE Error', e);
      setSseConnected(false);
      eventSource.close();
      setTimeout(() => fetchCallDetail(false), 2000);
    };

    return () => {
      eventSource.close();
      setSseConnected(false);
    };
  }, [id, isCallActive]);

  // 모니터링 카드 내부에서만 자동 스크롤 (페이지 스크롤에 영향 없음)
  useEffect(() => {
    if (liveContainerRef.current && isLiveMonitoring && isCallActive) {
      liveContainerRef.current.scrollTop = liveContainerRef.current.scrollHeight;
    }
  }, [liveMessages, isLiveMonitoring, isCallActive]);

  if (isLoading) {
    return (
      <DashboardLayout role="guardian" userName="로딩중..." navItems={guardianNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!callDetail) {
    return (
      <DashboardLayout role="guardian" userName={userProfile?.name || "보호자"} navItems={guardianNavItems}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">통화 기록을 찾을 수 없습니다.</p>
          <Button className="mt-4" onClick={() => navigate("/guardian/calls")}>
            목록으로 돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // 어르신 이름
  const elderlyDisplayName = callDetail.elderlyName || '어르신';

  // 날짜 파싱
  const callDate = callDetail.callAt ? new Date(callDetail.callAt) : null;
  const formattedDate = callDate ? callDate.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '-';
  const formattedTime = callDate ? callDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit'
  }) : '-';

  return (
    <DashboardLayout
      role="guardian"
      userName={userProfile?.name || "보호자"}
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div>
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate("/guardian/calls")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            통화 기록으로 돌아가기
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {elderlyDisplayName}님 통화 상세 기록
                </h1>
                {isCallActive && (
                  <Badge variant="outline" className="animate-pulse text-green-600 border-green-600">
                    <Radio className="w-3 h-3 mr-1" />
                    통화 중
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formattedTime}
                </span>
                <Badge variant="secondary">{callDetail.duration}분</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 실시간 모니터링 카드 - 통화 진행 중일 때만 표시 */}
            {isCallActive && (
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
                    <div ref={liveContainerRef} className="bg-secondary/30 rounded-xl p-4 h-[300px] overflow-y-auto">
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
                              <div className="max-w-[80%]">
                                <div
                                  className={`rounded-lg p-3 ${msg.type === 'PROMPT'
                                    ? 'bg-primary/10 text-foreground'
                                    : 'bg-primary text-primary-foreground'
                                    }`}
                                >
                                  <div className="text-xs opacity-70 mb-1">
                                    {msg.type === 'PROMPT' ? 'AI 상담봇' : elderlyDisplayName}
                                  </div>
                                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                </div>
                                <div className={`text-[11px] opacity-50 mt-1 ${msg.type === 'PROMPT' ? 'text-left' : 'text-right'}`}>
                                  {formatTimeAMPM(msg.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

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

            {/* Counselor Comment */}
            {callDetail.counselorComment && (
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    상담사 코멘트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {callDetail.counselorComment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Transcript - 완료된 통화 시 표시 */}
            {!isCallActive && (
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
                    {transcript.length > 0 ? (
                      transcript.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'PROMPT' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="max-w-[80%]">
                            <div
                              className={`rounded-lg p-3 ${msg.type === 'PROMPT'
                                ? 'bg-primary/10 text-foreground'
                                : 'bg-primary text-primary-foreground'
                                }`}
                            >
                              <div className="text-xs opacity-70 mb-1">
                                {msg.type === 'PROMPT' ? 'AI 상담봇' : elderlyDisplayName}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            </div>
                            <div className={`text-[11px] opacity-50 mt-1 ${msg.type === 'PROMPT' ? 'text-left' : 'text-right'}`}>
                              {formatTimeAMPM(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        대화 내용이 없습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Player Placeholder */}
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
                        <span>{callDetail.duration}:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emotion */}
            <EmotionDisplay emotion={callDetail.emotionLevel?.toLowerCase() || 'neutral'} />

            {/* Elderly Info */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">어르신 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="font-medium">이름</span>
                  </div>
                  <p className="text-foreground font-medium">{elderlyDisplayName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/guardian/inquiry')}>
                <MessageSquare className="w-4 h-4 mr-3" />
                상담사에게 문의하기
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/guardian/complaint')}>
                <AlertTriangle className="w-4 h-4 mr-3" />
                불편사항 접수하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuardianCallDetail;
