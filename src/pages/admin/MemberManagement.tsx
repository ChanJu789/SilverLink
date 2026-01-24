import { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Loader2,
  Users
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import usersApi from "@/api/users";
import counselorsApi from "@/api/counselors";
import { MyProfileResponse, CounselorResponse } from "@/types/api";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
    case "ACTIVE":
      return <Badge className="bg-success/10 text-success border-0">활성</Badge>;
    case "pending":
    case "PENDING":
      return <Badge className="bg-warning/10 text-warning border-0">승인대기</Badge>;
    case "inactive":
    case "INACTIVE":
      return <Badge className="bg-muted text-muted-foreground border-0">비활성</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  switch (role) {
    case "counselor":
    case "COUNSELOR":
      return <Badge className="bg-primary/10 text-primary border-0">상담사</Badge>;
    case "guardian":
    case "GUARDIAN":
      return <Badge className="bg-accent/10 text-accent border-0">보호자</Badge>;
    case "senior":
    case "ELDERLY":
      return <Badge className="bg-info/10 text-info border-0">어르신</Badge>;
    case "admin":
    case "ADMIN":
      return <Badge className="bg-destructive/10 text-destructive border-0">관리자</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

interface MemberData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt?: string;
  assignedCount?: number;
}

const MemberManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [counselors, setCounselors] = useState<CounselorResponse[]>([]);
  const [userProfile, setUserProfile] = useState<MyProfileResponse | null>(null);

  // Stats
  const [stats, setStats] = useState({
    counselors: 0,
    guardians: 0,
    seniors: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get current user profile
        const profile = await usersApi.getMyProfile();
        setUserProfile(profile);

        // Get all counselors
        const counselorList = await counselorsApi.getAllCounselors();
        setCounselors(counselorList);

        // Transform counselors to member format
        const memberList: MemberData[] = counselorList.map((c) => ({
          id: c.userId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: 'counselor',
          status: 'active',
          createdAt: c.approvedAt?.split('T')[0] || '',
          assignedCount: c.elderlyCount || 0
        }));

        setMembers(memberList);

        // Update stats
        setStats({
          counselors: counselorList.length,
          guardians: 0, // Would need guardians API
          seniors: counselorList.reduce((sum, c) => sum + (c.elderlyCount || 0), 0),
          pending: 0 // Would need pending count API
        });

      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.includes(searchQuery);
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <DashboardLayout role="admin" userName="로딩중..." navItems={adminNavItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      userName={userProfile?.name || "관리자"}
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">회원 관리</h1>
            <p className="text-muted-foreground mt-1">상담사, 보호자, 어르신 계정을 관리합니다</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button onClick={() => navigate('/admin/members/register')}>
              <UserPlus className="w-4 h-4 mr-2" />
              회원 추가
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.counselors}</p>
                  <p className="text-sm text-muted-foreground">상담사</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.guardians}</p>
                  <p className="text-sm text-muted-foreground">보호자</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.seniors}</p>
                  <p className="text-sm text-muted-foreground">어르신</p>
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
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">승인 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="counselors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="counselors">상담사</TabsTrigger>
            <TabsTrigger value="guardians">보호자</TabsTrigger>
            <TabsTrigger value="seniors">어르신</TabsTrigger>
          </TabsList>

          <TabsContent value="counselors" className="space-y-4">
            {/* Filters */}
            <Card className="shadow-card border-0">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="이름, 이메일, 전화번호로 검색..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="pending">승인대기</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>승인일</TableHead>
                      <TableHead>담당</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? '검색 결과가 없습니다.' : '등록된 상담사가 없습니다.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                  {member.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><RoleBadge role={member.role} /></TableCell>
                          <TableCell className="text-muted-foreground">{member.phone}</TableCell>
                          <TableCell><StatusBadge status={member.status} /></TableCell>
                          <TableCell className="text-muted-foreground">{member.createdAt}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {member.assignedCount}명
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  상세보기
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  수정
                                </DropdownMenuItem>
                                {member.status === "pending" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-success">
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      승인
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      거절
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guardians" className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center text-muted-foreground">
                보호자 목록을 표시하려면 백엔드 API가 필요합니다.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seniors" className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center text-muted-foreground">
                어르신 목록을 표시하려면 백엔드 API가 필요합니다.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MemberManagement;
