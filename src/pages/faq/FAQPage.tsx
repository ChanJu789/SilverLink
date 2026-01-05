import { useState } from "react";
import { 
  Home, 
  Phone, 
  BarChart3, 
  MessageSquare, 
  HelpCircle,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Book
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems = [
  { title: "홈", href: "/guardian", icon: <Home className="w-5 h-5" /> },
  { title: "통화 기록", href: "/guardian/calls", icon: <Phone className="w-5 h-5" />, badge: 3 },
  { title: "통계", href: "/guardian/stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "1:1 문의", href: "/guardian/inquiry", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "복지 서비스", href: "/guardian/welfare", icon: <FileText className="w-5 h-5" /> },
  { title: "FAQ", href: "/guardian/faq", icon: <HelpCircle className="w-5 h-5" /> },
];

const faqCategories = [
  { id: "service", name: "서비스 이용", count: 12 },
  { id: "call", name: "통화 관련", count: 8 },
  { id: "ai", name: "AI 기능", count: 6 },
  { id: "account", name: "계정/보안", count: 5 },
  { id: "welfare", name: "복지 서비스", count: 7 },
];

const faqItems = [
  {
    id: 1,
    category: "service",
    question: "마음돌봄 서비스는 어떤 서비스인가요?",
    answer: "마음돌봄 서비스는 독거 어르신들의 정서적 안녕과 건강 상태를 AI 전화 상담을 통해 확인하고, 이상 징후 발견 시 담당 상담사와 보호자에게 알림을 전달하는 국가 복지 서비스입니다.",
    views: 1234
  },
  {
    id: 2,
    category: "service",
    question: "서비스 이용 비용이 있나요?",
    answer: "마음돌봄 서비스는 정부 지원 복지 서비스로, 별도의 이용 비용 없이 무료로 제공됩니다.",
    views: 987
  },
  {
    id: 3,
    category: "call",
    question: "AI 전화는 언제 어르신께 연락하나요?",
    answer: "AI 전화는 보통 오전 9시부터 오후 6시 사이에 진행됩니다. 어르신의 생활 패턴에 맞춰 통화 시간을 조정할 수 있으며, 담당 상담사에게 요청하시면 됩니다.",
    views: 856
  },
  {
    id: 4,
    category: "call",
    question: "어르신이 전화를 받지 않으시면 어떻게 되나요?",
    answer: "첫 번째 통화에 응답이 없으면 30분 후 재시도합니다. 2회 연속 미응답 시 담당 상담사에게 알림이 전달되며, 필요 시 보호자님께도 연락드립니다.",
    views: 723
  },
  {
    id: 5,
    category: "ai",
    question: "AI가 어르신의 감정을 어떻게 분석하나요?",
    answer: "AI는 어르신의 음성 톤, 말의 속도, 사용하는 단어 등을 종합적으로 분석하여 감정 상태를 파악합니다. 평소와 다른 패턴이 감지되면 담당 상담사에게 알립니다.",
    views: 654
  },
  {
    id: 6,
    category: "ai",
    question: "AI 분석 결과는 얼마나 정확한가요?",
    answer: "현재 AI 분석 정확도는 약 94% 수준입니다. 지속적인 학습과 개선을 통해 정확도를 높이고 있으며, 중요한 판단은 담당 상담사가 최종 확인합니다.",
    views: 542
  },
  {
    id: 7,
    category: "account",
    question: "비밀번호를 잊어버렸어요. 어떻게 하나요?",
    answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하시면 등록된 이메일이나 휴대폰으로 인증 후 비밀번호를 재설정하실 수 있습니다.",
    views: 421
  },
  {
    id: 8,
    category: "welfare",
    question: "다른 복지 서비스도 신청할 수 있나요?",
    answer: "네, '복지 서비스' 메뉴에서 어르신이 받을 수 있는 다양한 정부 복지 서비스를 확인하고 신청하실 수 있습니다. 자격 조건에 맞는 서비스를 추천해 드립니다.",
    views: 398
  },
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.includes(searchQuery) || item.answer.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">자주 묻는 질문</h1>
          <p className="text-muted-foreground mt-1">서비스 이용에 대한 궁금한 점을 확인하세요</p>
        </div>

        {/* Search */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="궁금한 내용을 검색하세요..." 
                className="pl-12 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedCategory("all")}
          >
            전체 ({faqItems.length})
          </Badge>
          {faqCategories.map((category) => (
            <Badge 
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* FAQ List */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id.toString()} className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-11">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <span>조회 {item.views}회</span>
                      <Badge variant="outline">
                        {faqCategories.find(c => c.id === item.category)?.name}
                      </Badge>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12">
                <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">원하는 답변을 찾지 못하셨나요?</h3>
                <p className="text-primary-foreground/80 mt-1">담당 상담사에게 직접 문의하세요</p>
              </div>
              <a href="/guardian/inquiry" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-xl transition-colors">
                1:1 문의하기 <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FAQPage;
