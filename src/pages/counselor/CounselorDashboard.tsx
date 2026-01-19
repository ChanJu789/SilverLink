import { 
  Home, 
  Users, 
  Phone, 
  FileText, 
  MessageSquare, 
  Bell,
  AlertTriangle,
  Heart,
  Activity,
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  TrendingUp,
  UserCheck,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "홈", href: "/counselor", icon: <Home className="w-5 h-5" /> },
  { title: "담당 어르신", href: "/counselor/seniors", icon: <Users className="w-5 h-5" /> },
  { title: "통화 기록", href: "/counselor/calls", icon: <Phone className="w-5 h-5" /> },
  { title: "상담 기록", href: "/counselor/records", icon: <FileText className="w-5 h-5" /> },
  { title: "보호자 문의", href: "/counselor/inquiries", icon: <MessageSquare className="w-5 h-5" />, badge: 5 },
  { title: "긴급 알림", href: "/counselor/alerts", icon: <Bell className="w-5 h-5" />, badge: 2 },
];

// Mock data
const stats = {
  totalSeniors: 45,
  todayCalls: 38,
  pendingInquiries: 5,
  urgentAlerts: 2,
};

const urgentAlerts = [
  { 
    id: 1, 
    seniorName: "박영희", 
    type: "건강", 
    message: "통화 중 호흡 곤란 증상 언급", 
    time: "10분 전",
    severity: "high"
  },
  { 
    id: 2, 
    seniorName: "이철수", 
    type: "정신", 
    message: "우울감 호소, 외로움 표현", 
    time: "30분 전",
    severity: "medium"
  },
];

const recentSeniors = [
  { 
    id: 1, 
    name: "김순자", 
    age: 78, 
    lastCall: "10:30", 
    emotion: "good", 
    status: "completed",
    guardian: "홍길동"
  },
  { 
    id: 2, 
    name: "박영희", 
    age: 82, 
    lastCall: "09:45", 
    emotion: "bad", 
    status: "alert",
    guardian: "박민수"
  },
  { 
    id: 3, 
    name: "이철수", 
    age: 75, 
    lastCall: "09:15", 
    emotion: "neutral", 
    status: "completed",
    guardian: "이영희"
  },
  { 
    id: 4, 
    name: "정미영", 
    age: 80, 
    lastCall: "-", 
    emotion: null, 
    status: "pending",
    guardian: "정철수"
  },
  { 
    id: 5, 
    name: "최동수", 
    age: 77, 
    lastCall: "-", 
    emotion: null, 
    status: "pending",
    guardian: "최민희"
  },
];

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
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/counselor/calls");
  };

  const handleViewDetail = (seniorId: number) => {
    navigate(`/counselor/seniors/${seniorId}`);
  };

  return (
    <DashboardLayout
      role="counselor"
      userName="김상담"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">안녕하세요, 김상담님</h1>
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

        {/* Urgent Alerts */}
        {urgentAlerts.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">긴급 알림</CardTitle>
                <Badge variant="destructive">{urgentAlerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.severity === "high" ? "bg-destructive/10" : "bg-warning/10"
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === "high" ? "text-destructive" : "text-warning"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.seniorName}</span>
                        <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
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
                  <p className="text-sm text-muted-foreground">대기 문의</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingInquiries}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">어르신</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">보호자</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">마지막 통화</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">감정 상태</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSeniors.map((senior) => (
                    <tr key={senior.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                              {senior.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{senior.name}</p>
                            <p className="text-xs text-muted-foreground">{senior.age}세</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{senior.guardian}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{senior.lastCall}</td>
                      <td className="py-4 px-4">
                        <EmotionBadge emotion={senior.emotion} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={senior.status} />
                          <span className="text-sm text-muted-foreground">
                            {senior.status === "completed" ? "완료" : senior.status === "alert" ? "주의" : "대기"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(senior.id)}>
                          상세보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CounselorDashboard;
