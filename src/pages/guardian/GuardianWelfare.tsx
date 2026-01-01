import { useState } from "react";
import { 
  Home, 
  Phone, 
  BarChart3, 
  MessageSquare, 
  HelpCircle,
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const navItems = [
  { title: "대시보드", href: "/guardian", icon: <Home className="w-5 h-5" /> },
  { title: "통화 기록", href: "/guardian/calls", icon: <Phone className="w-5 h-5" /> },
  { title: "통화 통계", href: "/guardian/stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "복지 서비스", href: "/guardian/welfare", icon: <Heart className="w-5 h-5" /> },
  { title: "1:1 문의", href: "/guardian/inquiry", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "FAQ", href: "/guardian/faq", icon: <HelpCircle className="w-5 h-5" /> },
];

// 복지 서비스 카테고리
const categories = [
  { id: "all", name: "전체", icon: <Heart className="w-4 h-4" /> },
  { id: "living", name: "생활지원", icon: <Wallet className="w-4 h-4" /> },
  { id: "health", name: "건강/의료", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "housing", name: "주거지원", icon: <Building2 className="w-4 h-4" /> },
  { id: "care", name: "돌봄서비스", icon: <Users className="w-4 h-4" /> },
  { id: "mobility", name: "이동지원", icon: <Car className="w-4 h-4" /> },
  { id: "meal", name: "식사지원", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: "education", name: "교육/문화", icon: <GraduationCap className="w-4 h-4" /> },
];

// 샘플 복지 서비스 데이터 (공공데이터 API 연동 시 대체)
const welfareServices = [
  {
    id: 1,
    name: "기초연금",
    category: "living",
    provider: "보건복지부",
    description: "만 65세 이상 어르신 중 소득인정액이 선정기준액 이하인 분께 매월 기초연금을 지급합니다.",
    eligibility: "만 65세 이상, 소득인정액 기준 하위 70%",
    benefit: "월 최대 323,180원 지급",
    howToApply: "주민센터 방문 신청 또는 복지로 온라인 신청",
    documents: ["신분증", "통장사본", "소득재산 증빙서류"],
    contact: "129 (정부민원안내콜센터)",
    website: "https://www.bokjiro.go.kr",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
  {
    id: 2,
    name: "노인장기요양보험",
    category: "care",
    provider: "국민건강보험공단",
    description: "고령이나 노인성 질병으로 일상생활을 혼자 수행하기 어려운 노인에게 신체활동 또는 가사활동 지원 등의 장기요양급여를 제공합니다.",
    eligibility: "만 65세 이상 또는 65세 미만 노인성 질병",
    benefit: "재가급여, 시설급여, 특별현금급여 제공",
    howToApply: "국민건강보험공단 지사 방문 또는 온라인 신청",
    documents: ["장기요양인정신청서", "의사소견서"],
    contact: "1577-1000",
    website: "https://www.longtermcare.or.kr",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
  {
    id: 3,
    name: "노인돌봄종합서비스",
    category: "care",
    provider: "지방자치단체",
    description: "혼자 힘으로 일상생활을 수행하기 어려운 노인에게 가사·활동지원, 주간보호 서비스를 제공합니다.",
    eligibility: "만 65세 이상 장기요양등급외자 (A, B등급)",
    benefit: "월 27시간~36시간 돌봄서비스 제공",
    howToApply: "주민센터 방문 신청",
    documents: ["신분증", "건강보험카드", "소득증빙서류"],
    contact: "주민센터",
    website: "https://www.bokjiro.go.kr",
    status: "pending",
    deadline: "상시",
    region: "서울시",
  },
  {
    id: 4,
    name: "노인맞춤돌봄서비스",
    category: "care",
    provider: "보건복지부",
    description: "일상생활 영위가 어려운 취약노인에게 적절한 돌봄서비스를 제공하여 안정적인 노후생활 보장 및 노인의 기능·건강 유지를 지원합니다.",
    eligibility: "만 65세 이상 국민기초생활수급자, 차상위계층 등",
    benefit: "안전지원, 사회참여, 생활교육, 일상생활지원",
    howToApply: "주민센터 또는 노인맞춤돌봄서비스 수행기관",
    documents: ["신청서", "신분증", "소득증빙서류"],
    contact: "129",
    website: "https://www.bokjiro.go.kr",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
  {
    id: 5,
    name: "노인 무료 건강검진",
    category: "health",
    provider: "국민건강보험공단",
    description: "만 66세 이상 의료급여수급권자를 대상으로 2년에 1회 무료 건강검진을 제공합니다.",
    eligibility: "만 66세 이상 의료급여수급권자",
    benefit: "일반건강검진 + 암검진 무료",
    howToApply: "지정 검진기관 방문",
    documents: ["신분증", "건강보험카드"],
    contact: "1577-1000",
    website: "https://www.nhis.or.kr",
    status: "eligible",
    deadline: "연중",
    region: "전국",
  },
  {
    id: 6,
    name: "노인틀니 지원사업",
    category: "health",
    provider: "국민건강보험공단",
    description: "만 65세 이상 건강보험가입자를 대상으로 틀니 및 임플란트 시술비의 일부를 지원합니다.",
    eligibility: "만 65세 이상 건강보험 가입자",
    benefit: "틀니 본인부담금 30%, 임플란트 본인부담금 30%",
    howToApply: "건강보험 적용 치과의원 방문",
    documents: ["신분증", "건강보험카드"],
    contact: "1577-1000",
    website: "https://www.nhis.or.kr",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
  {
    id: 7,
    name: "경로우대 교통비 지원",
    category: "mobility",
    provider: "지방자치단체",
    description: "만 65세 이상 어르신에게 대중교통 이용 시 할인 혜택을 제공합니다.",
    eligibility: "만 65세 이상",
    benefit: "지하철 무료, 버스 할인",
    howToApply: "경로우대용 교통카드 발급",
    documents: ["신분증"],
    contact: "주민센터",
    website: "",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
  {
    id: 8,
    name: "어르신 도시락 배달 서비스",
    category: "meal",
    provider: "지방자치단체",
    description: "거동이 불편하거나 독거 어르신을 대상으로 점심 또는 저녁 도시락을 가정으로 배달합니다.",
    eligibility: "만 65세 이상 독거노인 또는 거동불편 노인",
    benefit: "주 5회 도시락 무료 배달",
    howToApply: "주민센터 또는 복지관 신청",
    documents: ["신청서", "신분증"],
    contact: "주민센터",
    website: "",
    status: "pending",
    deadline: "상시",
    region: "서울시 강남구",
  },
  {
    id: 9,
    name: "노인 주거환경 개선사업",
    category: "housing",
    provider: "지방자치단체",
    description: "주거환경이 열악한 저소득 노인가구를 대상으로 도배, 장판, 보일러, 안전손잡이 설치 등을 지원합니다.",
    eligibility: "만 65세 이상 기초생활수급자 또는 차상위계층",
    benefit: "최대 500만원 상당 주거환경 개선",
    howToApply: "주민센터 신청",
    documents: ["신청서", "신분증", "소득증빙서류"],
    contact: "주민센터",
    website: "",
    status: "not_eligible",
    deadline: "2024.12.31",
    region: "서울시",
  },
  {
    id: 10,
    name: "노인 문화프로그램",
    category: "education",
    provider: "노인복지관",
    description: "다양한 문화예술 프로그램을 통해 노인의 사회참여 및 여가활동을 지원합니다.",
    eligibility: "만 60세 이상",
    benefit: "무료 문화강좌 제공 (서예, 합창, 댄스 등)",
    howToApply: "가까운 노인복지관 방문 신청",
    documents: ["신분증"],
    contact: "가까운 노인복지관",
    website: "",
    status: "eligible",
    deadline: "상시",
    region: "전국",
  },
];

const statusConfig = {
  eligible: { label: "수급 가능", color: "bg-success/10 text-success border-success/20" },
  pending: { label: "확인 필요", color: "bg-warning/10 text-warning border-warning/20" },
  not_eligible: { label: "대상 제외", color: "bg-muted text-muted-foreground border-border" },
};

const GuardianWelfare = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof welfareServices[0] | null>(null);

  // 부모님 정보 (실제로는 API에서 가져옴)
  const parentInfo = {
    name: "김영희",
    age: 78,
    region: "서울시 강남구",
  };

  // 필터링된 서비스 목록
  const filteredServices = welfareServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || service.region.includes("전국") || service.region.includes(selectedRegion);
    const matchesStatus = selectedStatus === "all" || service.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesRegion && matchesStatus;
  });

  // 통계 계산
  const stats = {
    total: welfareServices.length,
    eligible: welfareServices.filter(s => s.status === "eligible").length,
    pending: welfareServices.filter(s => s.status === "pending").length,
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // 실제로는 API 호출
    setTimeout(() => setIsLoading(false), 1500);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || <Heart className="w-4 h-4" />;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">복지 서비스 안내</h1>
            <p className="text-muted-foreground mt-1">
              {parentInfo.name}님이 받을 수 있는 정부 복지 서비스를 확인하세요
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? (
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
                  <p className="text-2xl font-bold text-foreground">{stats.total}개</p>
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
                  <p className="text-sm text-muted-foreground">수급 가능</p>
                  <p className="text-2xl font-bold text-foreground">{stats.eligible}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Info className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">확인 필요</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}개</p>
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="eligible">수급 가능</SelectItem>
                    <SelectItem value="pending">확인 필요</SelectItem>
                    <SelectItem value="not_eligible">대상 제외</SelectItem>
                  </SelectContent>
                </Select>
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
                  <p className="text-muted-foreground">검색 조건에 맞는 서비스가 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <Dialog key={service.id}>
                    <DialogTrigger asChild>
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30"
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  {getCategoryIcon(service.category)}
                                </div>
                                <Badge variant="outline" className={statusConfig[service.status as keyof typeof statusConfig].color}>
                                  {statusConfig[service.status as keyof typeof statusConfig].label}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {service.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {service.provider}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {service.region}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {service.deadline}
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
                            <DialogTitle className="text-xl">{service.name}</DialogTitle>
                            <DialogDescription>{service.provider}</DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-6 py-4">
                          {/* 수급 상태 */}
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`${statusConfig[service.status as keyof typeof statusConfig].color} text-sm px-3 py-1`}>
                              {statusConfig[service.status as keyof typeof statusConfig].label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {parentInfo.name}님 기준
                            </span>
                          </div>

                          {/* 서비스 설명 */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2">서비스 안내</h4>
                            <p className="text-muted-foreground">{service.description}</p>
                          </div>

                          <Separator />

                          {/* 지원 대상 */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2">지원 대상</h4>
                            <p className="text-muted-foreground">{service.eligibility}</p>
                          </div>

                          {/* 지원 내용 */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2">지원 내용</h4>
                            <p className="text-muted-foreground">{service.benefit}</p>
                          </div>

                          <Separator />

                          {/* 신청 방법 */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2">신청 방법</h4>
                            <p className="text-muted-foreground">{service.howToApply}</p>
                          </div>

                          {/* 필요 서류 */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2">필요 서류</h4>
                            <div className="flex flex-wrap gap-2">
                              {service.documents.map((doc, idx) => (
                                <Badge key={idx} variant="secondary">{doc}</Badge>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* 문의처 및 기타 정보 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/50">
                              <p className="text-sm text-muted-foreground mb-1">문의처</p>
                              <p className="font-medium text-foreground">{service.contact}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50">
                              <p className="text-sm text-muted-foreground mb-1">신청 기한</p>
                              <p className="font-medium text-foreground">{service.deadline}</p>
                            </div>
                          </div>

                          {/* 바로가기 */}
                          {service.website && (
                            <Button asChild className="w-full">
                              <a href={service.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                상세정보 및 신청 바로가기
                              </a>
                            </Button>
                          )}
                        </div>
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
                  더 자세한 정보는 정부24(www.gov.kr) 또는 복지로(www.bokjiro.go.kr)에서 확인하실 수 있습니다.
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
