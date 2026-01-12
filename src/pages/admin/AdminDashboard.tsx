import { 
  Home, 
  Users, 
  UserCog,
  BarChart3, 
  MessageSquare, 
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Phone,
  Brain,
  ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { title: "홈", href: "/admin", icon: <Home className="w-5 h-5" /> },
  { title: "회원 관리", href: "/admin/members", icon: <Users className="w-5 h-5" /> },
  { title: "회원 등록", href: "/admin/register", icon: <UserCog className="w-5 h-5" /> },
  { title: "배정 관리", href: "/admin/assignments", icon: <UserCog className="w-5 h-5" /> },
  { title: "AI 성능 통계", href: "/admin/ai-stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "민감정보 요청", href: "/admin/sensitive-info", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "불편사항 관리", href: "/admin/complaints", icon: <MessageSquare className="w-5 h-5" />, badge: 8 },
  { title: "시스템 설정", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

const stats = {
  totalUsers: 1250,
  counselors: 45,
  guardians: 380,
  seniors: 825,
  todayCalls: 652,
  pendingComplaints: 8,
  aiAccuracy: 94.5,
};

const recentActivities = [
  { id: 1, type: "user", message: "새로운 보호자 가입: 김철수", time: "5분 전" },
  { id: 2, type: "complaint", message: "불편사항 접수: 상담사 응대 불만", time: "15분 전" },
  { id: 3, type: "alert", message: "긴급 알림: 박영희 어르신 위험 감지", time: "30분 전" },
  { id: 4, type: "assignment", message: "배정 변경: 이상담 → 김복지", time: "1시간 전" },
  { id: 5, type: "ai", message: "AI 모델 성능 분석 완료", time: "2시간 전" },
];

const aiMetrics = [
  { name: "STT 정확도", value: 96.2, change: 1.5 },
  { name: "TTS 품질", value: 94.8, change: 0.8 },
  { name: "감정 분석", value: 92.1, change: -0.3 },
  { name: "응답 시간", value: 98.5, change: 2.1 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">시스템 현황을 한눈에 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 회원</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12 오늘
                  </p>
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
                    진행률 78%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI 정확도</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.aiAccuracy}%</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +0.5% 주간
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">대기 불편사항</p>
                  <p className="text-3xl font-bold text-warning mt-1">{stats.pendingComplaints}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Performance Metrics */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">AI 성능 지표</CardTitle>
                  <CardDescription>실시간 AI 모델 성능 현황</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  상세보기 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}%</span>
                        <span className={`text-xs flex items-center gap-0.5 ${metric.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* User Distribution */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">회원 분포</CardTitle>
              <CardDescription>유형별 회원 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">어르신</span>
                  <span className="font-bold text-primary">{stats.seniors}</span>
                </div>
                <Progress value={(stats.seniors / stats.totalUsers) * 100} className="h-2" />
              </div>
              <div className="p-4 rounded-xl bg-accent/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">보호자</span>
                  <span className="font-bold text-accent">{stats.guardians}</span>
                </div>
                <Progress value={(stats.guardians / stats.totalUsers) * 100} className="h-2" />
              </div>
              <div className="p-4 rounded-xl bg-success/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">상담사</span>
                  <span className="font-bold text-success">{stats.counselors}</span>
                </div>
                <Progress value={(stats.counselors / stats.totalUsers) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">최근 활동</CardTitle>
              <CardDescription>시스템 주요 활동 내역</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-primary/10' :
                    activity.type === 'complaint' ? 'bg-warning/10' :
                    activity.type === 'alert' ? 'bg-destructive/10' :
                    activity.type === 'assignment' ? 'bg-accent/10' :
                    'bg-info/10'
                  }`}>
                    {activity.type === 'user' && <Users className="w-5 h-5 text-primary" />}
                    {activity.type === 'complaint' && <MessageSquare className="w-5 h-5 text-warning" />}
                    {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    {activity.type === 'assignment' && <UserCog className="w-5 h-5 text-accent" />}
                    {activity.type === 'ai' && <Brain className="w-5 h-5 text-info" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.message}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
