import { useState } from "react";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Smile,
  Meh,
  Frown,
  Utensils,
  Activity,
  Moon,
  Phone
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - Weekly emotion data
const weeklyEmotionData = [
  { day: "월", good: 85, neutral: 10, bad: 5, score: 85 },
  { day: "화", good: 70, neutral: 25, bad: 5, score: 78 },
  { day: "수", good: 90, neutral: 8, bad: 2, score: 92 },
  { day: "목", good: 60, neutral: 30, bad: 10, score: 68 },
  { day: "금", good: 75, neutral: 20, bad: 5, score: 80 },
  { day: "토", good: 88, neutral: 10, bad: 2, score: 90 },
  { day: "일", good: 82, neutral: 15, bad: 3, score: 85 },
];

// Mock data - Monthly emotion data
const monthlyEmotionData = [
  { month: "8월", good: 75, neutral: 18, bad: 7, score: 78, calls: 28 },
  { month: "9월", good: 72, neutral: 20, bad: 8, score: 75, calls: 30 },
  { month: "10월", good: 80, neutral: 15, bad: 5, score: 82, calls: 31 },
  { month: "11월", good: 78, neutral: 17, bad: 5, score: 80, calls: 29 },
  { month: "12월", good: 85, neutral: 12, bad: 3, score: 88, calls: 31 },
  { month: "1월", good: 82, neutral: 14, bad: 4, score: 85, calls: 15 },
];

// Emotion distribution for pie chart
const emotionDistribution = [
  { name: "좋음", value: 75, color: "hsl(145, 60%, 42%)" },
  { name: "보통", value: 20, color: "hsl(38, 92%, 55%)" },
  { name: "주의", value: 5, color: "hsl(0, 72%, 55%)" },
];

// Daily activities data
const weeklyActivitiesData = [
  { day: "월", meals: 3, sleep: 7, exercise: 1 },
  { day: "화", meals: 3, sleep: 6, exercise: 0 },
  { day: "수", meals: 3, sleep: 8, exercise: 1 },
  { day: "목", meals: 2, sleep: 5, exercise: 0 },
  { day: "금", meals: 3, sleep: 7, exercise: 1 },
  { day: "토", meals: 3, sleep: 8, exercise: 1 },
  { day: "일", meals: 3, sleep: 7, exercise: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 rounded-lg shadow-elevated border border-border">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GuardianStats = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("weekly");

  const currentScore = 85;
  const previousScore = 78;
  const scoreDiff = currentScore - previousScore;

  return (
    <DashboardLayout
      role="guardian"
      userName={user?.name || "보호자"}
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">통계</h1>
            <p className="text-muted-foreground mt-1">부모님의 감정 및 생활 패턴을 분석합니다</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={period === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("weekly")}
            >
              주간
            </Button>
            <Button 
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              월간
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">평균 통화시간</p>
                  <p className="text-3xl font-bold text-foreground mt-1">14<span className="text-lg">분</span></p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-success">
                    <TrendingUp className="w-4 h-4" />
                    <span>2분 증가</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 통화 횟수</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {period === "weekly" ? "7" : "45"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {period === "weekly" ? "이번 주" : "이번 달"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">평균 식사 횟수</p>
                  <p className="text-3xl font-bold text-foreground mt-1">2.9</p>
                  <p className="text-sm text-success mt-1">일 3회 권장</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">평균 수면 시간</p>
                  <p className="text-3xl font-bold text-foreground mt-1">6.8<span className="text-lg">h</span></p>
                  <p className="text-sm text-warning mt-1">7-8시간 권장</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Emotion Trend Chart */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0 h-full">
              <CardHeader>
                <CardTitle className="text-lg">감정 추이</CardTitle>
                <CardDescription>
                  {period === "weekly" ? "이번 주" : "최근 6개월"} 감정 점수 변화
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={period === "weekly" ? weeklyEmotionData : monthlyEmotionData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(172, 50%, 38%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(172, 50%, 38%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
                      <XAxis 
                        dataKey={period === "weekly" ? "day" : "month"} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(172, 50%, 38%)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        name="감정 점수"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emotion Distribution */}
          <div>
            <Card className="shadow-card border-0 h-full">
              <CardHeader>
                <CardTitle className="text-lg">감정 분포</CardTitle>
                <CardDescription>
                  {period === "weekly" ? "이번 주" : "이번 달"} 감정 상태 비율
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emotionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {emotionDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emotion Detail Bar Chart */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">일별 감정 상세</CardTitle>
            <CardDescription>
              {period === "weekly" ? "요일별" : "월별"} 감정 상태 분포
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={period === "weekly" ? weeklyEmotionData : monthlyEmotionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
                  <XAxis 
                    dataKey={period === "weekly" ? "day" : "month"} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="good" stackId="a" fill="hsl(145, 60%, 42%)" name="좋음" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral" stackId="a" fill="hsl(38, 92%, 55%)" name="보통" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bad" stackId="a" fill="hsl(0, 72%, 55%)" name="주의" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activities Chart */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">생활 패턴 분석</CardTitle>
            <CardDescription>
              식사, 수면, 운동 패턴을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="meals">
              <TabsList className="mb-4">
                <TabsTrigger value="meals" className="gap-2">
                  <Utensils className="w-4 h-4" />
                  식사
                </TabsTrigger>
                <TabsTrigger value="sleep" className="gap-2">
                  <Moon className="w-4 h-4" />
                  수면
                </TabsTrigger>
                <TabsTrigger value="exercise" className="gap-2">
                  <Activity className="w-4 h-4" />
                  운동
                </TabsTrigger>
              </TabsList>

              <TabsContent value="meals">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={weeklyActivitiesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 3]} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="meals" fill="hsl(16, 80%, 60%)" name="식사 횟수" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="sleep">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={weeklyActivitiesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="hsl(210, 80%, 55%)" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(210, 80%, 55%)", strokeWidth: 0 }}
                        name="수면 시간"
                        unit="시간"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="exercise">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={weeklyActivitiesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 2]} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="exercise" fill="hsl(145, 60%, 42%)" name="운동 횟수" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuardianStats;
