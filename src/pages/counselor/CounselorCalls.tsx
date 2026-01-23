import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Phone
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { counselorNavItems } from "@/config/counselorNavItems";

const callRecords = [
  {
    id: 1,
    seniorName: "김순자",
    seniorAge: 78,
    date: "2024-01-15",
    time: "10:30",
    duration: "15분 23초",
    emotion: "good",
    summary: "오늘 아침 식사를 잘 하셨고, 컨디션이 좋으심. 손자 이야기를 즐겁게 하심.",
    transcript: "상담사: 안녕하세요, 김순자 어르신. 오늘 기분이 어떠세요?\n어르신: 네, 오늘 기분이 좋아요. 아침에 손자가 전화했거든요.\n상담사: 오, 그러셨군요. 손자분이 뭐라고 하셨어요?\n어르신: 다음 주에 놀러 온다고 했어요. 너무 기대돼요...",
    keywords: ["식사 완료", "손자", "기분 좋음"],
  },
  {
    id: 2,
    seniorName: "박영희",
    seniorAge: 82,
    date: "2024-01-15",
    time: "09:45",
    duration: "12분 08초",
    emotion: "bad",
    summary: "어젯밤 잠을 잘 못 주무심. 무릎 통증 호소. 우울감 표현.",
    transcript: "상담사: 안녕하세요, 박영희 어르신. 잘 주무셨어요?\n어르신: 아이고, 어젯밤에 통 잠을 못 잤어요. 무릎이 쑤셔서...\n상담사: 많이 아프세요? 병원에 가보셔야 할 것 같은데요.\n어르신: 병원은 무슨... 나 혼자 어떻게 가...",
    keywords: ["수면 부족", "무릎 통증", "우울"],
  },
  {
    id: 3,
    seniorName: "이철수",
    seniorAge: 75,
    date: "2024-01-15",
    time: "09:15",
    duration: "18분 45초",
    emotion: "neutral",
    summary: "전반적으로 양호함. 약 복용 확인 완료. 외출 계획 있음.",
    transcript: "상담사: 안녕하세요, 이철수 어르신. 오늘 약은 드셨어요?\n어르신: 네, 아까 아침에 먹었어요.\n상담사: 잘 하셨어요. 오늘 특별한 계획 있으세요?\n어르신: 오후에 경로당에 가려고요...",
    keywords: ["약 복용", "경로당", "외출"],
  },
  {
    id: 4,
    seniorName: "정말자",
    seniorAge: 80,
    date: "2024-01-14",
    time: "11:00",
    duration: "14분 32초",
    emotion: "good",
    summary: "어제 딸이 방문하여 기분 좋으심. 건강 상태 양호.",
    transcript: "상담사: 안녕하세요, 정말자 어르신. 어떻게 지내세요?\n어르신: 아이고, 어제 우리 딸이 왔다 갔어요. 맛있는 것도 많이 해주고...\n상담사: 좋으셨겠네요. 뭘 해주던가요?\n어르신: 갈비찜을 해줬어요. 얼마나 맛있던지...",
    keywords: ["가족 방문", "기분 좋음", "식사"],
  },
  {
    id: 5,
    seniorName: "최영호",
    seniorAge: 79,
    date: "2024-01-14",
    time: "10:15",
    duration: "11분 18초",
    emotion: "neutral",
    summary: "일상적인 대화. 특이사항 없음. 다음 건강검진 일정 안내.",
    transcript: "상담사: 안녕하세요, 최영호 어르신. 오늘 컨디션은 어떠세요?\n어르신: 뭐, 그냥 그래요. 매일 비슷비슷하지...\n상담사: 네, 다음 주에 건강검진 있으신 거 알고 계시죠?\n어르신: 아, 그래요? 잊고 있었네...",
    keywords: ["건강검진", "일상"],
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

const CounselorCalls = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [emotionFilter, setEmotionFilter] = useState("all");

  const filteredCalls = callRecords.filter((call) => {
    const matchesSearch = call.seniorName.includes(searchTerm) || call.summary.includes(searchTerm);
    const matchesEmotion = emotionFilter === "all" || call.emotion === emotionFilter;
    return matchesSearch && matchesEmotion;
  });

  const todayCalls = callRecords.filter(c => c.date === "2024-01-15").length;
  const avgDuration = "14분 15초";

  return (
    <DashboardLayout
      role="counselor"
      userName="김상담"
      navItems={counselorNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">통화 기록</h1>
            <p className="text-muted-foreground mt-1">어르신들과의 통화 내역을 확인하세요</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{callRecords.length}</p>
                  <p className="text-sm text-muted-foreground">전체 통화</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayCalls}</p>
                  <p className="text-sm text-muted-foreground">오늘 통화</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-info/10">
                  <Clock className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgDuration}</p>
                  <p className="text-sm text-muted-foreground">평균 통화시간</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Frown className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{callRecords.filter(c => c.emotion === "bad").length}</p>
                  <p className="text-sm text-muted-foreground">주의 필요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="어르신 이름, 요약 내용으로 검색..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="감정 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 감정</SelectItem>
                    <SelectItem value="good">좋음</SelectItem>
                    <SelectItem value="neutral">보통</SelectItem>
                    <SelectItem value="bad">주의</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Records Table */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>통화 기록 목록</CardTitle>
            <CardDescription>클릭하여 상세 내용을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>어르신</TableHead>
                  <TableHead>일시</TableHead>
                  <TableHead>통화시간</TableHead>
                  <TableHead>감정상태</TableHead>
                  <TableHead>요약</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.map((call) => (
                  <TableRow 
                    key={call.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/counselor/calls/${call.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{call.seniorName}</p>
                        <p className="text-xs text-muted-foreground">{call.seniorAge}세</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{call.date}</p>
                        <p className="text-xs text-muted-foreground">{call.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EmotionIcon emotion={call.emotion} />
                        <span className="text-sm">
                          {call.emotion === "good" ? "좋음" : call.emotion === "neutral" ? "보통" : "주의"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm text-muted-foreground">{call.summary}</p>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CounselorCalls;
