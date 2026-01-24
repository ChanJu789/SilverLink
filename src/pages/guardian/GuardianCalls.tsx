import { useState, useEffect } from "react";
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
  Phone,
  Loader2
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import callReviewsApi from "@/api/callReviews";
import guardiansApi from "@/api/guardians";
import usersApi from "@/api/users";
import { GuardianCallReviewResponse, MyProfileResponse } from "@/types/api";

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

const EmotionBadge = ({ emotion }: { emotion: string }) => {
  switch (emotion?.toLowerCase()) {
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
  const [isLoading, setIsLoading] = useState(true);
  const [callRecords, setCallRecords] = useState<GuardianCallReviewResponse[]>([]);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 사용자 프로필 조회
        const profile = await usersApi.getMyProfile();
        setUserProfile(profile);

        // 내 어르신 목록 조회
        const elderlyResponse = await guardiansApi.getMyElderly();

        // 첫 번째 어르신의 통화 기록 조회
        if (elderlyResponse.elderlyList?.length > 0) {
          const firstElderly = elderlyResponse.elderlyList[0];
          const callsResponse = await callReviewsApi.getCallReviewsForGuardian(firstElderly.elderlyId);
          setCallRecords(callsResponse.content);
        }
      } catch (error) {
        console.error('Failed to fetch call records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 필터링 로직
  const filteredRecords = callRecords.filter(record => {
    const matchesSearch = record.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.callAt?.includes(searchTerm) ||
      record.elderlyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = emotionFilter === "all" || record.emotion?.toLowerCase() === emotionFilter;
    return matchesSearch && matchesEmotion;
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <DashboardLayout role="guardian" userName="로딩중..." navItems={guardianNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="guardian"
      userName={userProfile?.name || "보호자"}
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
              key={record.callId}
              className={`shadow-card border-0 cursor-pointer hover:shadow-elevated transition-all duration-200 ${record.emotion?.toLowerCase() === 'bad' ? 'ring-2 ring-destructive/30' : ''
                }`}
              onClick={() => navigate(`/guardian/calls/${record.callId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Emotion Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${record.emotion?.toLowerCase() === 'good' ? 'bg-success/10' :
                      record.emotion?.toLowerCase() === 'neutral' ? 'bg-warning/10' :
                        'bg-destructive/10'
                    }`}>
                    <EmotionIcon emotion={record.emotion || 'neutral'} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{record.callAt?.split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{record.callAt?.split('T')[1]?.substring(0, 5)}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {record.duration}분
                      </Badge>
                      <EmotionBadge emotion={record.emotion || 'neutral'} />
                      {record.emotion?.toLowerCase() === 'bad' && (
                        <Badge variant="destructive" className="text-xs">
                          주의 필요
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground line-clamp-2 mb-3">
                      {record.summary}
                    </p>
                    {record.counselorComment && (
                      <div className="text-sm text-muted-foreground">
                        상담사 코멘트: <span className="text-foreground">{record.counselorComment}</span>
                      </div>
                    )}
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
                  {callRecords.length === 0 ? '통화 기록이 없습니다' : '검색 결과가 없습니다'}
                </h3>
                <p className="text-muted-foreground">
                  {callRecords.length === 0
                    ? 'AI 안부 통화 후 기록이 표시됩니다'
                    : '다른 검색어나 필터를 사용해보세요'}
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
