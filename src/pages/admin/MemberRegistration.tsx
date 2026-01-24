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
  AlertCircle,
  Key
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
import { registerElderly, registerGuardian } from "@/api/admins";

const MemberRegistration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("senior");
  const [loading, setLoading] = useState(false);

  // 어르신 등록 정보
  const [seniorData, setSeniorData] = useState({
    loginId: "",
    password: "",
    name: "",
    birthDate: "",
    gender: "M",
    phone: "",
    address: "",
    detailAddress: "",
    zipcode: "",
    admCode: "", // 행정코드
    memo: "",
    // 민감정보 접근 승인 (UI상 보여주기용, 실제로는 BE에서 일괄 처리됨)
    sensitiveInfoApproval: true,
    medicationInfoApproval: true,
    healthInfoApproval: true,
  });

  // 보호자 등록 정보
  const [guardianData, setGuardianData] = useState({
    loginId: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    detailAddress: "",
    zipcode: "",
    relation: "FAMILY",
    seniorId: "", // 연결할 어르신 ID
    memo: "",
    // 정보 승인 (UI용)
    sensitiveInfoApproval: true,
    medicationInfoApproval: true,
    healthInfoApproval: true,
  });

  const handleSeniorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerElderly({
        loginId: seniorData.loginId,
        password: seniorData.password,
        name: seniorData.name,
        phone: seniorData.phone,
        // email: optional
        admCode: Number(seniorData.admCode) || 12345678, // 임시 기본값 또는 입력받기
        birthDate: seniorData.birthDate,
        gender: seniorData.gender,
        addressLine1: seniorData.address,
        addressLine2: seniorData.detailAddress,
        zipcode: seniorData.zipcode || "00000",
        memo: seniorData.memo
      });

      toast({
        title: "어르신 등록 완료",
        description: `${seniorData.name}님이 성공적으로 등록되었습니다.`,
      });
      // Reset form
      setSeniorData({
        loginId: "", password: "", name: "", birthDate: "", gender: "M",
        phone: "", address: "", detailAddress: "", zipcode: "", admCode: "",
        memo: "", sensitiveInfoApproval: true, medicationInfoApproval: true, healthInfoApproval: true,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "등록 실패",
        description: "정보를 확인해주세요. (ID/전화번호 중복 등)",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerGuardian({
        loginId: guardianData.loginId,
        password: guardianData.password,
        name: guardianData.name,
        phone: guardianData.phone,
        email: guardianData.email,
        addressLine1: guardianData.address,
        addressLine2: guardianData.detailAddress,
        zipcode: guardianData.zipcode || "00000",
        elderlyUserId: Number(guardianData.seniorId),
        relationType: guardianData.relation,
        memo: guardianData.memo
      });

      toast({
        title: "보호자 등록 완료",
        description: `${guardianData.name}님이 성공적으로 등록되었습니다.`,
      });
      // Reset
      setGuardianData({
        loginId: "", password: "", name: "", phone: "", email: "",
        address: "", detailAddress: "", zipcode: "", relation: "FAMILY",
        seniorId: "", memo: "", sensitiveInfoApproval: true, medicationInfoApproval: true, healthInfoApproval: true,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "등록 실패",
        description: "어르신 ID가 유효한지 확인해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="관리자" navItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/members">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">회원 등록</h1>
            <p className="text-muted-foreground mt-1">방문 센터 등록 시 어르신 또는 보호자를 등록합니다</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="senior" className="flex items-center gap-2">
              <User className="w-4 h-4" /> 어르신 등록
            </TabsTrigger>
            <TabsTrigger value="guardian" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> 보호자 등록
            </TabsTrigger>
          </TabsList>

          <TabsContent value="senior" className="mt-6">
            <form onSubmit={handleSeniorSubmit}>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* 계정 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Key className="w-5 h-5 text-primary" /> 계정 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>로그인 ID *</Label>
                        <Input value={seniorData.loginId} onChange={e => setSeniorData({ ...seniorData, loginId: e.target.value })} required placeholder="아이디 입력" />
                      </div>
                      <div className="space-y-2">
                        <Label>비밀번호 *</Label>
                        <Input type="password" value={seniorData.password} onChange={e => setSeniorData({ ...seniorData, password: e.target.value })} required placeholder="비밀번호" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기본 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-primary" /> 기본 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>성명 *</Label>
                          <Input value={seniorData.name} onChange={e => setSeniorData({ ...seniorData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label>생년월일 *</Label>
                          <Input type="date" value={seniorData.birthDate} onChange={e => setSeniorData({ ...seniorData, birthDate: e.target.value })} required />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>성별 *</Label>
                          <Select value={seniorData.gender} onValueChange={v => setSeniorData({ ...seniorData, gender: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">남성</SelectItem>
                              <SelectItem value="F">여성</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>연락처 *</Label>
                          <Input value={seniorData.phone} onChange={e => setSeniorData({ ...seniorData, phone: e.target.value })} required placeholder="010-0000-0000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>주소 *</Label>
                        <Input value={seniorData.address} onChange={e => setSeniorData({ ...seniorData, address: e.target.value })} required placeholder="기본 주소" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>상세 주소</Label>
                          <Input value={seniorData.detailAddress} onChange={e => setSeniorData({ ...seniorData, detailAddress: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>행정코드 (숫자)</Label>
                          <Input value={seniorData.admCode} onChange={e => setSeniorData({ ...seniorData, admCode: e.target.value })} placeholder="예: 1111000000" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "등록 중..." : "어르신 등록하기"}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="guardian" className="mt-6">
            <form onSubmit={handleGuardianSubmit}>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* 계정 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Key className="w-5 h-5 text-primary" /> 계정 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>로그인 ID *</Label>
                        <Input value={guardianData.loginId} onChange={e => setGuardianData({ ...guardianData, loginId: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>비밀번호 *</Label>
                        <Input type="password" value={guardianData.password} onChange={e => setGuardianData({ ...guardianData, password: e.target.value })} required />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기본 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="w-5 h-5 text-primary" /> 보호자 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>성명 *</Label>
                          <Input value={guardianData.name} onChange={e => setGuardianData({ ...guardianData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label>연락처 *</Label>
                          <Input value={guardianData.phone} onChange={e => setGuardianData({ ...guardianData, phone: e.target.value })} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>주소</Label>
                        <Input value={guardianData.address} onChange={e => setGuardianData({ ...guardianData, address: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 연결 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-info" /> 어르신 연결</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>어르신 회원 ID (숫자) *</Label>
                          <Input type="number" value={guardianData.seniorId} onChange={e => setGuardianData({ ...guardianData, seniorId: e.target.value })} required placeholder="시스템 사용자 ID" />
                        </div>
                        <div className="space-y-2">
                          <Label>관계 *</Label>
                          <Select value={guardianData.relation} onValueChange={v => setGuardianData({ ...guardianData, relation: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FAMILY">가족</SelectItem>
                              <SelectItem value="CAREGIVER">간병인</SelectItem>
                              <SelectItem value="OTHER">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "등록 중..." : "보호자 등록하기"}
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
