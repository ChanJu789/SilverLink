import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Pill,
  AlertTriangle,
  Brain,
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Plus,
  CheckCircle,
  Edit,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { counselorNavItems } from "@/config/counselorNavItems";

// Mock data
const seniorData = {
  id: "1",
  name: "김영숙",
  age: 78,
  gender: "여성",
  phone: "010-1234-5678",
  address: "서울시 강남구 역삼동 123-45",
  registeredDate: "2024-01-15",
  guardian: {
    name: "김민수",
    relation: "아들",
    phone: "010-9876-5432",
  },
  healthInfo: {
    bloodPressure: "130/85",
    bloodSugar: "110",
    weight: "58kg",
    height: "155cm",
    diseases: ["고혈압", "당뇨(경증)"],
    medications: [
      { name: "아모디핀", dosage: "5mg", frequency: "1일 1회", time: "아침" },
      { name: "메트포르민", dosage: "500mg", frequency: "1일 2회", time: "아침/저녁" },
    ],
    allergies: ["페니실린"],
    lastCheckup: "2024-12-15",
  },
  emotionTrend: [
    { date: "12/20", score: 72, anxiety: 25, depression: 18 },
    { date: "12/21", score: 68, anxiety: 30, depression: 22 },
    { date: "12/22", score: 75, anxiety: 20, depression: 15 },
    { date: "12/23", score: 70, anxiety: 28, depression: 20 },
    { date: "12/24", score: 82, anxiety: 15, depression: 12 },
    { date: "12/25", score: 85, anxiety: 12, depression: 10 },
    { date: "12/26", score: 78, anxiety: 18, depression: 14 },
  ],
  aiAnalysis: {
    overallScore: 78,
    emotionState: "양호",
    riskLevel: "낮음",
    keywords: ["가족", "건강", "외로움", "식사"],
    concerns: [
      { type: "경미", content: "최근 식사량 감소 언급" },
      { type: "관찰", content: "손자 방문 후 기분 호전" },
    ],
    recommendations: [
      "정기적인 가족 연락 권장",
      "식사 패턴 모니터링 필요",
      "외출 활동 격려",
    ],
    voiceAnalysis: {
      clarity: 85,
      energy: 72,
      stability: 88,
      responseTime: 1.2,
    },
  },
  recentCalls: [
    { date: "2024-12-26", duration: "8분 32초", emotion: "좋음", summary: "손자 방문 이야기, 식사 잘 함" },
    { date: "2024-12-25", duration: "12분 15초", emotion: "매우 좋음", summary: "크리스마스 가족 모임, 기분 좋음" },
    { date: "2024-12-24", duration: "6분 48초", emotion: "보통", summary: "날씨 이야기, 약간 외로움 표현" },
  ],
  counselingRecords: [
    {
      id: "1",
      date: "2024-12-26",
      counselor: "이상담",
      type: "정기 상담",
      content: "어르신 상태 양호. 손자 방문 후 기분이 많이 좋아지셨다고 함. 식사량도 증가.",
      followUp: "다음 주 복지관 프로그램 참여 권유",
    },
    {
      id: "2",
      date: "2024-12-20",
      counselor: "이상담",
      type: "건강 체크",
      content: "혈압 측정 결과 정상 범위. 복약 잘 하고 계심. 약간의 수면 장애 호소.",
      followUp: "수면 패턴 모니터링, 필요시 의료진 연계",
    },
  ],
};

const radarData = [
  { subject: "음성 명료도", A: 85, fullMark: 100 },
  { subject: "대화 에너지", A: 72, fullMark: 100 },
  { subject: "정서 안정성", A: 88, fullMark: 100 },
  { subject: "반응 속도", A: 80, fullMark: 100 },
  { subject: "대화 참여도", A: 75, fullMark: 100 },
];

export default function SeniorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [newRecord, setNewRecord] = useState({
    type: "정기 상담",
    content: "",
    followUp: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveRecord = () => {
    // Saving record...
    setNewRecord({ type: "정기 상담", content: "", followUp: "" });
    setIsEditing(false);
  };

  const getEmotionBadge = (emotion: string) => {
    const variants: Record<string, string> = {
      "매우 좋음": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      "좋음": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      "보통": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      "나쁨": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      "매우 나쁨": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return variants[emotion] || variants["보통"];
  };

  const getRiskBadge = (level: string) => {
    const variants: Record<string, string> = {
      "낮음": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      "보통": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      "높음": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return variants[level] || variants["보통"];
  };

  return (
    <DashboardLayout
      role="counselor"
      userName="이상담"
      userAvatar=""
      navItems={counselorNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{seniorData.name}</h1>
              <Badge className={getRiskBadge(seniorData.aiAnalysis.riskLevel)}>
                위험도: {seniorData.aiAnalysis.riskLevel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {seniorData.age}세 · {seniorData.gender} · {seniorData.address}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            긴급 연락
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">기본 정보</TabsTrigger>
            <TabsTrigger value="health">건강 정보</TabsTrigger>
            <TabsTrigger value="ai">AI 분석</TabsTrigger>
            <TabsTrigger value="records">상담 기록</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    기본 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">이름</p>
                      <p className="font-medium">{seniorData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">나이</p>
                      <p className="font-medium">{seniorData.age}세</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">성별</p>
                      <p className="font-medium">{seniorData.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">등록일</p>
                      <p className="font-medium">{seniorData.registeredDate}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> 연락처
                    </p>
                    <p className="font-medium">{seniorData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> 주소
                    </p>
                    <p className="font-medium">{seniorData.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Guardian Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-accent" />
                    보호자 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">이름</p>
                      <p className="font-medium">{seniorData.guardian.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">관계</p>
                      <p className="font-medium">{seniorData.guardian.relation}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">연락처</p>
                    <p className="font-medium">{seniorData.guardian.phone}</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    보호자에게 메시지 보내기
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Calls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  최근 통화 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seniorData.recentCalls.map((call, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{call.date}</p>
                          <p className="text-xs text-muted-foreground">{call.duration}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <div>
                          <Badge className={getEmotionBadge(call.emotion)}>{call.emotion}</Badge>
                          <p className="text-sm mt-1">{call.summary}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        상세보기
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                      <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">혈압</p>
                      <p className="text-xl font-bold">{seniorData.healthInfo.bloodPressure}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">혈당</p>
                      <p className="text-xl font-bold">{seniorData.healthInfo.bloodSugar} mg/dL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">체중</p>
                      <p className="text-xl font-bold">{seniorData.healthInfo.weight}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">최근 검진</p>
                      <p className="text-xl font-bold">{seniorData.healthInfo.lastCheckup}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Diseases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    기저 질환
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seniorData.healthInfo.diseases.map((disease, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">알레르기</p>
                    <div className="flex flex-wrap gap-2">
                      {seniorData.healthInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-sm">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    복용 약물
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seniorData.healthInfo.medications.map((med, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{med.name}</p>
                          <Badge variant="outline">{med.dosage}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {med.frequency} · {med.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-6">
            {/* AI Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {seniorData.aiAnalysis.overallScore}
                  </div>
                  <p className="text-sm text-muted-foreground">종합 점수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Badge className={getEmotionBadge(seniorData.aiAnalysis.emotionState === "양호" ? "좋음" : "보통")} >
                    {seniorData.aiAnalysis.emotionState}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">감정 상태</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Badge className={getRiskBadge(seniorData.aiAnalysis.riskLevel)}>
                    {seniorData.aiAnalysis.riskLevel}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">위험 수준</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Emotion Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    감정 추이 (최근 7일)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={seniorData.emotionTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="감정 점수"
                      />
                      <Line
                        type="monotone"
                        dataKey="anxiety"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="불안 지수"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Voice Analysis Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    음성 분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="분석 결과"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Keywords & Concerns */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>주요 키워드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seniorData.aiAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>주의 사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seniorData.aiAnalysis.concerns.map((concern, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                        <Badge
                          variant={concern.type === "경미" ? "secondary" : "outline"}
                          className="shrink-0"
                        >
                          {concern.type}
                        </Badge>
                        <p className="text-sm">{concern.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  AI 권장 사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {seniorData.aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counseling Records Tab */}
          <TabsContent value="records" className="space-y-6">
            {/* New Record Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  새 상담 기록 작성
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">상담 유형</Label>
                    <select
                      id="type"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                    >
                      <option value="정기 상담">정기 상담</option>
                      <option value="건강 체크">건강 체크</option>
                      <option value="긴급 상담">긴급 상담</option>
                      <option value="가족 연계">가족 연계</option>
                      <option value="복지 서비스">복지 서비스</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>작성일</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">상담 내용</Label>
                  <Textarea
                    id="content"
                    placeholder="상담 내용을 입력하세요..."
                    rows={4}
                    value={newRecord.content}
                    onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUp">후속 조치</Label>
                  <Textarea
                    id="followUp"
                    placeholder="후속 조치 사항을 입력하세요..."
                    rows={2}
                    value={newRecord.followUp}
                    onChange={(e) => setNewRecord({ ...newRecord, followUp: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewRecord({ type: "정기 상담", content: "", followUp: "" })}>
                    초기화
                  </Button>
                  <Button onClick={handleSaveRecord} className="gap-2">
                    <Save className="h-4 w-4" />
                    저장하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Past Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  상담 기록 이력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {seniorData.counselingRecords.map((record) => (
                      <div key={record.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {record.date}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              담당: {record.counselor}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">상담 내용</p>
                            <p className="text-sm">{record.content}</p>
                          </div>
                          {record.followUp && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">후속 조치</p>
                              <p className="text-sm text-primary">{record.followUp}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
