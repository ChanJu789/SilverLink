import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Phone,
  Loader2
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
import callReviewsApi from "@/api/callReviews";
import usersApi from "@/api/users";
import { CallRecordSummaryResponse, MyProfileResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

const EmotionIcon = ({ emotion }: { emotion: string }) => {
  switch (emotion?.toLowerCase()) {
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
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [callRecords, setCallRecords] = useState<CallRecordSummaryResponse[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 사용자 프로필 조회 (Removed)


        // 통화 기록 조회
        const callsResponse = await callReviewsApi.getCallRecordsForCounselor({ size: 50 });
        setCallRecords(callsResponse.content);
      } catch (error) {
        console.error('Failed to fetch call records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCalls = callRecords.filter((call) => {
    const matchesSearch = call.elderlyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = emotionFilter === "all" || call.emotion?.toLowerCase() === emotionFilter;
    return matchesSearch && matchesEmotion;
  });

  // 통계 계산
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = callRecords.filter(c => c.callAt?.startsWith(today)).length;
  const avgDuration = callRecords.length > 0
    ? Math.round(callRecords.reduce((sum, c) => sum + (c.duration || 0), 0) / callRecords.length)
    : 0;
  const badEmotionCount = callRecords.filter(c => c.emotion?.toLowerCase() === 'bad').length;

  if (isLoading) {
    return (
      <DashboardLayout role="counselor" userName="로딩중..." navItems={counselorNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="counselor"
      userName={user?.name || "상담사"}
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
                  <p className="text-2xl font-bold">{avgDuration}분</p>
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
                  <p className="text-2xl font-bold">{badEmotionCount}</p>
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
            {filteredCalls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {callRecords.length === 0 ? '통화 기록이 없습니다.' : '검색 결과가 없습니다.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>어르신</TableHead>
                    <TableHead>일시</TableHead>
                    <TableHead>통화시간</TableHead>
                    <TableHead>감정상태</TableHead>
                    <TableHead>요약</TableHead>
                    <TableHead>리뷰</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => (
                    <TableRow
                      key={call.callId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/counselor/calls/${call.callId}`)}
                    >
                      <TableCell>
                        <p className="font-medium">{call.elderlyName}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{call.callAt?.split('T')[0]}</p>
                          <p className="text-xs text-muted-foreground">
                            {call.callAt?.split('T')[1]?.substring(0, 5)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{call.duration}분</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EmotionIcon emotion={call.emotion || 'neutral'} />
                          <span className="text-sm">
                            {call.emotion?.toLowerCase() === "good" ? "좋음" :
                              call.emotion?.toLowerCase() === "neutral" ? "보통" : "주의"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm text-muted-foreground">{call.summary}</p>
                      </TableCell>
                      <TableCell>
                        {call.hasReview ? (
                          <span className="text-xs text-success">완료</span>
                        ) : (
                          <span className="text-xs text-warning">미작성</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CounselorCalls;
