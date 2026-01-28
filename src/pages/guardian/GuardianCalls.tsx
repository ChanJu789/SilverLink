import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  ChevronLeft,
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
import { GuardianCallReviewResponse, MyProfileResponse, PageResponse } from "@/types/api";

// 감정 아이콘 컴포넌트 (React.memo로 최적화)
const EmotionIcon = memo(({ emotionLevel }: { emotionLevel: string | null }) => {
  if (!emotionLevel) return <Meh className="w-5 h-5 text-muted-foreground" />;
  
  switch (emotionLevel) {
    case "GOOD":
      return <Smile className="w-5 h-5 text-success" />;
    case "NORMAL":
      return <Meh className="w-5 h-5 text-warning" />;
    case "BAD":
    case "DEPRESSED":
      return <Frown className="w-5 h-5 text-destructive" />;
    default:
      return <Meh className="w-5 h-5 text-muted-foreground" />;
  }
});

EmotionIcon.displayName = 'EmotionIcon';

// 감정 배지 컴포넌트 (React.memo로 최적화)
const EmotionBadge = memo(({ emotionLevel }: { emotionLevel: string | null }) => {
  if (!emotionLevel) return <Badge variant="outline">-</Badge>;
  
  switch (emotionLevel) {
    case "GOOD":
      return <Badge className="bg-success/10 text-success border-0">좋음</Badge>;
    case "NORMAL":
      return <Badge className="bg-warning/10 text-warning border-0">보통</Badge>;
    case "BAD":
      return <Badge className="bg-destructive/10 text-destructive border-0">주의</Badge>;
    case "DEPRESSED":
      return <Badge className="bg-destructive/10 text-destructive border-0">우울</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
});

EmotionBadge.displayName = 'EmotionBadge';

const GuardianCalls = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [callRecords, setCallRecords] = useState<GuardianCallReviewResponse[]>([]);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elderlyId, setElderlyId] = useState<number | null>(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5; // 페이지당 5개씩 표시

  // 데이터 로드 함수 (useCallback으로 메모이제이션)
  const fetchCallRecords = useCallback(async (page: number = 0) => {
    if (!elderlyId) return;
    
    try {
      setIsLoading(true);
      const callsResponse = await callReviewsApi.getCallReviewsForGuardian(elderlyId, { page, size: pageSize });
      
      if (callsResponse) {
        const records = callsResponse.content || [];
        const pages = callsResponse.totalPages || Math.ceil((callsResponse.totalElements || records.length) / pageSize);
        const elements = callsResponse.totalElements || records.length;
        
        setCallRecords(records);
        setTotalPages(pages);
        setTotalElements(elements);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Failed to fetch call records:', error);
      setError(error.response?.data?.message || '데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [elderlyId, pageSize]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 병렬로 데이터 조회 (성능 최적화)
        const [profile, elderlyResponse] = await Promise.all([
          usersApi.getMyProfile(),
          guardiansApi.getMyElderly()
        ]);

        setUserProfile(profile);

        // 어르신 정보가 있으면 통화 기록 조회
        if (elderlyResponse && elderlyResponse.elderlyId) {
          setElderlyId(elderlyResponse.elderlyId);
          const callsResponse = await callReviewsApi.getCallReviewsForGuardian(elderlyResponse.elderlyId, { page: 0, size: pageSize });
          
          if (callsResponse) {
            const records = callsResponse.content || [];
            const pages = callsResponse.totalPages || Math.ceil((callsResponse.totalElements || records.length) / pageSize);
            const elements = callsResponse.totalElements || records.length;
            
            setCallRecords(records);
            setTotalPages(pages);
            setTotalElements(elements);
            setCurrentPage(0);
          }
        } else {
          setError('연결된 어르신이 없습니다');
        }
      } catch (error: any) {
        console.error('Failed to fetch call records:', error);
        setError(error.response?.data?.message || error.message || '데이터를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [pageSize]);

  // 페이지 변경 핸들러 (useCallback으로 메모이제이션)
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !isLoading) {
      fetchCallRecords(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, isLoading, fetchCallRecords]);

  // 필터링 로직 (useMemo로 메모이제이션)
  const filteredRecords = useMemo(() => {
    return callRecords.filter(record => {
      const matchesSearch = record.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.callAt?.includes(searchTerm) ||
        record.elderlyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEmotion = emotionFilter === "all" || 
        (emotionFilter === "good" && record.emotionLevel === "GOOD") ||
        (emotionFilter === "neutral" && record.emotionLevel === "NORMAL") ||
        (emotionFilter === "bad" && (record.emotionLevel === "BAD" || record.emotionLevel === "DEPRESSED"));
      
      return matchesSearch && matchesEmotion;
    });
  }, [callRecords, searchTerm, emotionFilter]);

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
              className={`shadow-card border-0 cursor-pointer hover:shadow-elevated transition-all duration-200 ${
                record.emotionLevel === 'BAD' || record.emotionLevel === 'DEPRESSED' || record.urgent
                  ? 'ring-2 ring-destructive/30' 
                  : ''
              }`}
              onClick={() => navigate(`/guardian/calls/${record.callId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Emotion Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    record.emotionLevel === 'GOOD' 
                      ? 'bg-success/10' 
                      : record.emotionLevel === 'NORMAL' 
                      ? 'bg-warning/10' 
                      : 'bg-destructive/10'
                  }`}>
                    <EmotionIcon emotionLevel={record.emotionLevel} />
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
                        {record.duration}
                      </Badge>
                      <EmotionBadge emotionLevel={record.emotionLevel} />
                      {(record.emotionLevel === 'BAD' || record.emotionLevel === 'DEPRESSED' || record.urgent) && (
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
                  {error ? '오류 발생' : callRecords.length === 0 ? '통화 기록이 없습니다' : '검색 결과가 없습니다'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error 
                    ? error
                    : callRecords.length === 0
                    ? 'AI 안부 통화 후 기록이 표시됩니다'
                    : '다른 검색어나 필터를 사용해보세요'}
                </p>
                {error && (
                  <p className="text-xs text-muted-foreground">
                    브라우저 개발자 도구(F12)의 콘솔 탭에서 자세한 오류를 확인하세요
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {!error && totalElements > 0 && (
          <div className="flex flex-col items-center gap-3 mt-6">
            {/* 페이지 정보 */}
            <div className="text-sm text-muted-foreground">
              전체 {totalElements}건 | {currentPage + 1} / {totalPages} 페이지
            </div>
            
            {/* 페이지네이션 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>

              <div className="flex items-center gap-1">
                {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="w-10"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GuardianCalls;
