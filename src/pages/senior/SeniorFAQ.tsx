import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  Phone,
  Heart,
  Calendar,
  Shield,
  Volume2
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "긴급 연락은 어떻게 하나요?",
    answer: "화면 아래에 있는 빨간색 '긴급 연락하기' 버튼을 누르시면 됩니다. 담당 상담사에게 바로 연락이 갑니다.",
    category: "이용방법",
  },
  {
    id: "2",
    question: "상담사 전화는 언제 오나요?",
    answer: "담당 상담사가 정해진 요일과 시간에 전화를 드립니다. 보통 주 2~3회 연락을 드리고 있습니다.",
    category: "상담",
  },
  {
    id: "3",
    question: "건강 기록은 꼭 해야 하나요?",
    answer: "의무는 아니지만, 기록해주시면 상담사가 건강 상태를 더 잘 파악할 수 있어요. 혈압, 혈당 등을 기록해주시면 좋습니다.",
    category: "건강",
  },
  {
    id: "4",
    question: "글자가 너무 작아요",
    answer: "첫 화면에서 '글자 크기' 옆에 있는 + 버튼을 누르시면 글자가 커집니다. 원하시는 크기가 될 때까지 눌러주세요.",
    category: "이용방법",
  },
  {
    id: "5",
    question: "문서 읽기 기능은 어떻게 쓰나요?",
    answer: "'문서 읽기' 버튼을 누르고 읽고 싶은 문서를 카메라로 찍으시면 됩니다. 문서 내용을 읽어드립니다.",
    category: "이용방법",
  },
  {
    id: "6",
    question: "비밀번호를 잊어버렸어요",
    answer: "담당 상담사에게 전화로 말씀해주시면 새 비밀번호를 설정해드립니다.",
    category: "계정",
  },
  {
    id: "7",
    question: "복지 서비스는 어떤 게 있나요?",
    answer: "기초연금, 의료비 지원, 돌봄 서비스 등 다양한 복지 서비스가 있습니다. 담당 상담사에게 문의하시면 자세히 안내해드립니다.",
    category: "복지",
  },
];

const categories = [
  { id: "all", name: "전체", icon: <HelpCircle className="w-6 h-6" /> },
  { id: "이용방법", name: "이용방법", icon: <Phone className="w-6 h-6" /> },
  { id: "상담", name: "상담", icon: <Heart className="w-6 h-6" /> },
  { id: "건강", name: "건강", icon: <Calendar className="w-6 h-6" /> },
  { id: "복지", name: "복지", icon: <Shield className="w-6 h-6" /> },
];

const SeniorFAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.includes(searchTerm) || 
      faq.answer.includes(searchTerm);
    const matchesCategory = 
      selectedCategory === "all" || 
      faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSpeak = (faq: FAQ) => {
    if (speakingId === faq.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `질문: ${faq.question}. 답변: ${faq.answer}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    utterance.onend = () => setSpeakingId(null);
    
    window.speechSynthesis.speak(utterance);
    setSpeakingId(faq.id);
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-accent text-accent-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/senior")}
            className="text-accent-foreground hover:bg-accent-foreground/20 p-3"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-foreground/20 flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">자주 묻는 질문</h1>
              <p className="text-accent-foreground/80 text-sm">궁금한 것을 찾아보세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="궁금한 것을 검색하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 text-lg rounded-2xl"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="h-14 px-5 rounded-xl flex-shrink-0 gap-2"
            >
              {category.icon}
              <span className="font-bold">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        <Card>
          <CardContent className="p-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg text-muted-foreground">
                  검색 결과가 없어요
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border rounded-xl px-4"
                  >
                    <AccordionTrigger className="text-left text-lg font-bold py-5 hover:no-underline">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <div className="pl-9 space-y-4">
                        <p className="text-lg leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleSpeak(faq)}
                          className={`h-12 rounded-xl gap-2 ${
                            speakingId === faq.id ? "bg-warning/10 border-warning text-warning" : ""
                          }`}
                        >
                          <Volume2 className="w-5 h-5" />
                          {speakingId === faq.id ? "읽기 중지" : "소리로 듣기"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-lg font-bold">찾는 답이 없으신가요?</p>
            <p className="text-muted-foreground">
              담당 상담사에게 직접 물어보세요
            </p>
            <Button
              onClick={() => navigate("/senior")}
              className="h-14 px-8 text-lg font-bold rounded-xl gap-2"
            >
              <Phone className="w-5 h-5" />
              홈으로 가서 전화하기
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SeniorFAQ;
