import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  Search,
  Filter,
  Play,
  Phone
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const callRecords = [
  { 
    id: 1, 
    date: "2024-01-15", 
    time: "10:30", 
    duration: "15분 32초", 
    emotion: "good", 
    summary: "오늘 아침 식사 잘 하셨고, 컨디션 좋으심. 손자 이야기를 하시며 기분이 좋아 보이셨습니다.",
    mealStatus: "아침 완료",
    healthStatus: "양호",
    hasAlert: false
  },
  { 
    id: 2, 
    date: "2024-01-14", 
    time: "10:15", 
    duration: "12분 45초", 
    emotion: "neutral", 
    summary: "어제 잠을 잘 못 주무셨다고 하심. 무릎이 조금 아프시다고 언급하셨습니다.",
    mealStatus: "아침 완료",
    healthStatus: "경미한 통증",
    hasAlert: false
  },
  { 
    id: 3, 
    date: "2024-01-13", 
    time: "10:45", 
    duration: "18분 20초", 
    emotion: "good", 
    summary: "손자 이야기를 많이 하심. 기분 좋으심. 오후에 산책 예정이라고 하셨습니다.",
    mealStatus: "아침 완료",
    healthStatus: "양호",
    hasAlert: false
  },
  { 
    id: 4, 
    date: "2024-01-12", 
    time: "10:20", 
    duration: "14분 10초", 
    emotion: "good", 
    summary: "친구분과 전화 통화를 하셨다고 기분 좋게 말씀하셨습니다.",
    mealStatus: "아침 완료",
    healthStatus: "양호",
    hasAlert: false
  },
  { 
    id: 5, 
    date: "2024-01-11", 
    time: "10:35", 
    duration: "16분 55초", 
    emotion: "bad", 
    summary: "외로움을 표현하심. 자녀들이 자주 연락하지 않는다고 아쉬워하셨습니다.",
    mealStatus: "아침 미완료",
    healthStatus: "우울감",
    hasAlert: true
  },
  { 
    id: 6, 
    date: "2024-01-10", 
    time: "10:25", 
    duration: "13분 40초", 
    emotion: "neutral", 
    summary: "날씨가 추워서 외출을 못하셨다고 하심. 실내 운동을 권유드렸습니다.",
    mealStatus: "아침 완료",
    healthStatus: "양호",
    hasAlert: false
  },
];

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

const EmotionBadge = ({ emotion }: { emotion: string }) => {
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

const GuardianCalls = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("all");

  const filteredRecords = callRecords.filter(record => {
    const matchesSearch = record.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.date.includes(searchTerm);
    const matchesEmotion = emotionFilter === "all" || record.emotion === emotionFilter;
    return matchesSearch && matchesEmotion;
  });

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">통화 기록</h1>
          <p className="text-muted-foreground mt-1">부모님과의 AI 안부 통화 기록을 확인하세요</p>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="날짜 또는 내용으로 검색..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="감정 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="good">좋음</SelectItem>
                  <SelectItem value="neutral">보통</SelectItem>
                  <SelectItem value="bad">주의 필요</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Call Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card 
              key={record.id}
              className={`shadow-card border-0 cursor-pointer hover:shadow-elevated transition-all duration-200 ${
                record.hasAlert ? 'ring-2 ring-destructive/30' : ''
              }`}
              onClick={() => navigate(`/guardian/calls/${record.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Emotion Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    record.emotion === 'good' ? 'bg-success/10' :
                    record.emotion === 'neutral' ? 'bg-warning/10' :
                    'bg-destructive/10'
                  }`}>
                    <EmotionIcon emotion={record.emotion} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{record.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{record.time}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {record.duration}
                      </Badge>
                      <EmotionBadge emotion={record.emotion} />
                      {record.hasAlert && (
                        <Badge variant="destructive" className="text-xs">
                          주의 필요
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground line-clamp-2 mb-3">
                      {record.summary}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-muted-foreground">
                        식사: <span className="text-foreground">{record.mealStatus}</span>
                      </span>
                      <span className="text-muted-foreground">
                        건강: <span className="text-foreground">{record.healthStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRecords.length === 0 && (
            <Card className="shadow-card border-0">
              <CardContent className="p-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-muted-foreground">
                  다른 검색어나 필터를 사용해보세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuardianCalls;
