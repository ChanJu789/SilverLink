import { useParams, useNavigate } from "react-router-dom";
import { 
  Home, 
  Phone, 
  BarChart3, 
  MessageSquare, 
  HelpCircle,
  FileText,
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
  Heart
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const navItems = [
  { title: "홈", href: "/guardian", icon: <Home className="w-5 h-5" /> },
  { title: "통화 기록", href: "/guardian/calls", icon: <Phone className="w-5 h-5" />, badge: 3 },
  { title: "통계", href: "/guardian/stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "1:1 문의", href: "/guardian/inquiry", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "복지 서비스", href: "/guardian/welfare", icon: <FileText className="w-5 h-5" /> },
  { title: "FAQ", href: "/guardian/faq", icon: <HelpCircle className="w-5 h-5" /> },
];

// Mock data - 실제로는 id로 데이터를 조회
const callDetail = {
  id: 1,
  date: "2024년 1월 15일",
  time: "오전 10:30",
  duration: "15분 32초",
  emotion: "good",
  emotionScore: 85,
  summary: "오늘 아침 식사 잘 하셨고, 컨디션이 좋으셨습니다. 손자 이야기를 하시며 매우 기분이 좋아 보이셨습니다. 오후에는 동네 친구분을 만나러 가실 예정이라고 하셨습니다.",
  mealStatus: {
    breakfast: true,
    lunch: null,
    dinner: null,
  },
  healthStatus: "양호",
  sleepQuality: "좋음",
  specialNotes: null,
  transcript: [
    { speaker: "AI", text: "안녕하세요, 김순자 어르신. 오늘 기분은 어떠세요?", time: "00:00" },
    { speaker: "어르신", text: "아이고, 네 잘 지내. 오늘 날씨가 좋아서 기분이 좋아.", time: "00:08" },
    { speaker: "AI", text: "다행이네요. 아침 식사는 드셨나요?", time: "00:15" },
    { speaker: "어르신", text: "응, 아침에 미역국 끓여 먹었어. 맛있었어.", time: "00:22" },
    { speaker: "AI", text: "미역국 좋죠. 오늘 특별한 계획이 있으신가요?", time: "00:30" },
    { speaker: "어르신", text: "오후에 옆집 순희랑 복지관 가기로 했어. 요가 하러.", time: "00:38" },
    { speaker: "AI", text: "운동하시는 거 정말 좋은 습관이세요. 손자분들은 잘 지내나요?", time: "00:48" },
    { speaker: "어르신", text: "아이고, 우리 손자 말이야? 어제 영상통화 했는데 많이 컸더라고. 키가 벌써 할머니보다 크다니까.", time: "00:55" },
  ],
  aiAnalysis: {
    emotionKeywords: ["기쁨", "만족", "활력"],
    concerns: [],
    recommendations: ["사회활동 참여가 활발하여 정서적으로 안정적입니다.", "규칙적인 식사와 운동을 잘 유지하고 계십니다."],
  }
};

const EmotionDisplay = ({ emotion, score }: { emotion: string; score: number }) => {
  const config = {
    good: { icon: Smile, color: "text-success", bg: "bg-success/10", label: "좋음" },
    neutral: { icon: Meh, color: "text-warning", bg: "bg-warning/10", label: "보통" },
    bad: { icon: Frown, color: "text-destructive", bg: "bg-destructive/10", label: "주의" },
  };
  const { icon: Icon, color, bg, label } = config[emotion as keyof typeof config] || config.neutral;

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

const GuardianCallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={navItems}
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
              <h1 className="text-2xl font-bold text-foreground">통화 상세 기록</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {callDetail.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {callDetail.time}
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
                  {callDetail.summary}
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
                        <span>05:12</span>
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
                  {callDetail.transcript.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex gap-3 ${item.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.speaker === 'AI' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {item.speaker === 'AI' ? (
                          <Heart className="w-4 h-4 text-primary" />
                        ) : (
                          <span className="text-xs font-medium text-accent">김</span>
                        )}
                      </div>
                      <div className={`max-w-[75%] ${item.speaker === 'AI' ? '' : 'text-right'}`}>
                        <div className={`inline-block p-3 rounded-2xl ${
                          item.speaker === 'AI' 
                            ? 'bg-secondary text-secondary-foreground rounded-tl-sm' 
                            : 'bg-primary text-primary-foreground rounded-tr-sm'
                        }`}>
                          <p className="text-sm">{item.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emotion */}
            <EmotionDisplay emotion={callDetail.emotion} score={callDetail.emotionScore} />

            {/* Status Cards */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">오늘의 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meal Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-accent" />
                    <span className="font-medium">식사 여부</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 rounded-lg bg-success/10">
                      <p className="text-muted-foreground text-xs">아침</p>
                      <p className="font-medium text-success">✓</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted">
                      <p className="text-muted-foreground text-xs">점심</p>
                      <p className="font-medium text-muted-foreground">-</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted">
                      <p className="text-muted-foreground text-xs">저녁</p>
                      <p className="font-medium text-muted-foreground">-</p>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">건강 상태</span>
                  </div>
                  <p className="text-success font-medium">{callDetail.healthStatus}</p>
                </div>

                {/* Sleep Quality */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-info" />
                    <span className="font-medium">수면 상태</span>
                  </div>
                  <p className="text-info font-medium">{callDetail.sleepQuality}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">AI 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">감정 키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {callDetail.aiAnalysis.emotionKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-success/10 text-success">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">AI 소견</p>
                  <ul className="space-y-2">
                    {callDetail.aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-3" />
                상담사에게 문의하기
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
