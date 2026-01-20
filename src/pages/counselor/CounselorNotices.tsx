import { useState } from "react";
import { 
  Search,
  ChevronRight,
  Calendar,
  Volume2,
  Megaphone,
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
import { counselorNavItems } from "@/config/counselorNavItems";

const notices = [
  {
    id: 1,
    title: "2024년 1월 상담사 교육 일정 안내",
    content: "안녕하세요. 2024년 1월 상담사 정기 교육 일정을 안내드립니다.\n\n교육일시: 2024년 1월 25일(목) 14:00 - 17:00\n교육장소: 본사 3층 대회의실\n교육내용: AI 기반 상담 시스템 업데이트 사항 및 신규 기능 교육\n\n모든 상담사분들은 필수로 참석해 주시기 바랍니다.",
    category: "교육",
    date: "2024-01-15",
    isImportant: true,
    author: "관리자",
  },
  {
    id: 2,
    title: "시스템 정기 점검 안내 (1/20)",
    content: "시스템 정기 점검이 예정되어 있습니다.\n\n점검일시: 2024년 1월 20일(토) 02:00 - 06:00\n점검내용: 서버 업데이트 및 보안 패치\n\n점검 시간 동안 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.",
    category: "시스템",
    date: "2024-01-14",
    isImportant: true,
    author: "시스템팀",
  },
  {
    id: 3,
    title: "설 연휴 상담 일정 변경 안내",
    content: "설 연휴 기간 상담 일정이 일부 변경됩니다.\n\n변경기간: 2024년 2월 9일(금) - 2월 12일(월)\n상담시간: 09:00 - 18:00 (단축 운영)\n\n긴급 상황 발생 시 비상 연락망을 통해 연락 부탁드립니다.",
    category: "일정",
    date: "2024-01-12",
    isImportant: false,
    author: "관리자",
  },
  {
    id: 4,
    title: "상담 품질 향상을 위한 설문조사 참여 요청",
    content: "상담 서비스 품질 향상을 위한 내부 설문조사를 실시합니다.\n\n설문기간: 2024년 1월 15일 - 1월 22일\n참여방법: 인트라넷 공지사항 내 링크 클릭\n\n많은 참여 부탁드립니다.",
    category: "안내",
    date: "2024-01-10",
    isImportant: false,
    author: "QA팀",
  },
];

const CounselorNotices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<typeof notices[0] | null>(null);

  const filteredNotices = notices.filter((notice) =>
    notice.title.includes(searchTerm) || notice.content.includes(searchTerm)
  );

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      "교육": "bg-primary/10 text-primary border-0",
      "시스템": "bg-destructive/10 text-destructive border-0",
      "일정": "bg-accent/10 text-accent border-0",
      "안내": "bg-info/10 text-info border-0",
    };
    return styles[category] || "bg-muted text-muted-foreground";
  };

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
            <h1 className="text-2xl font-bold text-foreground">공지사항</h1>
            <p className="text-muted-foreground mt-1">중요한 공지사항을 확인하세요</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{notice.date}</span>
                      <span>{notice.author}</span>
                    </div>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{selectedNotice?.date}</span>
              <span>{selectedNotice?.author}</span>
            </div>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-foreground">
            {selectedNotice?.content}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CounselorNotices;
