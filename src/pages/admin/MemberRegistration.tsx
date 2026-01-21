import { useState } from "react";
import { 
  Save,
  Pill,
  ChevronLeft,
  Phone,
  MapPin,
  Calendar,
  User,
  Heart,
  AlertCircle
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileText } from "lucide-react";

const counselors = [
  { id: 1, name: "김상담", region: "서울 강남" },
  { id: 2, name: "이복지", region: "서울 서초" },
  { id: 3, name: "최상담", region: "서울 송파" },
  { id: 4, name: "박복지", region: "서울 강동" },
];

const MemberRegistration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("senior");

  // 어르신 등록 정보
  const [seniorData, setSeniorData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    address: "",
    detailAddress: "",
    emergencyContact: "",
    emergencyRelation: "",
    assignedCounselor: "",
    notes: "",
    // 민감정보 접근 승인
    sensitiveInfoApproval: false,
    medicationInfoApproval: false,
    healthInfoApproval: false,
  });

  // 보호자 등록 정보
  const [guardianData, setGuardianData] = useState({
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    relation: "",
    seniorName: "",
    // 민감정보 접근 승인
    sensitiveInfoApproval: false,
    medicationInfoApproval: false,
    healthInfoApproval: false,
    callRecordAccess: false,
  });

  const handleSeniorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "어르신 등록 완료",
      description: `${seniorData.name}님이 성공적으로 등록되었습니다.`,
    });
    // Reset form
    setSeniorData({
      name: "",
      birthDate: "",
      phone: "",
      address: "",
      detailAddress: "",
      emergencyContact: "",
      emergencyRelation: "",
      assignedCounselor: "",
      notes: "",
      sensitiveInfoApproval: false,
      medicationInfoApproval: false,
      healthInfoApproval: false,
    });
  };

  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "보호자 등록 완료",
      description: `${guardianData.name}님이 성공적으로 등록되었습니다.`,
    });
    // Reset form
    setGuardianData({
      name: "",
      birthDate: "",
      phone: "",
      email: "",
      address: "",
      relation: "",
      seniorName: "",
      sensitiveInfoApproval: false,
      medicationInfoApproval: false,
      healthInfoApproval: false,
      callRecordAccess: false,
    });
  };

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/members">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">회원 등록</h1>
            <p className="text-muted-foreground mt-1">방문 센터 등록 시 어르신 또는 보호자를 등록합니다</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="senior" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              어르신 등록
            </TabsTrigger>
            <TabsTrigger value="guardian" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              보호자 등록
            </TabsTrigger>
          </TabsList>

          {/* 어르신 등록 탭 */}
          <TabsContent value="senior" className="mt-6">
            <form onSubmit={handleSeniorSubmit}>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* 기본 정보 */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-primary" />
                        기본 정보
                      </CardTitle>
                      <CardDescription>어르신의 기본 정보를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="senior-name">성명 *</Label>
                          <Input
                            id="senior-name"
                            placeholder="홍길동"
                            value={seniorData.name}
                            onChange={(e) => setSeniorData({ ...seniorData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="senior-birth">생년월일 *</Label>
                          <Input
                            id="senior-birth"
                            type="date"
                            value={seniorData.birthDate}
                            onChange={(e) => setSeniorData({ ...seniorData, birthDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="senior-phone">연락처 *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="senior-phone"
                              placeholder="010-0000-0000"
                              className="pl-10"
                              value={seniorData.phone}
                              onChange={(e) => setSeniorData({ ...seniorData, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="senior-counselor">담당 상담사 *</Label>
                          <Select
                            value={seniorData.assignedCounselor}
                            onValueChange={(value) => setSeniorData({ ...seniorData, assignedCounselor: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="상담사 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {counselors.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name} ({c.region})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senior-address">주소 *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="senior-address"
                            placeholder="서울시 강남구 역삼동"
                            className="pl-10"
                            value={seniorData.address}
                            onChange={(e) => setSeniorData({ ...seniorData, address: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senior-detail-address">상세 주소</Label>
                        <Input
                          id="senior-detail-address"
                          placeholder="아파트 동/호수"
                          value={seniorData.detailAddress}
                          onChange={(e) => setSeniorData({ ...seniorData, detailAddress: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="w-5 h-5 text-warning" />
                        비상 연락처
                      </CardTitle>
                      <CardDescription>긴급 상황 시 연락할 보호자 정보</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergency-contact">비상 연락처 *</Label>
                          <Input
                            id="emergency-contact"
                            placeholder="010-0000-0000"
                            value={seniorData.emergencyContact}
                            onChange={(e) => setSeniorData({ ...seniorData, emergencyContact: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergency-relation">관계 *</Label>
                          <Select
                            value={seniorData.emergencyRelation}
                            onValueChange={(value) => setSeniorData({ ...seniorData, emergencyRelation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="관계 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="child">자녀</SelectItem>
                              <SelectItem value="spouse">배우자</SelectItem>
                              <SelectItem value="sibling">형제/자매</SelectItem>
                              <SelectItem value="grandchild">손자녀</SelectItem>
                              <SelectItem value="relative">친척</SelectItem>
                              <SelectItem value="neighbor">이웃</SelectItem>
                              <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senior-notes">특이사항</Label>
                        <Textarea
                          id="senior-notes"
                          placeholder="건강 상태, 주의사항 등을 입력해주세요"
                          value={seniorData.notes}
                          onChange={(e) => setSeniorData({ ...seniorData, notes: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 민감정보 접근 승인 */}
                <div className="space-y-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-destructive" />
                        민감정보 접근 승인
                      </CardTitle>
                      <CardDescription>
                        상담사의 민감정보 조회 권한을 설정합니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium mb-2">⚠️ 주의사항</p>
                        <p className="text-xs text-muted-foreground">
                          민감정보 접근 승인은 어르신 본인 또는 법정 대리인의 동의가 필요합니다.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">민감정보 조회</p>
                              <p className="text-xs text-muted-foreground">주민등록번호, 금융정보 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={seniorData.sensitiveInfoApproval}
                            onCheckedChange={(checked) => 
                              setSeniorData({ ...seniorData, sensitiveInfoApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                              <Pill className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">복약정보 조회</p>
                              <p className="text-xs text-muted-foreground">처방약, 복용 일정 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={seniorData.medicationInfoApproval}
                            onCheckedChange={(checked) => 
                              setSeniorData({ ...seniorData, medicationInfoApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                              <Heart className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">건강정보 조회</p>
                              <p className="text-xs text-muted-foreground">진료 기록, 건강 상태 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={seniorData.healthInfoApproval}
                            onCheckedChange={(checked) => 
                              setSeniorData({ ...seniorData, healthInfoApproval: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Badge variant={seniorData.sensitiveInfoApproval || seniorData.medicationInfoApproval || seniorData.healthInfoApproval ? "default" : "secondary"}>
                            {[seniorData.sensitiveInfoApproval, seniorData.medicationInfoApproval, seniorData.healthInfoApproval].filter(Boolean).length}개 승인됨
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full" size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    어르신 등록하기
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* 보호자 등록 탭 */}
          <TabsContent value="guardian" className="mt-6">
            <form onSubmit={handleGuardianSubmit}>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* 기본 정보 */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="w-5 h-5 text-primary" />
                        보호자 기본 정보
                      </CardTitle>
                      <CardDescription>보호자의 기본 정보를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardian-name">성명 *</Label>
                          <Input
                            id="guardian-name"
                            placeholder="홍길동"
                            value={guardianData.name}
                            onChange={(e) => setGuardianData({ ...guardianData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardian-birth">생년월일 *</Label>
                          <Input
                            id="guardian-birth"
                            type="date"
                            value={guardianData.birthDate}
                            onChange={(e) => setGuardianData({ ...guardianData, birthDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardian-phone">연락처 *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="guardian-phone"
                              placeholder="010-0000-0000"
                              className="pl-10"
                              value={guardianData.phone}
                              onChange={(e) => setGuardianData({ ...guardianData, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardian-email">이메일</Label>
                          <Input
                            id="guardian-email"
                            type="email"
                            placeholder="example@email.com"
                            value={guardianData.email}
                            onChange={(e) => setGuardianData({ ...guardianData, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardian-address">주소</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="guardian-address"
                            placeholder="서울시 강남구 역삼동"
                            className="pl-10"
                            value={guardianData.address}
                            onChange={(e) => setGuardianData({ ...guardianData, address: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-info" />
                        어르신 연결
                      </CardTitle>
                      <CardDescription>보호할 어르신 정보를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardian-senior">담당 어르신 *</Label>
                          <Input
                            id="guardian-senior"
                            placeholder="어르신 성함"
                            value={guardianData.seniorName}
                            onChange={(e) => setGuardianData({ ...guardianData, seniorName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardian-relation">관계 *</Label>
                          <Select
                            value={guardianData.relation}
                            onValueChange={(value) => setGuardianData({ ...guardianData, relation: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="관계 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="child">자녀</SelectItem>
                              <SelectItem value="spouse">배우자</SelectItem>
                              <SelectItem value="sibling">형제/자매</SelectItem>
                              <SelectItem value="grandchild">손자녀</SelectItem>
                              <SelectItem value="relative">친척</SelectItem>
                              <SelectItem value="caregiver">돌봄제공자</SelectItem>
                              <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 정보 접근 승인 */}
                <div className="space-y-6">
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-destructive" />
                        정보 접근 승인
                      </CardTitle>
                      <CardDescription>
                        보호자의 어르신 정보 조회 권한을 설정합니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                        <p className="text-sm text-info font-medium mb-2">ℹ️ 안내</p>
                        <p className="text-xs text-muted-foreground">
                          보호자는 승인된 항목에 한해 어르신의 정보를 조회할 수 있습니다.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">민감정보 조회</p>
                              <p className="text-xs text-muted-foreground">주민등록번호, 금융정보 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={guardianData.sensitiveInfoApproval}
                            onCheckedChange={(checked) => 
                              setGuardianData({ ...guardianData, sensitiveInfoApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                              <Pill className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">복약정보 조회</p>
                              <p className="text-xs text-muted-foreground">처방약, 복용 일정 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={guardianData.medicationInfoApproval}
                            onCheckedChange={(checked) => 
                              setGuardianData({ ...guardianData, medicationInfoApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                              <Heart className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">건강정보 조회</p>
                              <p className="text-xs text-muted-foreground">진료 기록, 건강 상태 등</p>
                            </div>
                          </div>
                          <Switch
                            checked={guardianData.healthInfoApproval}
                            onCheckedChange={(checked) => 
                              setGuardianData({ ...guardianData, healthInfoApproval: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">통화기록 조회</p>
                              <p className="text-xs text-muted-foreground">AI 안부전화 기록</p>
                            </div>
                          </div>
                          <Switch
                            checked={guardianData.callRecordAccess}
                            onCheckedChange={(checked) => 
                              setGuardianData({ ...guardianData, callRecordAccess: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Badge variant={
                            guardianData.sensitiveInfoApproval || 
                            guardianData.medicationInfoApproval || 
                            guardianData.healthInfoApproval ||
                            guardianData.callRecordAccess 
                              ? "default" 
                              : "secondary"
                          }>
                            {[
                              guardianData.sensitiveInfoApproval, 
                              guardianData.medicationInfoApproval, 
                              guardianData.healthInfoApproval,
                              guardianData.callRecordAccess
                            ].filter(Boolean).length}개 승인됨
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full" size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    보호자 등록하기
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MemberRegistration;
