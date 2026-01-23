import { useParams, useNavigate } from "react-router-dom";
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
  User
} from "lucide-react";
import { counselorNavItems } from "@/config/counselorNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

// Mock data - 실제로는 id로 데이터를 조회
const callRecordsData: Record<string, {
  id: number;
  seniorName: string;
  seniorAge: number;
  date: string;
  time: string;
  duration: string;
  emotion: string;
  emotionScore: number;
  summary: string;
  mealStatus: { breakfast: boolean | null; lunch: boolean | null; dinner: boolean | null };
  healthStatus: string;
  sleepQuality: string;
  specialNotes: string | null;
  transcript: { speaker: string; text: string; time: string }[];
  aiAnalysis: { emotionKeywords: string[]; concerns: string[]; recommendations: string[] };
}> = {
  "1": {
    id: 1,
    seniorName: "김순자",
    seniorAge: 78,
    date: "2024년 1월 15일",
    time: "오전 10:30",
    duration: "15분 23초",
    emotion: "good",
    emotionScore: 85,
    summary: "오늘 아침 식사를 잘 하셨고, 컨디션이 좋으심. 손자 이야기를 즐겁게 하심. 오후에는 경로당에 가실 예정.",
    mealStatus: { breakfast: true, lunch: null, dinner: null },
    healthStatus: "양호",
    sleepQuality: "좋음",
    specialNotes: null,
    transcript: [
      { speaker: "AI", text: "안녕하세요, 김순자 어르신. 오늘 기분은 어떠세요?", time: "00:00" },
      { speaker: "어르신", text: "네, 오늘 기분이 좋아요. 아침에 손자가 전화했거든요.", time: "00:08" },
      { speaker: "AI", text: "다행이네요. 아침 식사는 드셨나요?", time: "00:15" },
      { speaker: "어르신", text: "응, 아침에 미역국 끓여 먹었어. 맛있었어.", time: "00:22" },
      { speaker: "AI", text: "미역국 좋죠. 오늘 특별한 계획이 있으신가요?", time: "00:30" },
      { speaker: "어르신", text: "오후에 경로당 가기로 했어. 친구들 만나러.", time: "00:38" },
    ],
    aiAnalysis: {
      emotionKeywords: ["기쁨", "만족", "활력"],
      concerns: [],
      recommendations: ["사회활동 참여가 활발하여 정서적으로 안정적입니다.", "규칙적인 식사를 잘 유지하고 계십니다."],
    }
  },
  "2": {
    id: 2,
    seniorName: "박영희",
    seniorAge: 82,
    date: "2024년 1월 15일",
    time: "오전 09:45",
    duration: "12분 08초",
    emotion: "bad",
    emotionScore: 35,
    summary: "어젯밤 잠을 잘 못 주무심. 무릎 통증 호소. 우울감 표현. 병원 방문 권유 필요.",
    mealStatus: { breakfast: false, lunch: null, dinner: null },
    healthStatus: "주의",
    sleepQuality: "불량",
    specialNotes: "무릎 통증으로 인한 수면 장애, 병원 방문 권유 필요",
    transcript: [
      { speaker: "AI", text: "안녕하세요, 박영희 어르신. 잘 주무셨어요?", time: "00:00" },
      { speaker: "어르신", text: "아이고, 어젯밤에 통 잠을 못 잤어요. 무릎이 쑤셔서...", time: "00:08" },
      { speaker: "AI", text: "많이 불편하시겠네요. 아침 식사는 드셨나요?", time: "00:18" },
      { speaker: "어르신", text: "입맛이 없어서 못 먹었어요...", time: "00:25" },
    ],
    aiAnalysis: {
      emotionKeywords: ["우울", "피로", "통증"],
      concerns: ["수면 장애", "식사 거부", "신체 통증"],
      recommendations: ["보호자에게 연락하여 병원 동행 권유가 필요합니다.", "정기적인 안부 확인 횟수를 늘릴 것을 권장합니다."],
    }
  },
  "3": {
    id: 3,
    seniorName: "이철수",
    seniorAge: 75,
    date: "2024년 1월 15일",
    time: "오전 09:15",
    duration: "18분 45초",
    emotion: "neutral",
    emotionScore: 60,
    summary: "전반적으로 양호함. 약 복용 확인 완료. 오후에 경로당 방문 예정.",
    mealStatus: { breakfast: true, lunch: null, dinner: null },
    healthStatus: "양호",
    sleepQuality: "보통",
    specialNotes: null,
    transcript: [
      { speaker: "AI", text: "안녕하세요, 이철수 어르신. 오늘 약은 드셨어요?", time: "00:00" },
      { speaker: "어르신", text: "네, 아까 아침에 먹었어요.", time: "00:08" },
      { speaker: "AI", text: "잘 하셨어요. 오늘 특별한 계획 있으세요?", time: "00:15" },
      { speaker: "어르신", text: "오후에 경로당에 가려고요...", time: "00:22" },
    ],
    aiAnalysis: {
      emotionKeywords: ["평온", "일상적"],
      concerns: [],
      recommendations: ["특이사항 없이 안정적인 상태입니다."],
    }
  },
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

const CounselorCallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const callDetail = callRecordsData[id || "1"] || callRecordsData["1"];

  return (
    <DashboardLayout
      role="counselor"
      userName="김상담"
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
                  {callDetail.seniorName} ({callDetail.seniorAge}세)
                </Badge>
              </div>
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
                          <span className="text-xs font-medium text-accent">{callDetail.seniorName[0]}</span>
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
                    <div className={`text-center p-2 rounded-lg ${callDetail.mealStatus.breakfast ? 'bg-success/10' : 'bg-muted'}`}>
                      <p className="text-muted-foreground text-xs">아침</p>
                      <p className={`font-medium ${callDetail.mealStatus.breakfast ? 'text-success' : 'text-muted-foreground'}`}>
                        {callDetail.mealStatus.breakfast ? '✓' : callDetail.mealStatus.breakfast === false ? '✗' : '-'}
                      </p>
                    </div>
                    <div className={`text-center p-2 rounded-lg ${callDetail.mealStatus.lunch ? 'bg-success/10' : 'bg-muted'}`}>
                      <p className="text-muted-foreground text-xs">점심</p>
                      <p className={`font-medium ${callDetail.mealStatus.lunch ? 'text-success' : 'text-muted-foreground'}`}>
                        {callDetail.mealStatus.lunch ? '✓' : callDetail.mealStatus.lunch === false ? '✗' : '-'}
                      </p>
                    </div>
                    <div className={`text-center p-2 rounded-lg ${callDetail.mealStatus.dinner ? 'bg-success/10' : 'bg-muted'}`}>
                      <p className="text-muted-foreground text-xs">저녁</p>
                      <p className={`font-medium ${callDetail.mealStatus.dinner ? 'text-success' : 'text-muted-foreground'}`}>
                        {callDetail.mealStatus.dinner ? '✓' : callDetail.mealStatus.dinner === false ? '✗' : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">건강 상태</span>
                  </div>
                  <p className={`font-medium ${callDetail.healthStatus === '양호' ? 'text-success' : callDetail.healthStatus === '주의' ? 'text-destructive' : 'text-warning'}`}>
                    {callDetail.healthStatus}
                  </p>
                </div>

                {/* Sleep Quality */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-info" />
                    <span className="font-medium">수면 상태</span>
                  </div>
                  <p className={`font-medium ${callDetail.sleepQuality === '좋음' ? 'text-success' : callDetail.sleepQuality === '불량' ? 'text-destructive' : 'text-info'}`}>
                    {callDetail.sleepQuality}
                  </p>
                </div>

                {/* Special Notes */}
                {callDetail.specialNotes && (
                  <div className="p-4 rounded-xl bg-destructive/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="font-medium text-destructive">특이사항</span>
                    </div>
                    <p className="text-sm text-destructive">{callDetail.specialNotes}</p>
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
                  <p className="text-sm text-muted-foreground mb-2">감정 키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {callDetail.aiAnalysis.emotionKeywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className={callDetail.emotion === 'good' ? 'bg-success/10 text-success' : callDetail.emotion === 'bad' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {callDetail.aiAnalysis.concerns.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">우려 사항</p>
                      <ul className="space-y-1">
                        {callDetail.aiAnalysis.concerns.map((concern, index) => (
                          <li key={index} className="text-sm text-destructive flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">AI 소견</p>
                  <ul className="space-y-2">
                    {callDetail.aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className={`mt-0.5 ${callDetail.emotion === 'good' ? 'text-success' : callDetail.emotion === 'bad' ? 'text-destructive' : 'text-warning'}`}>•</span>
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
