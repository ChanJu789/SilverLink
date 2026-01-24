import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Users,
  Wallet,
  Building2,
  Stethoscope,
  Car,
  UtensilsCrossed,
  GraduationCap,
  Loader2,
  RefreshCw,
  MapPin,
  Calendar,
  CheckCircle2,
  Info
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import welfareApi from "@/api/welfare";
import usersApi from "@/api/users";
import guardiansApi from "@/api/guardians";
import { WelfareListResponse, WelfareDetailResponse, MyProfileResponse } from "@/types/api";

// 복지 서비스 카테고리
const categories = [
  { id: "all", name: "전체", icon: <Heart className="w-4 h-4" /> },
  { id: "생활지원", name: "생활지원", icon: <Wallet className="w-4 h-4" /> },
  { id: "건강의료", name: "건강/의료", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "주거지원", name: "주거지원", icon: <Building2 className="w-4 h-4" /> },
  { id: "돌봄서비스", name: "돌봄서비스", icon: <Users className="w-4 h-4" /> },
  { id: "이동지원", name: "이동지원", icon: <Car className="w-4 h-4" /> },
  { id: "식사지원", name: "식사지원", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: "교육문화", name: "교육/문화", icon: <GraduationCap className="w-4 h-4" /> },
];

const GuardianWelfare = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<WelfareListResponse[]>([]);
  const [selectedService, setSelectedService] = useState<WelfareDetailResponse | null>(null);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);
  const [parentName, setParentName] = useState("어르신");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 사용자 프로필 조회
      const profile = await usersApi.getMyProfile();
      setUserProfile(profile);

      // 어르신 정보 조회
      try {
        const elderlyResponse = await guardiansApi.getMyElderly();
        if (elderlyResponse.elderlyList?.length > 0) {
          setParentName(elderlyResponse.elderlyList[0].name);
        }
      } catch (e) {
        console.log('Could not fetch elderly info');
      }

      // 복지 서비스 목록 조회
      await fetchWelfareServices();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWelfareServices = async () => {
    try {
      const params: { keyword?: string; category?: string; region?: string } = {};
      if (searchQuery) params.keyword = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedRegion !== 'all') params.region = selectedRegion;

      const response = await welfareApi.searchWelfare({ ...params, size: 50 });
      setServices(response.content || []);
    } catch (error) {
      console.error('Failed to fetch welfare services:', error);
      setServices([]);
    }
  };

  const handleSearch = async () => {
    await fetchWelfareServices();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWelfareServices();
    setIsRefreshing(false);
  };

  const handleServiceClick = async (serviceId: number) => {
    try {
      const detail = await welfareApi.getWelfareDetail(serviceId);
      setSelectedService(detail);
    } catch (error) {
      console.error('Failed to fetch service detail:', error);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.id === categoryName || c.name === categoryName);
    return category?.icon || <Heart className="w-4 h-4" />;
  };

  // 필터링된 서비스 목록
  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "all" ||
      service.category?.includes(selectedCategory);
    // region 대신 jurMnofNm(소관기관) 사용
    const matchesRegion = selectedRegion === "all" ||
      service.jurMnofNm?.includes("전국") ||
      service.jurMnofNm?.includes(selectedRegion);
    return matchesCategory && matchesRegion;
  });

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
        {/* 페이지 헤더 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">복지 서비스 안내</h1>
            <p className="text-muted-foreground mt-1">
              {parentName}님이 받을 수 있는 정부 복지 서비스를 확인하세요
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            정보 새로고침
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">전체 서비스</p>
                  <p className="text-2xl font-bold text-foreground">{services.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">검색 결과</p>
                  <p className="text-2xl font-bold text-foreground">{filteredServices.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Info className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">카테고리</p>
                  <p className="text-2xl font-bold text-foreground">{categories.length - 1}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="서비스명 또는 내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[140px]">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="지역" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 지역</SelectItem>
                    <SelectItem value="서울">서울시</SelectItem>
                    <SelectItem value="경기">경기도</SelectItem>
                    <SelectItem value="인천">인천시</SelectItem>
                    <SelectItem value="부산">부산시</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  검색
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리 탭 */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border data-[state=active]:border-primary"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {/* 서비스 목록 */}
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {services.length === 0 ? '복지 서비스 정보를 불러오는 중입니다...' : '검색 조건에 맞는 서비스가 없습니다'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <Dialog key={service.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  {getCategoryIcon(service.category)}
                                </div>
                                <Badge variant="outline">{service.category}</Badge>
                              </div>
                              <h3 className="font-semibold text-foreground mb-1">{service.servNm}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {service.servDgst}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {service.source === 'CENTRAL' ? '중앙정부' : '지자체'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {service.jurMnofNm || '전국'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                      <DialogHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            {getCategoryIcon(service.category)}
                          </div>
                          <div>
                            <DialogTitle className="text-xl">{service.servNm}</DialogTitle>
                            <DialogDescription>{service.category}</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        {selectedService ? (
                          <div className="space-y-6 py-4">
                            <div>
                              <h4 className="font-medium text-foreground mb-2">서비스 안내</h4>
                              <p className="text-muted-foreground">{selectedService.alwServCn || selectedService.servDgst}</p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium text-foreground mb-2">지원 대상</h4>
                              <p className="text-muted-foreground">{selectedService.targetDtlCn || '해당 정보 없음'}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-foreground mb-2">선정 기준</h4>
                              <p className="text-muted-foreground">{selectedService.slctCritCn || '관할 주민센터 방문 또는 온라인 신청'}</p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-1">문의처</p>
                                <p className="font-medium text-foreground">{selectedService.rprsCtadr || '129 (정부민원안내)'}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-1">소관기관</p>
                                <p className="font-medium text-foreground">{selectedService.jurMnofNm || '미상'}</p>
                              </div>
                            </div>

                            {selectedService.servDtlLink && (
                              <Button asChild className="w-full">
                                <a href={selectedService.servDtlLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  상세정보 및 신청 바로가기
                                </a>
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 안내 메시지 */}
        <Card className="border-info/20 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">복지 서비스 안내</p>
                <p className="text-muted-foreground">
                  본 정보는 공공데이터포털 API를 통해 제공되며, 실제 수급 자격은 관할 주민센터에서 확인하시기 바랍니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuardianWelfare;
