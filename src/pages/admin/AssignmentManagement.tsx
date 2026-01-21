import { useState } from "react";
import { 
  Search,
  ArrowRight,
  RefreshCw,
  Plus,
  ChevronDown
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const counselors = [
  { id: 1, name: "김상담", email: "kim@example.com", assignedCount: 45, capacity: 50, region: "서울 강남" },
  { id: 2, name: "이복지", email: "lee@example.com", assignedCount: 38, capacity: 50, region: "서울 서초" },
  { id: 3, name: "최상담", email: "choi@example.com", assignedCount: 42, capacity: 50, region: "서울 송파" },
  { id: 4, name: "박복지", email: "park@example.com", assignedCount: 28, capacity: 40, region: "서울 강동" },
];

const seniors = [
  { id: 1, name: "김순자", age: 78, region: "서울 강남", counselor: "김상담", guardian: "홍길동" },
  { id: 2, name: "박영희", age: 82, region: "서울 서초", counselor: "이복지", guardian: "박민수" },
  { id: 3, name: "이철수", age: 75, region: "서울 송파", counselor: "최상담", guardian: "이영희" },
  { id: 4, name: "정미영", age: 80, region: "서울 강남", counselor: "김상담", guardian: "정철수" },
  { id: 5, name: "최동수", age: 77, region: "서울 강동", counselor: "박복지", guardian: "최민희" },
  { id: 6, name: "한명숙", age: 79, region: "서울 서초", counselor: "이복지", guardian: "한철수" },
];

const recentChanges = [
  { id: 1, senior: "김순자", from: "이복지", to: "김상담", date: "2024-01-15", reason: "지역 변경" },
  { id: 2, senior: "박영희", from: "김상담", to: "이복지", date: "2024-01-14", reason: "업무량 조정" },
  { id: 3, senior: "정미영", from: "최상담", to: "김상담", date: "2024-01-13", reason: "요청" },
];

const AssignmentManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <h1 className="text-2xl font-bold text-foreground">배정 관리</h1>
            <p className="text-muted-foreground mt-1">상담사에게 어르신을 배정하고 관리합니다</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 배정
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 배정</DialogTitle>
                <DialogDescription>어르신을 담당 상담사에게 배정합니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>어르신 선택</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="어르신을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {seniors.map(senior => (
                        <SelectItem key={senior.id} value={senior.id.toString()}>
                          {senior.name} ({senior.age}세) - {senior.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>담당 상담사</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="상담사를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {counselors.map(counselor => (
                        <SelectItem key={counselor.id} value={counselor.id.toString()}>
                          {counselor.name} ({counselor.assignedCount}/{counselor.capacity}) - {counselor.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                <Button onClick={() => setIsDialogOpen(false)}>배정하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Counselor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {counselor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{counselor.name}</h3>
                    <p className="text-sm text-muted-foreground">{counselor.region}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">배정 현황</span>
                    <span className="font-medium">{counselor.assignedCount}/{counselor.capacity}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        counselor.assignedCount / counselor.capacity > 0.9 ? 'bg-destructive' :
                        counselor.assignedCount / counselor.capacity > 0.7 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${(counselor.assignedCount / counselor.capacity) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {counselor.capacity - counselor.assignedCount}명 추가 배정 가능
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assignment List */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">배정 현황</CardTitle>
                    <CardDescription>어르신별 담당 상담사 현황</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="어르신 검색..." 
                        className="pl-10 w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="상담사" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 상담사</SelectItem>
                        {counselors.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seniors.map((senior) => (
                    <div 
                      key={senior.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-info/10 text-info">
                            {senior.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{senior.name}</p>
                          <p className="text-sm text-muted-foreground">{senior.age}세 · {senior.region}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{senior.counselor}</p>
                          <p className="text-xs text-muted-foreground">보호자: {senior.guardian}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          변경
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Changes */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">최근 배정 변경</CardTitle>
              <CardDescription>최근 배정 변경 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChanges.map((change) => (
                  <div key={change.id} className="p-4 rounded-xl bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{change.senior}</span>
                      <span className="text-xs text-muted-foreground">{change.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{change.from}</span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="text-primary font-medium">{change.to}</span>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">{change.reason}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentManagement;
