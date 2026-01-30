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
  Key,
  Search,
  CheckCircle,
  XCircle,
  Loader2
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
import elderlyApi from "@/api/elderly";
import AddressSearch, { AddressData } from "@/components/common/AddressSearch";
import PhoneVerification from "@/components/common/PhoneVerification";
import { useAuth } from "@/contexts/AuthContext";

const MemberRegistration = () => {
  const { user } = useAuth();
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
    // 통화 스케줄
    preferredCallTime: "09:00",
    preferredCallDays: ["MON", "WED", "FRI"] as string[],
    callScheduleEnabled: true,
  });
  const [seniorPhoneVerified, setSeniorPhoneVerified] = useState(false);
  const [seniorProofToken, setSeniorProofToken] = useState("");

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
    relation: "CHILD",
    seniorId: "", // 연결할 어르신 ID
    memo: "",
    // 정보 승인 (UI용)
    sensitiveInfoApproval: true,
    medicationInfoApproval: true,
    healthInfoApproval: true,
  });
  const [guardianPhoneVerified, setGuardianPhoneVerified] = useState(false);
  const [guardianProofToken, setGuardianProofToken] = useState("");

  // 어르신 검색 상태
  const [elderlySearchId, setElderlySearchId] = useState("");
  const [elderlySearchResult, setElderlySearchResult] = useState<{
    id: number;
    name: string;
    phone?: string;
    birthDate?: string;
  } | null>(null);
  const [elderlySearching, setElderlySearching] = useState(false);
  const [elderlySearchError, setElderlySearchError] = useState("");

  // 어르신 검색 함수
  const handleElderlySearch = async () => {
    if (!elderlySearchId || isNaN(Number(elderlySearchId))) {
      setElderlySearchError("유효한 ID를 입력하세요.");
      return;
    }

    setElderlySearching(true);
    setElderlySearchError("");
    setElderlySearchResult(null);

    try {
      const result = await elderlyApi.getSummary(Number(elderlySearchId));
      setElderlySearchResult({
        id: Number(elderlySearchId),
        name: result.name,
        phone: result.phone,
        birthDate: result.birthDate,
      });
      setGuardianData({ ...guardianData, seniorId: elderlySearchId });
    } catch (error: any) {
      setElderlySearchError("해당 ID의 어르신을 찾을 수 없습니다.");
      setElderlySearchResult(null);
    } finally {
      setElderlySearching(false);
    }
  };

  // 어르신 주소 검색 결과 처리
  const handleSeniorAddressSelect = (data: AddressData) => {
    setSeniorData({
      ...seniorData,
      address: data.address,
      zipcode: data.zonecode,
      admCode: data.bcode, // 법정동 코드를 행정코드로 활용
    });
  };

  // 보호자 주소 검색 결과 처리
  const handleGuardianAddressSelect = (data: AddressData) => {
    setGuardianData({
      ...guardianData,
      address: data.address,
      zipcode: data.zonecode,
    });
  };

  // 어르신 휴대폰 인증 완료 처리
  const handleSeniorPhoneVerified = (proofToken: string) => {
    setSeniorPhoneVerified(true);
    setSeniorProofToken(proofToken);
  };

  // 보호자 휴대폰 인증 완료 처리
  const handleGuardianPhoneVerified = (proofToken: string) => {
    setGuardianPhoneVerified(true);
    setGuardianProofToken(proofToken);
  };

  const handleSeniorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 휴대폰 인증 필수 체크
    if (!seniorPhoneVerified) {
      toast({
        variant: "destructive",
        title: "휴대폰 인증 필요",
        description: "등록 전 휴대폰 인증을 완료해주세요.",
      });
      return;
    }

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
        gender: seniorData.gender as 'M' | 'F',
        addressLine1: seniorData.address,
        addressLine2: seniorData.detailAddress,
        zipcode: seniorData.zipcode || "00000",
        memo: seniorData.memo,
        // 통화 스케줄
        preferredCallTime: seniorData.callScheduleEnabled ? seniorData.preferredCallTime : undefined,
        preferredCallDays: seniorData.callScheduleEnabled ? seniorData.preferredCallDays : undefined,
        callScheduleEnabled: seniorData.callScheduleEnabled,
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
        preferredCallTime: "09:00", preferredCallDays: ["MON", "WED", "FRI"], callScheduleEnabled: true,
      });
      setSeniorPhoneVerified(false);
      setSeniorProofToken("");
    } catch (error: any) {
      // 백엔드에서 반환하는 오류 메시지 추출
      let errorMessage = "정보를 확인해주세요.";

      if (error.response?.data) {
        const data = error.response.data;
        // { error: "CODE", message: "메시지" } 형태
        if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }

      toast({
        variant: "destructive",
        title: "등록 실패",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 휴대폰 인증 필수 체크
    if (!guardianPhoneVerified) {
      toast({
        variant: "destructive",
        title: "휴대폰 인증 필요",
        description: "등록 전 휴대폰 인증을 완료해주세요.",
      });
      return;
    }

    // 어르신 검색 확인
    if (!elderlySearchResult) {
      toast({
        variant: "destructive",
        title: "어르신 확인 필요",
        description: "먼저 연결할 어르신을 검색해주세요.",
      });
      return;
    }

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
        memo: guardianData.memo,
        // proofToken: guardianProofToken, // 휴대폰 인증 토큰
      });

      toast({
        title: "보호자 등록 완료",
        description: `${guardianData.name}님이 성공적으로 등록되었습니다.`,
      });
      // Reset
      setGuardianData({
        loginId: "", password: "", name: "", phone: "", email: "",
        address: "", detailAddress: "", zipcode: "", relation: "CHILD",
        seniorId: "", memo: "", sensitiveInfoApproval: true, medicationInfoApproval: true, healthInfoApproval: true,
      });
      setGuardianPhoneVerified(false);
      setGuardianProofToken("");
      setElderlySearchResult(null);
      setElderlySearchId("");
    } catch (error: any) {
      // 백엔드에서 반환하는 오류 메시지 추출
      let errorMessage = "어르신 ID가 유효한지 확인해주세요.";

      if (error.response?.data) {
        const data = error.response.data;
        // { error: "CODE", message: "메시지" } 형태
        if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }

      toast({
        variant: "destructive",
        title: "등록 실패",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName={user?.name || "관리자"} navItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">

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
                          <Input
                            value={seniorData.phone}
                            onChange={e => {
                              setSeniorData({ ...seniorData, phone: e.target.value });
                              // 전화번호 변경 시 인증 초기화
                              if (seniorPhoneVerified) {
                                setSeniorPhoneVerified(false);
                                setSeniorProofToken("");
                              }
                            }}
                            required
                            placeholder="010-0000-0000"
                          />
                        </div>
                      </div>

                      {/* 휴대폰 인증 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> 휴대폰 인증 *
                        </Label>
                        <PhoneVerification
                          phone={seniorData.phone}
                          purpose="SIGNUP"
                          onVerified={handleSeniorPhoneVerified}
                          disabled={!seniorData.phone || seniorData.phone.length < 10}
                        />
                      </div>

                      {/* 주소 검색 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> 주소 *
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={seniorData.address}
                            onChange={e => setSeniorData({ ...seniorData, address: e.target.value })}
                            required
                            placeholder="주소 검색 버튼을 클릭하세요"
                            readOnly
                            className="flex-1"
                          />
                          <AddressSearch onSelect={handleSeniorAddressSelect} />
                        </div>
                        {seniorData.zipcode && (
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">우편번호: {seniorData.zipcode}</Badge>
                            {seniorData.admCode && (
                              <Badge variant="outline">행정코드: {seniorData.admCode}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>상세 주소</Label>
                          <Input value={seniorData.detailAddress} onChange={e => setSeniorData({ ...seniorData, detailAddress: e.target.value })} placeholder="동/호수 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label>메모</Label>
                          <Input value={seniorData.memo} onChange={e => setSeniorData({ ...seniorData, memo: e.target.value })} placeholder="관리자 메모" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 통화 스케줄 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="w-5 h-5 text-primary" /> 통화 스케줄
                      </CardTitle>
                      <CardDescription>어르신과의 정기 통화 일정을 설정합니다</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">스케줄 활성화</Label>
                          <p className="text-sm text-muted-foreground">정기 통화 스케줄 사용 여부</p>
                        </div>
                        <Switch
                          checked={seniorData.callScheduleEnabled}
                          onCheckedChange={(checked) => setSeniorData({ ...seniorData, callScheduleEnabled: checked })}
                        />
                      </div>

                      {seniorData.callScheduleEnabled && (
                        <>
                          <div className="space-y-2">
                            <Label>선호 통화 시간</Label>
                            <Select
                              value={seniorData.preferredCallTime}
                              onValueChange={(v) => setSeniorData({ ...seniorData, preferredCallTime: v })}
                            >
                              <SelectTrigger><SelectValue placeholder="시간 선택" /></SelectTrigger>
                              <SelectContent>
                                {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>선호 통화 요일</Label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: "MON", label: "월" },
                                { value: "TUE", label: "화" },
                                { value: "WED", label: "수" },
                                { value: "THU", label: "목" },
                                { value: "FRI", label: "금" },
                              ].map((day) => (
                                <Badge
                                  key={day.value}
                                  variant={seniorData.preferredCallDays.includes(day.value) ? "default" : "outline"}
                                  className="cursor-pointer px-4 py-2 text-sm"
                                  onClick={() => {
                                    const newDays = seniorData.preferredCallDays.includes(day.value)
                                      ? seniorData.preferredCallDays.filter((d) => d !== day.value)
                                      : [...seniorData.preferredCallDays, day.value];
                                    setSeniorData({ ...seniorData, preferredCallDays: newDays });
                                  }}
                                >
                                  {day.label}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              선택된 요일: {seniorData.preferredCallDays.length > 0
                                ? seniorData.preferredCallDays.map(d =>
                                  d === "MON" ? "월" : d === "TUE" ? "화" : d === "WED" ? "수" : d === "THU" ? "목" : "금"
                                ).join(", ")
                                : "없음"}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !seniorPhoneVerified}
                  >
                    {loading ? "등록 중..." : !seniorPhoneVerified ? "휴대폰 인증 필요" : "어르신 등록하기"}
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
                          <Input
                            value={guardianData.phone}
                            onChange={e => {
                              setGuardianData({ ...guardianData, phone: e.target.value });
                              // 전화번호 변경 시 인증 초기화
                              if (guardianPhoneVerified) {
                                setGuardianPhoneVerified(false);
                                setGuardianProofToken("");
                              }
                            }}
                            required
                            placeholder="010-0000-0000"
                          />
                        </div>
                      </div>

                      {/* 휴대폰 인증 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> 휴대폰 인증 *
                        </Label>
                        <PhoneVerification
                          phone={guardianData.phone}
                          purpose="SIGNUP"
                          onVerified={handleGuardianPhoneVerified}
                          disabled={!guardianData.phone || guardianData.phone.length < 10}
                        />
                      </div>

                      {/* 주소 검색 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> 주소
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={guardianData.address}
                            onChange={e => setGuardianData({ ...guardianData, address: e.target.value })}
                            placeholder="주소 검색 버튼을 클릭하세요"
                            readOnly
                            className="flex-1"
                          />
                          <AddressSearch onSelect={handleGuardianAddressSelect} />
                        </div>
                        {guardianData.zipcode && (
                          <Badge variant="secondary" className="mt-1">우편번호: {guardianData.zipcode}</Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>상세 주소</Label>
                        <Input value={guardianData.detailAddress} onChange={e => setGuardianData({ ...guardianData, detailAddress: e.target.value })} placeholder="동/호수 입력" />
                      </div>
                      <div className="space-y-2">
                        <Label>이메일</Label>
                        <Input type="email" value={guardianData.email} onChange={e => setGuardianData({ ...guardianData, email: e.target.value })} placeholder="example@email.com" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 연결 정보 */}
                  <Card className="shadow-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-info" /> 어르신 연결</CardTitle>
                      <CardDescription>연결할 어르신의 회원 ID를 입력하고 검색 버튼을 눌러 확인하세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 어르신 검색 */}
                      <div className="space-y-2">
                        <Label>어르신 회원 ID 검색 *</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={elderlySearchId}
                            onChange={e => {
                              setElderlySearchId(e.target.value);
                              setElderlySearchResult(null);
                              setElderlySearchError("");
                            }}
                            placeholder="어르신 ID 입력"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleElderlySearch}
                            disabled={elderlySearching || !elderlySearchId}
                          >
                            {elderlySearching ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                            <span className="ml-1">검색</span>
                          </Button>
                        </div>

                        {/* 검색 결과 */}
                        {elderlySearchResult && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-green-700">어르신 확인됨</p>
                              <p className="text-sm text-green-600">
                                이름: <strong>{elderlySearchResult.name}</strong>
                                {elderlySearchResult.phone && ` | 연락처: ${elderlySearchResult.phone}`}
                                {elderlySearchResult.birthDate && ` | 생년월일: ${elderlySearchResult.birthDate}`}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 검색 오류 */}
                        {elderlySearchError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-700">{elderlySearchError}</p>
                          </div>
                        )}
                      </div>

                      {/* 관계 선택 */}
                      <div className="space-y-2">
                        <Label>관계 *</Label>
                        <Select value={guardianData.relation} onValueChange={v => setGuardianData({ ...guardianData, relation: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CHILD">자녀</SelectItem>
                            <SelectItem value="SPOUSE">배우자</SelectItem>
                            <SelectItem value="RELATIVE">친척</SelectItem>
                            <SelectItem value="OTHER">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>메모</Label>
                        <Input value={guardianData.memo} onChange={e => setGuardianData({ ...guardianData, memo: e.target.value })} placeholder="관리자 메모" />
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !guardianPhoneVerified || !elderlySearchResult}
                  >
                    {loading
                      ? "등록 중..."
                      : !guardianPhoneVerified
                        ? "휴대폰 인증 필요"
                        : !elderlySearchResult
                          ? "어르신 검색 필요"
                          : "보호자 등록하기"}
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

