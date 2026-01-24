import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  Loader2
} from "lucide-react";
import { guardianNavItems } from "@/config/guardianNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import inquiriesApi from "@/api/inquiries";
import usersApi from "@/api/users";
import { InquiryResponse, MyProfileResponse } from "@/types/api";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-warning/10 text-warning border-0">답변 대기</Badge>;
    case "ANSWERED":
      return <Badge className="bg-success/10 text-success border-0">답변 완료</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const GuardianInquiry = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);

  // 새 문의 폼
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 사용자 프로필 조회
      const profile = await usersApi.getMyProfile();
      setUserProfile(profile);

      // 문의 목록 조회
      const inquiriesResponse = await inquiriesApi.getInquiries();
      setInquiries(inquiriesResponse);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInquiry = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setIsSubmitting(true);
      await inquiriesApi.createInquiry({
        title: newTitle,
        content: newContent,
      });

      // 목록 새로고침
      await fetchData();

      // 폼 초기화 및 다이얼로그 닫기
      setNewTitle("");
      setNewContent("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="guardian" userName="로딩중..." navItems={guardianNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const waitingCount = inquiries.filter(i => i.status === 'PENDING').length;
  const answeredCount = inquiries.filter(i => i.status === 'ANSWERED').length;

  return (
    <DashboardLayout
      role="guardian"
      userName={userProfile?.name || "보호자"}
      navItems={guardianNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">1:1 문의</h1>
            <p className="text-muted-foreground mt-1">담당 상담사에게 문의하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 문의 작성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 문의 작성</DialogTitle>
                <DialogDescription>담당 상담사에게 문의를 보냅니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>제목</Label>
                  <Input
                    placeholder="문의 제목을 입력하세요"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>문의 내용</Label>
                  <Textarea
                    placeholder="문의 내용을 상세히 작성해 주세요"
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={handleCreateInquiry} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  문의 등록
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inquiries.length}</p>
                  <p className="text-sm text-muted-foreground">전체 문의</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{waitingCount}</p>
                  <p className="text-sm text-muted-foreground">답변 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{answeredCount}</p>
                  <p className="text-sm text-muted-foreground">답변 완료</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">문의 목록</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inquiries.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      등록된 문의가 없습니다.
                    </div>
                  ) : (
                    inquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${selectedInquiry?.id === inquiry.id ? 'bg-muted/50' : ''
                          }`}
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <StatusBadge status={inquiry.status} />
                          <span className="text-xs text-muted-foreground">
                            {inquiry.createdAt?.split('T')[0]}
                          </span>
                        </div>
                        <h3 className="font-medium line-clamp-1">{inquiry.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {inquiry.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <Card className="shadow-card border-0 h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={selectedInquiry.status} />
                      </div>
                      <CardTitle className="text-lg">{selectedInquiry.title}</CardTitle>
                      <CardDescription>작성자: {selectedInquiry.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {/* 문의 내용 */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] p-4 rounded-2xl bg-primary text-primary-foreground rounded-br-none">
                        <p className="text-sm">{selectedInquiry.content}</p>
                        <p className="text-xs mt-2 text-primary-foreground/70">
                          {selectedInquiry.createdAt?.split('T')[0]}
                        </p>
                      </div>
                    </div>

                    {/* 답변 */}
                    {selectedInquiry.answer && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl bg-secondary rounded-bl-none">
                          <p className="text-sm">{selectedInquiry.answer}</p>
                          <p className="text-xs mt-2 text-muted-foreground">
                            {selectedInquiry.answeredAt?.split('T')[0]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                {selectedInquiry.status === 'PENDING' && (
                  <div className="p-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      상담사의 답변을 기다리고 있습니다.
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="shadow-card border-0 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">문의를 선택하면 상세 내용을 확인할 수 있습니다</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuardianInquiry;
