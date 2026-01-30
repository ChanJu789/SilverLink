import { useState, useEffect } from "react";
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
  Loader2,
  Archive
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Megaphone } from "lucide-react";
import noticesApi from "@/api/notices";
import type { NoticeRequest } from "@/api/notices";
import { NoticeResponse } from "@/types/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  targetRoles: string[];
  isPinned: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
}

const NoticeManagement = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "공지",
    target: "전체",
    isPinned: false,
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  });

  // 데이터 로드
  const fetchNotices = async () => {
    try {
      setLoading(true);
      console.log("공지사항 목록 조회 시작");
      
      const response = await noticesApi.getAdminNotices({
        keyword: searchTerm || undefined,
        size: 100
      });

      console.log("API 응답:", response);

      // API 응답을 Notice 형식으로 변환
      const mappedNotices: Notice[] = (response.content || []).map((n: NoticeResponse) => {
        console.log("원본 공지사항 데이터:", n);
        
        // 백엔드 카테고리를 프론트엔드 카테고리로 매핑
        let frontendCategory = '공지';
        if (n.category === 'NOTICE' && n.isImportant) {
          frontendCategory = '긴급';
        } else if (n.category === 'NOTICE') {
          frontendCategory = '공지';
        } else if (n.category === 'EVENT') {
          frontendCategory = '이벤트';
        } else if (n.category === 'SYSTEM') {
          frontendCategory = '업데이트';
        }

        // 백엔드 역할을 프론트엔드 역할로 매핑
        const frontendRoles = (n.targetRoles || []).map(role => {
          switch (role) {
            case 'ADMIN': return '관리자';
            case 'COUNSELOR': return '상담사';
            case 'GUARDIAN': return '보호자';
            case 'ELDERLY': return '어르신';
            default: return '전체';
          }
        });

        const mappedNotice = {
          id: n.id,
          title: n.title,
          content: n.content || '',
          category: frontendCategory,
          targetRoles: frontendRoles.length > 0 ? frontendRoles : ['전체'],
          isPinned: n.isImportant || false,
          status: n.status,
          createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
          updatedAt: n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : '',
        };
        
        console.log("매핑된 공지사항 데이터:", mappedNotice);
        return mappedNotice;
      });

      console.log("최종 매핑된 공지사항 목록:", mappedNotices);
      setNotices(mappedNotices);
    } catch (error: any) {
      console.error("공지사항 로드 실패:", error);
      console.error("오류 상세:", error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      toast.error(`공지사항을 불러오는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.includes(searchTerm) || notice.content.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || notice.category === filterCategory;
    const matchesStatus = filterStatus === "all" || notice.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      title: "",
      content: "",
      category: "공지",
      target: "전체",
      isPinned: false,
      status: "PUBLISHED",
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
      target: notice.targetRoles[0] || "전체",
      isPinned: notice.isPinned,
      status: notice.status,
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

  // 상태 변경 핸들러
  const handleStatusChange = async (noticeId: number, newStatus: string) => {
    try {
      console.log(`상태 변경 시도: ID ${noticeId}, 새 상태: ${newStatus}`);
      
      await noticesApi.changeNoticeStatus(noticeId, newStatus);
      
      console.log("상태 변경 API 호출 성공");
      
      // 즉시 UI 업데이트
      setNotices(prev => prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, status: newStatus as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
          : notice
      ));
      
      toast.success("상태가 변경되었습니다.");
      
      // 서버에서 최신 데이터 다시 가져오기
      setTimeout(() => {
        fetchNotices();
      }, 500);
    } catch (error: any) {
      console.error("상태 변경 실패:", error);
      console.error("오류 상세:", error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      toast.error(`상태 변경에 실패했습니다: ${errorMessage}`);
      
      // 실패 시 원래 데이터로 되돌리기 위해 새로고침
      fetchNotices();
    }
  };

  // 분류 변경 핸들러
  const handleCategoryChange = async (noticeId: number, newCategory: string) => {
    try {
      console.log(`분류 변경 시도: ID ${noticeId}, 새 분류: ${newCategory}`);
      
      // 한글 카테고리를 백엔드 enum으로 매핑
      const categoryMap: Record<string, string> = {
        '공지': 'NOTICE',
        '긴급': 'NOTICE',
        '업데이트': 'SYSTEM',
        '이벤트': 'EVENT',
      };
      
      const backendCategory = categoryMap[newCategory] || 'NOTICE';
      const isPriority = newCategory === '긴급';
      
      await noticesApi.changeNoticeCategory(noticeId, backendCategory, isPriority);
      
      // 즉시 UI 업데이트
      setNotices(prev => prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, category: newCategory, isPinned: isPriority }
          : notice
      ));
      
      toast.success("분류가 변경되었습니다.");
      
      setTimeout(() => {
        fetchNotices();
      }, 500);
    } catch (error: any) {
      console.error("분류 변경 실패:", error);
      const errorMessage = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      toast.error(`분류 변경에 실패했습니다: ${errorMessage}`);
      fetchNotices();
    }
  };

  // 대상 변경 핸들러
  const handleTargetChange = async (noticeId: number, newTarget: string) => {
    try {
      console.log(`대상 변경 시도: ID ${noticeId}, 새 대상: ${newTarget}`);
      
      // 한글 대상을 백엔드 형식으로 매핑
      const roleMap: Record<string, string> = {
        '보호자': 'GUARDIAN',
        '상담사': 'COUNSELOR',
        '어르신': 'ELDERLY',
        '관리자': 'ADMIN',
      };
      
      const targetMode = newTarget === "전체" ? 'ALL' : 'ROLE_SET';
      const targetRoles = newTarget === "전체" ? undefined : [roleMap[newTarget]];
      
      await noticesApi.changeNoticeTarget(noticeId, targetMode, targetRoles);
      
      // 즉시 UI 업데이트
      setNotices(prev => prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, targetRoles: [newTarget] }
          : notice
      ));
      
      toast.success("대상이 변경되었습니다.");
      
      setTimeout(() => {
        fetchNotices();
      }, 500);
    } catch (error: any) {
      console.error("대상 변경 실패:", error);
      const errorMessage = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      toast.error(`대상 변경에 실패했습니다: ${errorMessage}`);
      fetchNotices();
    }
  };

  const confirmDelete = async () => {
    if (selectedNotice) {
      try {
        await noticesApi.deleteNotice(selectedNotice.id);
        setNotices((prev) => prev.filter((n) => n.id !== selectedNotice.id));
        toast.success("공지사항이 삭제되었습니다.");
      } catch (error) {
        console.error("삭제 실패:", error);
        toast.error("공지사항 삭제에 실패했습니다.");
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 한글 카테고리 → 백엔드 enum 매핑
      const categoryMap: Record<string, 'NOTICE' | 'EVENT' | 'NEWS' | 'SYSTEM'> = {
        '공지': 'NOTICE',
        '긴급': 'NOTICE',
        '업데이트': 'SYSTEM',
        '이벤트': 'EVENT',
      };

      // 한글 대상 → 백엔드 Role enum 매핑
      const roleMap: Record<string, 'ADMIN' | 'COUNSELOR' | 'GUARDIAN' | 'ELDERLY'> = {
        '보호자': 'GUARDIAN',
        '상담사': 'COUNSELOR',
        '어르신': 'ELDERLY',
        '관리자': 'ADMIN',
      };

      const request: NoticeRequest = {
        title: formData.title,
        content: formData.content,
        category: categoryMap[formData.category] || 'NOTICE',
        targetMode: formData.target === "전체" ? 'ALL' : 'ROLE_SET',
        targetRoles: formData.target === "전체" ? undefined : [roleMap[formData.target]].filter(Boolean),
        isPriority: formData.isPinned || formData.category === "긴급",
        isPopup: false,
        status: formData.status,
      };

      if (isEditMode && selectedNotice) {
        await noticesApi.updateNotice(selectedNotice.id, request);
        toast.success("공지사항이 수정되었습니다.");
        await fetchNotices();
      } else {
        await noticesApi.createNotice(request);
        toast.success("새 공지사항이 등록되었습니다.");
        await fetchNotices();
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("저장 실패:", error);
      toast.error("공지사항 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-success/10 text-success border-0">게시중</Badge>;
      case "DRAFT":
        return <Badge className="bg-yellow-100 text-yellow-700 border-0">임시저장</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-700 border-0">보관</Badge>;
      case "DELETED":
        return <Badge className="bg-red-100 text-red-700 border-0">삭제됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="관리자" navItems={adminNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const result = await noticesApi.testNoticeApi();
                console.log("테스트 API 결과:", result);
                toast.success(`테스트 성공: ${result}`);
              } catch (error: any) {
                console.error("테스트 API 실패:", error);
                toast.error(`테스트 실패: ${error.response?.data?.message || error.message}`);
              }
            }}
          >
            API 테스트
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/notices/test-db');
                const result = await response.json();
                console.log("DB 테스트 결과:", result);
                if (result.success) {
                  toast.success(`DB 테스트 성공: ${result.data}`);
                } else {
                  toast.error(`DB 테스트 실패: ${result.data}`);
                }
              } catch (error: any) {
                console.error("DB 테스트 실패:", error);
                toast.error(`DB 테스트 실패: ${error.message}`);
              }
            }}
          >
            DB 테스트
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
                  <p className="text-xl font-bold">{notices.filter((n) => n.status === "PUBLISHED").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">임시저장</p>
                  <p className="text-xl font-bold">{notices.filter((n) => n.status === "DRAFT").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">보관</p>
                  <p className="text-xl font-bold">{notices.filter((n) => n.status === "ARCHIVED").length}</p>
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="PUBLISHED">게시중</SelectItem>
                  <SelectItem value="DRAFT">임시저장</SelectItem>
                  <SelectItem value="ARCHIVED">보관</SelectItem>
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
          <CardContent className="p-0 sm:p-6">
            {filteredNotices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                공지사항이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead className="w-32">분류</TableHead>
                      <TableHead className="w-28">대상</TableHead>
                      <TableHead className="w-24">등록일</TableHead>
                      <TableHead className="w-32">상태</TableHead>
                      <TableHead className="text-right w-32">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>
                          {notice.isPinned && <Pin className="w-4 h-4 text-warning" />}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleView(notice)}
                            className="font-medium line-clamp-1 text-left hover:text-primary hover:underline transition-colors"
                          >
                            {notice.title}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={notice.category}
                            onValueChange={(value) => handleCategoryChange(notice.id, value)}
                          >
                            <SelectTrigger className="w-28 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="공지">공지</SelectItem>
                              <SelectItem value="긴급">긴급</SelectItem>
                              <SelectItem value="업데이트">업데이트</SelectItem>
                              <SelectItem value="이벤트">이벤트</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={notice.targetRoles[0] || "전체"}
                            onValueChange={(value) => handleTargetChange(notice.id, value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="전체">전체</SelectItem>
                              <SelectItem value="보호자">보호자</SelectItem>
                              <SelectItem value="상담사">상담사</SelectItem>
                              <SelectItem value="어르신">어르신</SelectItem>
                              <SelectItem value="관리자">관리자</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{notice.createdAt}</TableCell>
                        <TableCell>
                          <Select
                            value={notice.status}
                            onValueChange={(value) => handleStatusChange(notice.id, value)}
                          >
                            <SelectTrigger className="w-28 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DRAFT">임시저장</SelectItem>
                              <SelectItem value="PUBLISHED">게시중</SelectItem>
                              <SelectItem value="ARCHIVED">보관</SelectItem>
                            </SelectContent>
                          </Select>
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
            )}
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
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                  onValueChange={(value) => setFormData({ ...formData, target: value })}
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
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">임시저장</SelectItem>
                  <SelectItem value="PUBLISHED">게시중</SelectItem>
                  <SelectItem value="ARCHIVED">보관</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
              {selectedNotice?.createdAt}
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