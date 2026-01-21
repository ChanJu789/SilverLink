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
  HelpCircle
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data
const parentStatus = {
  name: "김순자",
  age: 78,
  lastCall: "2024-01-15 10:30",
  emotion: "good",
  meal: "완료",
  health: "양호",
  specialNote: null,
};

const recentCalls = [
  { id: 1, date: "2024-01-15", time: "10:30", duration: "15분", emotion: "good", summary: "오늘 아침 식사 잘 하셨고, 컨디션 좋으심" },
  { id: 2, date: "2024-01-14", time: "10:15", duration: "12분", emotion: "neutral", summary: "어제 잠을 잘 못 주무셨다고 하심" },
  { id: 3, date: "2024-01-13", time: "10:45", duration: "18분", emotion: "good", summary: "손자 이야기를 많이 하심, 기분 좋으심" },
];

const emotionStats = {
  good: 75,
  neutral: 20,
  bad: 5,
};

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

const GuardianDashboard = () => {
  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">안녕하세요, 홍길동님</h1>
          <p className="text-muted-foreground mt-1">부모님의 오늘 상태를 확인하세요</p>
        </div>

        {/* Parent Status Summary */}
        <Card className="border-0 shadow-elevated overflow-hidden">
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">담당 어르신</p>
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
                  <span className="text-sm">식사</span>
                </div>
                <p className="font-semibold text-foreground">{parentStatus.meal}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">건강 상태</span>
                </div>
                <p className="font-semibold text-foreground">{parentStatus.health}</p>
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
                    key={call.id}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-card">
                        <EmotionIcon emotion={call.emotion} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{call.date}</span>
                          <span className="text-sm text-muted-foreground">{call.time}</span>
                          <Badge variant="secondary" className="text-xs">
                            {call.duration}
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
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  상담사에게 문의하기
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-3" />
                  복지 서비스 확인
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-3" />
                  자주 묻는 질문
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuardianDashboard;
