import { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Calendar,
  Volume2,
  Megaphone,
  Bell,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { counselorNavItems } from "@/config/counselorNavItems";
import noticesApi from "@/api/notices";
// import usersApi from "@/api/users"; // Removed unused
import { NoticeResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

const CounselorNotices = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<NoticeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notices, setNotices] = useState<NoticeResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Removed separate profile fetch since we have useAuth
        const noticesResponse = await noticesApi.getNotices({ size: 50 });
        setNotices(noticesResponse.content);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNoticeClick = async (notice: NoticeResponse) => {
    setSelectedNotice(notice);
    if (!notice.isRead) {
      try {
        await noticesApi.markAsRead(notice.id);
        setNotices(prev =>
          prev.map(n => n.id === notice.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const filteredNotices = notices.filter((notice) =>
    notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (isLoading) {
    return (
      <DashboardLayout role="counselor" userName={user?.name || "상담사"} navItems={counselorNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const importantCount = notices.filter(n => n.isImportant).length;
  const unreadCount = notices.filter(n => !n.isRead).length;
  const weekCount = notices.filter(n => {
    const noticeDate = new Date(n.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noticeDate >= weekAgo;
  }).length;

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
                  <p className="text-2xl font-bold">{importantCount}</p>
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
                  <p className="text-2xl font-bold">{weekCount}</p>
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
                  <p className="text-2xl font-bold">{unreadCount}</p>
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
            {filteredNotices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '공지사항이 없습니다.'}
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 rounded-xl transition-colors cursor-pointer ${notice.isRead ? 'bg-secondary/30 hover:bg-secondary/50' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  onClick={() => handleNoticeClick(notice)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {notice.isImportant && (
                          <Badge variant="destructive" className="text-xs">중요</Badge>
                        )}
                        {!notice.isRead && (
                          <Badge variant="default" className="text-xs">NEW</Badge>
                        )}
                        <Badge className={getCategoryBadge(notice.category)}>
                          {notice.category}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {notice.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notice.createdAt?.split('T')[0]}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
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
            <p className="text-sm text-muted-foreground">{selectedNotice?.createdAt?.split('T')[0]}</p>
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
