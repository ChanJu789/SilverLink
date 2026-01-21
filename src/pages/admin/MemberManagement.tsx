import { useState } from "react";
import { 
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

const members = [
  { id: 1, name: "김상담", email: "kim@example.com", phone: "010-1234-5678", role: "counselor", status: "active", createdAt: "2024-01-01", assignedCount: 45 },
  { id: 2, name: "홍길동", email: "hong@example.com", phone: "010-2345-6789", role: "guardian", status: "active", createdAt: "2024-01-05", senior: "김순자" },
  { id: 3, name: "이복지", email: "lee@example.com", phone: "010-3456-7890", role: "counselor", status: "pending", createdAt: "2024-01-10", assignedCount: 0 },
  { id: 4, name: "박보호", email: "park@example.com", phone: "010-4567-8901", role: "guardian", status: "inactive", createdAt: "2024-01-12", senior: "박영희" },
  { id: 5, name: "최상담", email: "choi@example.com", phone: "010-5678-9012", role: "counselor", status: "active", createdAt: "2024-01-15", assignedCount: 38 },
  { id: 6, name: "정보호", email: "jung@example.com", phone: "010-6789-0123", role: "guardian", status: "pending", createdAt: "2024-01-18", senior: "이철수" },
];

const seniors = [
  { id: 1, name: "김순자", age: 78, phone: "010-1111-2222", address: "서울시 강남구", guardian: "홍길동", counselor: "김상담", status: "active" },
  { id: 2, name: "박영희", age: 82, phone: "010-2222-3333", address: "서울시 서초구", guardian: "박보호", counselor: "김상담", status: "active" },
  { id: 3, name: "이철수", age: 75, phone: "010-3333-4444", address: "서울시 송파구", guardian: "정보호", counselor: "최상담", status: "inactive" },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-0">활성</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-0">승인대기</Badge>;
    case "inactive":
      return <Badge className="bg-muted text-muted-foreground border-0">비활성</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  switch (role) {
    case "counselor":
      return <Badge className="bg-primary/10 text-primary border-0">상담사</Badge>;
    case "guardian":
      return <Badge className="bg-accent/10 text-accent border-0">보호자</Badge>;
    case "senior":
      return <Badge className="bg-info/10 text-info border-0">어르신</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const MemberManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
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
            <Button>
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
                  <p className="text-2xl font-bold">45</p>
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
                  <p className="text-2xl font-bold">380</p>
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
                  <p className="text-2xl font-bold">825</p>
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
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">승인 대기</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="counselors-guardians" className="space-y-4">
          <TabsList>
            <TabsTrigger value="counselors-guardians">상담사/보호자</TabsTrigger>
            <TabsTrigger value="seniors">어르신</TabsTrigger>
          </TabsList>

          <TabsContent value="counselors-guardians" className="space-y-4">
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
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="역할" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 역할</SelectItem>
                      <SelectItem value="counselor">상담사</SelectItem>
                      <SelectItem value="guardian">보호자</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <TableHead>가입일</TableHead>
                      <TableHead>비고</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                {member.name.charAt(0)}
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
                          {member.role === "counselor" ? `담당 ${member.assignedCount}명` : `담당 어르신: ${member.senior}`}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seniors" className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>어르신</TableHead>
                      <TableHead>나이</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>주소</TableHead>
                      <TableHead>보호자</TableHead>
                      <TableHead>담당 상담사</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seniors.map((senior) => (
                      <TableRow key={senior.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-info/10 text-info text-sm">
                                {senior.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{senior.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{senior.age}세</TableCell>
                        <TableCell className="text-muted-foreground">{senior.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{senior.address}</TableCell>
                        <TableCell>{senior.guardian}</TableCell>
                        <TableCell>{senior.counselor}</TableCell>
                        <TableCell><StatusBadge status={senior.status} /></TableCell>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MemberManagement;
