import { useState } from "react";
import { 
  Home, 
  Phone, 
  BarChart3, 
  MessageSquare, 
  HelpCircle,
  FileText,
  Megaphone,
  Search,
  ChevronRight,
  Calendar,
  Volume2,
  Bell
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { title: "홈", href: "/guardian", icon: <Home className="w-5 h-5" /> },
  { title: "통화 기록", href: "/guardian/calls", icon: <Phone className="w-5 h-5" />, badge: 3 },
  { title: "통계", href: "/guardian/stats", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "1:1 문의", href: "/guardian/inquiry", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "복지 서비스", href: "/guardian/welfare", icon: <FileText className="w-5 h-5" /> },
  { title: "공지사항", href: "/guardian/notices", icon: <Megaphone className="w-5 h-5" /> },
  { title: "FAQ", href: "/guardian/faq", icon: <HelpCircle className="w-5 h-5" /> },
];

const notices = [
  {
    id: 1,
    title: "2024년 설 연휴 상담 서비스 운영 안내",
    content: "안녕하세요, 보호자님.\n\n2024년 설 연휴 기간 상담 서비스 운영 일정을 안내드립니다.\n\n■ 연휴 기간: 2024년 2월 9일(금) ~ 2월 12일(월)\n■ 운영 시간: 09:00 ~ 18:00 (단축 운영)\n■ 긴급 상황 시: 비상 연락망 운영\n\n연휴 기간에도 어르신들께 정기 통화 서비스는 정상 제공됩니다.\n감사합니다.",
    category: "운영안내",
    date: "2024-01-15",
    isImportant: true,
  },
  {
    id: 2,
    title: "AI 감정 분석 서비스 업그레이드 안내",
    content: "안녕하세요, 보호자님.\n\n더욱 정확한 어르신 케어를 위해 AI 감정 분석 서비스가 업그레이드되었습니다.\n\n■ 주요 개선 사항\n1. 감정 분석 정확도 향상 (95% 이상)\n2. 실시간 위험 감지 알림 기능 추가\n3. 월간 감정 리포트 제공\n\n업데이트된 서비스는 자동으로 적용됩니다.\n감사합니다.",
    category: "서비스",
    date: "2024-01-12",
    isImportant: true,
  },
  {
    id: 3,
    title: "신규 복지 서비스 연계 안내",
    content: "안녕하세요, 보호자님.\n\n새로운 복지 서비스 연계가 추가되었습니다.\n\n■ 추가된 서비스\n1. 노인 돌봄 서비스\n2. 방문 건강관리 서비스\n3. 응급안전안심 서비스\n\n자세한 내용은 복지 서비스 메뉴에서 확인하실 수 있습니다.\n감사합니다.",
    category: "복지",
    date: "2024-01-10",
    isImportant: false,
  },
  {
    id: 4,
    title: "개인정보 처리방침 변경 안내",
    content: "안녕하세요, 보호자님.\n\n개인정보 처리방침이 일부 변경되어 안내드립니다.\n\n■ 변경 내용\n1. 개인정보 보유기간 명확화\n2. 제3자 제공 범위 구체화\n3. 정보주체 권리 강화\n\n시행일: 2024년 2월 1일\n자세한 내용은 개인정보 처리방침 페이지에서 확인해주세요.\n감사합니다.",
    category: "안내",
    date: "2024-01-08",
    isImportant: false,
  },
];

const GuardianNotices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<typeof notices[0] | null>(null);

  const filteredNotices = notices.filter((notice) =>
    notice.title.includes(searchTerm) || notice.content.includes(searchTerm)
  );

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      "운영안내": "bg-primary/10 text-primary border-0",
      "서비스": "bg-info/10 text-info border-0",
      "복지": "bg-success/10 text-success border-0",
      "안내": "bg-accent/10 text-accent border-0",
    };
    return styles[category] || "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout
      role="guardian"
      userName="홍길동"
      navItems={navItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">공지사항</h1>
            <p className="text-muted-foreground mt-1">서비스 관련 공지사항을 확인하세요</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="공지사항 검색..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.length}</p>
                  <p className="text-sm text-muted-foreground">전체 공지</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Bell className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.filter(n => n.isImportant).length}</p>
                  <p className="text-sm text-muted-foreground">중요 공지</p>
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
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">이번 주</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Volume2 className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">읽지 않음</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notices List */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>공지사항 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedNotice(notice)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.isImportant && (
                        <Badge variant="destructive" className="text-xs">중요</Badge>
                      )}
                      <Badge className={getCategoryBadge(notice.category)}>
                        {notice.category}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {notice.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{notice.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedNotice?.isImportant && (
                <Badge variant="destructive" className="text-xs">중요</Badge>
              )}
              <Badge className={getCategoryBadge(selectedNotice?.category || "")}>
                {selectedNotice?.category}
              </Badge>
            </div>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedNotice?.date}</p>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-foreground">
            {selectedNotice?.content}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GuardianNotices;
