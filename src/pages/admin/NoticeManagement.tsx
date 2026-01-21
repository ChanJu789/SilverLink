import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Pin,
  Calendar
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Megaphone } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: "공지" | "업데이트" | "이벤트" | "긴급";
  target: "전체" | "보호자" | "상담사" | "어르신";
  isPinned: boolean;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const mockNotices: Notice[] = [
  {
    id: "1",
    title: "2024년 새해 복 많이 받으세요",
    content: "마음돌봄 서비스를 이용해주시는 모든 분들께 감사드립니다. 2024년에도 더 나은 서비스로 보답하겠습니다.",
    category: "공지",
    target: "전체",
    isPinned: true,
    isPublished: true,
    views: 1234,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    title: "시스템 정기 점검 안내",
    content: "2024년 1월 20일 02:00 ~ 06:00 시스템 정기 점검이 예정되어 있습니다. 해당 시간에는 서비스 이용이 제한됩니다.",
    category: "긴급",
    target: "전체",
    isPinned: true,
    isPublished: true,
    views: 856,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "3",
    title: "AI 분석 기능 업데이트 안내",
    content: "더욱 정확한 감정 분석과 위험도 예측을 위한 AI 모델이 업데이트되었습니다.",
    category: "업데이트",
    target: "상담사",
    isPinned: false,
    isPublished: true,
    views: 432,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
  {
    id: "4",
    title: "설날 맞이 특별 이벤트",
    content: "설날을 맞아 어르신들을 위한 특별 프로그램이 진행됩니다.",
    category: "이벤트",
    target: "어르신",
    isPinned: false,
    isPublished: false,
    views: 0,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
];

const NoticeManagement = () => {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "공지" as Notice["category"],
    target: "전체" as Notice["target"],
    isPinned: false,
    isPublished: true,
  });

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.includes(searchTerm) || notice.content.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      title: "",
      content: "",
      category: "공지",
      target: "전체",
      isPinned: false,
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setIsEditMode(true);
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      target: notice.target,
      isPinned: notice.isPinned,
      isPublished: notice.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNotice) {
      setNotices((prev) => prev.filter((n) => n.id !== selectedNotice.id));
      toast.success("공지사항이 삭제되었습니다.");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = () => {
    const now = new Date().toISOString().split("T")[0];
    if (isEditMode && selectedNotice) {
      setNotices((prev) =>
        prev.map((n) =>
          n.id === selectedNotice.id
            ? { ...n, ...formData, updatedAt: now }
            : n
        )
      );
      toast.success("공지사항이 수정되었습니다.");
    } else {
      const newNotice: Notice = {
        id: String(notices.length + 1),
        ...formData,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      setNotices((prev) => [newNotice, ...prev]);
      toast.success("새 공지사항이 등록되었습니다.");
    }
    setIsDialogOpen(false);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "공지":
        return <Badge className="bg-primary/10 text-primary border-0">공지</Badge>;
      case "긴급":
        return <Badge className="bg-destructive/10 text-destructive border-0">긴급</Badge>;
      case "업데이트":
        return <Badge className="bg-info/10 text-info border-0">업데이트</Badge>;
      case "이벤트":
        return <Badge className="bg-success/10 text-success border-0">이벤트</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">공지사항 관리</h1>
            <p className="text-muted-foreground">공지사항을 작성하고 관리합니다</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            새 공지사항
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">전체</p>
                  <p className="text-xl font-bold">{notices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">게시중</p>
                  <p className="text-xl font-bold">{notices.filter((n) => n.isPublished).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Pin className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">고정</p>
                  <p className="text-xl font-bold">{notices.filter((n) => n.isPinned).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">긴급</p>
                  <p className="text-xl font-bold">{notices.filter((n) => n.category === "긴급").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="분류" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 분류</SelectItem>
                  <SelectItem value="공지">공지</SelectItem>
                  <SelectItem value="긴급">긴급</SelectItem>
                  <SelectItem value="업데이트">업데이트</SelectItem>
                  <SelectItem value="이벤트">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notices Table */}
        <Card>
          <CardHeader>
            <CardTitle>공지사항 목록</CardTitle>
            <CardDescription>총 {filteredNotices.length}건</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>분류</TableHead>
                    <TableHead>대상</TableHead>
                    <TableHead>조회수</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        {notice.isPinned && <Pin className="w-4 h-4 text-warning" />}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium line-clamp-1">{notice.title}</p>
                      </TableCell>
                      <TableCell>{getCategoryBadge(notice.category)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notice.target}</Badge>
                      </TableCell>
                      <TableCell>{notice.views.toLocaleString()}</TableCell>
                      <TableCell>{notice.createdAt}</TableCell>
                      <TableCell>
                        {notice.isPublished ? (
                          <Badge className="bg-success/10 text-success border-0">게시중</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0">비공개</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(notice)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(notice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(notice)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "공지사항 수정" : "새 공지사항 작성"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "공지사항을 수정합니다." : "새로운 공지사항을 작성합니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>제목</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>분류</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Notice["category"]) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="공지">공지</SelectItem>
                    <SelectItem value="긴급">긴급</SelectItem>
                    <SelectItem value="업데이트">업데이트</SelectItem>
                    <SelectItem value="이벤트">이벤트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>대상</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value: Notice["target"]) =>
                    setFormData({ ...formData, target: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="보호자">보호자</SelectItem>
                    <SelectItem value="상담사">상담사</SelectItem>
                    <SelectItem value="어르신">어르신</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>내용</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={8}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>상단 고정</span>
              <Switch
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>즉시 게시</span>
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? "수정 완료" : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedNotice?.isPinned && <Pin className="w-4 h-4 text-warning" />}
              {selectedNotice && getCategoryBadge(selectedNotice.category)}
            </div>
            <DialogTitle className="text-xl">{selectedNotice?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotice?.createdAt} | 조회수 {selectedNotice?.views.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="whitespace-pre-wrap">{selectedNotice?.content}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지사항 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NoticeManagement;
