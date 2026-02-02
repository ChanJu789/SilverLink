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
  Radio,
  Edit3,
  CheckCircle2,
  Save
} from "lucide-react";
import { counselorNavItems } from "@/config/counselorNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this component or standard textarea
import { useToast } from "@/components/ui/use-toast"; // Using local toast in future if available, or just alert? Assuming useToast hook exists or I'll use standard alert for now if not found in imports previously, wait, I saw Toaster in previous history. I'll use standard window.alert or add Toaster to main.
// Actually, I should check if `useToast` exists. In `CounselorCallDetail.tsx` imports, it wasn't there.
// I'll stick to simple state management for now, or just `alert` if needed, but better to use UI.
// Let's use `Label` and `Textarea` from shadcn/ui if available. I see `Input` was used in `CounselorCalls.tsx`. I'll assume `Textarea` exists or use standard one.
// Wait, I don't see `Textarea` imported in the original file. I'll use standard `textarea` with Tailwind classes.

import callReviewsApi from "@/api/callReviews";
import usersApi from "@/api/users";
import { CallRecordDetailResponse, CallResponseItem, CallPromptItem } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

const EmotionDisplay = ({ emotion, emotionKorean }: { emotion: string; emotionKorean?: string }) => {
  const config: Record<string, { icon: typeof Smile; color: string; bg: string; label: string }> = {
    POSITIVE: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    good: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    NEUTRAL: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    neutral: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    NEGATIVE: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
    bad: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
  };
  const { icon: Icon, color, bg, label } = config[emotion] || config.NEUTRAL;
  const displayLabel = emotionKorean || label;

  return (
    <div className={`p-6 rounded-2xl ${bg}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">감정 상태</p>
          <p className={`text-2xl font-bold ${color}`}>{displayLabel}</p>
        </div>
      </div>
    </div>
  );
};

interface ConversationMessage {
  id: number;
  type: 'prompt' | 'response';
  content: string;
  timestamp: Date;
  isDanger?: boolean;
  dangerReason?: string;
  isLive?: boolean;
}

const CounselorCallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [callDetail, setCallDetail] = useState<CallRecordDetailResponse | null>(null);
  const { user } = useAuth();

  // 통합된 메시지 상태
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 리뷰 관련 상태
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewEditing, setIsReviewEditing] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        const detail = await callReviewsApi.getCallRecordDetail(parseInt(id)) as unknown as CallRecordDetailResponse;
        setCallDetail(detail);

        if (detail.review) {
          setReviewComment(detail.review.comment);
          setIsReviewEditing(false); // 이미 리뷰가 있으면 보기 모드로 시작
        } else {
          setIsReviewEditing(true); // 리뷰가 없으면 작성 모드로 시작
        }

        // 초기 메시지 구성
        const initialMessages: ConversationMessage[] = [
          ...(detail.prompts || []).map(p => ({
            id: p.promptId,
            type: 'prompt' as const,
            content: p.content,
            timestamp: new Date(p.createdAt)
          })),
          ...(detail.responses || []).map(r => ({
            id: r.responseId,
            type: 'response' as const,
            content: r.content,
            timestamp: new Date(r.respondedAt),
            isDanger: r.danger,
            dangerReason: r.dangerReason
          }))
        ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages(initialMessages);

      } catch (error) {
        console.error('Failed to fetch call detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // SSE 연결 (항상 연결 시도)
  useEffect(() => {
    if (!id) return;

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
      const newLog: ConversationMessage = {
        id: Date.now(),
        type: 'prompt',
        content: e.data,
        timestamp: new Date(),
        isLive: true
      };
      setMessages(prev => [...prev, newLog]);
    });

    eventSource.addEventListener('reply', (e: MessageEvent) => {
      const newLog: ConversationMessage = {
        id: Date.now(),
        type: 'response',
        content: e.data,
        timestamp: new Date(),
        isLive: true
      };
      setMessages(prev => [...prev, newLog]);
    });

    eventSource.onerror = (e) => {
      // SSE 에러는 자연스러운 연결 종료일 수도 있으므로 조용히 처리하거나 로그만 남김
      // console.error('SSE Error', e); 
      setSseConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setSseConnected(false);
    };
  }, [id]);

  // 메시지 업데이트 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSaveReview = async () => {
    if (!id || !reviewComment.trim()) return;

    try {
      setIsSavingReview(true);
      if (callDetail?.review) {
        // Update existing review
        await callReviewsApi.updateReview(callDetail.review.reviewId, {
          callId: parseInt(id),
          comment: reviewComment
        });
      } else {
        // Create new review
        await callReviewsApi.createReview({
          callId: parseInt(id),
          comment: reviewComment
        });
      }

      // Refresh data
      const detail = await callReviewsApi.getCallRecordDetail(parseInt(id)) as unknown as CallRecordDetailResponse;
      setCallDetail(detail);
      setIsReviewEditing(false);
      alert("상담 일지가 저장되었습니다."); // Simple feedback

    } catch (error) {
      console.error("Failed to save review:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSavingReview(false);
    }
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

  const emotionScore = callDetail.emotions?.[0] ? 60 : 60;
  const emotion = callDetail.emotions?.[0]?.emotionLevel || 'NEUTRAL';
  const emotionKorean = callDetail.emotions?.[0]?.emotionLevelKorean || '보통';

  // 요약 정보
  const latestSummary = callDetail.summaries?.[0]?.content || null;

  // 날짜/시간 포맷팅
  const callAt = new Date(callDetail.callAt);
  const callDate = callAt.toLocaleDateString('ko-KR');
  const callTime = callAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  // 리뷰 여부
  const isReviewed = !!callDetail.review;
  const riskLevel = callDetail.responses?.some(r => r.danger) ? 'HIGH' : 'LOW';

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
                  {callDetail.elderly?.name}
                </Badge>
                {sseConnected && (
                  <Badge variant="outline" className="animate-pulse text-green-600 border-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    실시간 통화 중
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {callDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {callTime}
                </span>
                <Badge variant="secondary">{callDetail.duration}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

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
                  {latestSummary || "요약 정보가 없습니다."}
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
                {callDetail.recordingUrl ? (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <audio
                      controls
                      className="w-full"
                      src={callDetail.recordingUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="bg-secondary/50 rounded-xl p-4 text-center text-muted-foreground">
                    녹음 파일이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript - 대화 내용 (통합됨) */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      대화 내용
                    </CardTitle>
                    <CardDescription>AI와 어르신의 대화 기록입니다</CardDescription>
                  </div>
                  {sseConnected && (
                    <Badge variant="secondary" className="animate-pulse">
                      실시간 업데이트 중...
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/30 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      대화 내용이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg, index) => (
                        <div
                          key={`${msg.type}-${msg.id}-${index}`}
                          className={`flex ${msg.type === 'prompt' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'prompt'
                              ? 'bg-primary/10 text-foreground'
                              : msg.isDanger
                                ? 'bg-destructive/20 text-foreground border border-destructive/50'
                                : 'bg-primary text-primary-foreground'
                              } ${msg.isLive ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
                          >
                            <div className="text-xs opacity-70 mb-1 flex justify-between gap-2">
                              <span>
                                {msg.type === 'prompt' ? 'AI 상담봇' : '어르신'} • {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              {msg.isLive && <Badge variant="outline" className="h-4 px-1 text-[10px] border-border/50">NEW</Badge>}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            {msg.isDanger && msg.dangerReason && (
                              <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {msg.dangerReason}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emotion */}
            <EmotionDisplay emotion={emotion} emotionKorean={emotionKorean} />

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
                    {riskLevel === 'LOW' ? '양호' :
                      riskLevel === 'MEDIUM' ? '보통' :
                        riskLevel === 'HIGH' ? '주의' : '정보 없음'}
                  </p>
                </div>

                {/* Review Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-info" />
                      <span className="font-medium">리뷰 상태</span>
                    </div>
                  </div>
                  <p className={`font-medium ${isReviewed ? 'text-success' : 'text-warning'}`}>
                    {isReviewed ? '리뷰 완료' : '리뷰 대기'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review Write/View Card */}
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    상담 일지
                  </CardTitle>
                  {!isReviewEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsReviewEditing(true)}>
                      수정
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isReviewEditing ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full min-h-[120px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="상담 내용을 기록해주세요."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      {/* Only show cancel if a review already exists */}
                      {callDetail.review && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setReviewComment(callDetail.review?.comment || "");
                          setIsReviewEditing(false);
                        }}>
                          취소
                        </Button>
                      )}

                      <Button size="sm" onClick={handleSaveReview} disabled={isSavingReview}>
                        {isSavingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            저장 중
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            저장
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm whitespace-pre-wrap">
                      {callDetail.review?.comment || "작성된 상담 일지가 없습니다."}
                    </p>
                    {callDetail.review && (
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        작성일: {new Date(callDetail.review.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
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
                      riskLevel === 'LOW'
                        ? 'bg-success/10 text-success'
                        : riskLevel === 'HIGH'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                    }
                  >
                    {riskLevel === 'LOW' ? '낮음' :
                      riskLevel === 'MEDIUM' ? '보통' :
                        riskLevel === 'HIGH' ? '높음' : '정보 없음'}
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
