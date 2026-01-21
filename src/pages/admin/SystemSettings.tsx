import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Bell,
  Shield,
  Database,
  Mail,
  Phone,
  Clock,
  Save,
  RefreshCw,
  Globe
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { BarChart3 } from "lucide-react";

const SystemSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  
  // 일반 설정
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "마음돌봄",
    siteDescription: "국가 복지 서비스 - AI 기반 어르신 안심 돌봄 시스템",
    contactEmail: "support@maumdolbom.go.kr",
    contactPhone: "1588-0000",
    operatingHours: "09:00 - 18:00",
    maintenanceMode: false,
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    emergencyAlertEmail: true,
    emergencyAlertSms: true,
    dailyReportEmail: true,
    weeklyReportEmail: false,
  });

  // AI 설정
  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    analysisInterval: "24",
    riskThreshold: "70",
    emotionDetection: true,
    voiceAnalysis: true,
    autoAlert: true,
  });

  // 보안 설정
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordExpiry: "90",
    twoFactorAuth: false,
    ipWhitelist: "",
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`${section} 설정이 저장되었습니다.`);
    setIsSaving(false);
  };

  return (
    <DashboardLayout
      role="admin"
      userName="관리자"
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">시스템 설정</h1>
          <p className="text-muted-foreground">시스템 전반의 설정을 관리합니다</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="w-4 h-4" />
              일반
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              알림
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              보안
            </TabsTrigger>
          </TabsList>

          {/* 일반 설정 */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>일반 설정</CardTitle>
                <CardDescription>사이트 기본 정보를 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">사이트 이름</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">운영 시간</Label>
                    <Input
                      id="operatingHours"
                      value={generalSettings.operatingHours}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, operatingHours: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">사이트 설명</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">문의 이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">문의 전화</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contactPhone"
                        value={generalSettings.contactPhone}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="space-y-1">
                    <p className="font-medium">유지보수 모드</p>
                    <p className="text-sm text-muted-foreground">
                      활성화 시 관리자 외 접근이 차단됩니다
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("일반")} disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 알림 설정 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>알림 수신 방법을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">기본 알림</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span>이메일 알림</span>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <span>SMS 알림</span>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <span>푸시 알림</span>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">긴급 알림</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-destructive" />
                        <span>긴급상황 이메일 알림</span>
                      </div>
                      <Switch
                        checked={notificationSettings.emergencyAlertEmail}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emergencyAlertEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-destructive" />
                        <span>긴급상황 SMS 알림</span>
                      </div>
                      <Switch
                        checked={notificationSettings.emergencyAlertSms}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emergencyAlertSms: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">리포트 설정</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span>일일 리포트 이메일</span>
                      <Switch
                        checked={notificationSettings.dailyReportEmail}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, dailyReportEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span>주간 리포트 이메일</span>
                      <Switch
                        checked={notificationSettings.weeklyReportEmail}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, weeklyReportEmail: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("알림")} disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI 설정 */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI 분석 설정</CardTitle>
                <CardDescription>AI 분석 기능을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="space-y-1">
                      <p className="font-medium">자동 분석</p>
                      <p className="text-sm text-muted-foreground">
                        통화 종료 후 자동으로 AI 분석을 수행합니다
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.autoAnalysis}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, autoAnalysis: checked })
                      }
                    />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>분석 주기 (시간)</Label>
                      <Select
                        value={aiSettings.analysisInterval}
                        onValueChange={(value) =>
                          setAiSettings({ ...aiSettings, analysisInterval: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12시간</SelectItem>
                          <SelectItem value="24">24시간</SelectItem>
                          <SelectItem value="48">48시간</SelectItem>
                          <SelectItem value="168">1주일</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>위험도 임계값 (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={aiSettings.riskThreshold}
                        onChange={(e) =>
                          setAiSettings({ ...aiSettings, riskThreshold: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">분석 기능</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">감정 분석</p>
                        <p className="text-sm text-muted-foreground">
                          통화 내용에서 감정 상태를 분석합니다
                        </p>
                      </div>
                      <Switch
                        checked={aiSettings.emotionDetection}
                        onCheckedChange={(checked) =>
                          setAiSettings({ ...aiSettings, emotionDetection: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">음성 분석</p>
                        <p className="text-sm text-muted-foreground">
                          음성 톤과 패턴을 분석합니다
                        </p>
                      </div>
                      <Switch
                        checked={aiSettings.voiceAnalysis}
                        onCheckedChange={(checked) =>
                          setAiSettings({ ...aiSettings, voiceAnalysis: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="space-y-1">
                        <p className="font-medium">자동 알림</p>
                        <p className="text-sm text-muted-foreground">
                          위험 감지 시 자동으로 알림을 발송합니다
                        </p>
                      </div>
                      <Switch
                        checked={aiSettings.autoAlert}
                        onCheckedChange={(checked) =>
                          setAiSettings({ ...aiSettings, autoAlert: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("AI")} disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 설정 */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>보안 설정</CardTitle>
                <CardDescription>시스템 보안을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>세션 만료 시간 (분)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>최대 로그인 시도 횟수</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>비밀번호 만료 기간 (일)</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="space-y-1">
                    <p className="font-medium">2단계 인증</p>
                    <p className="text-sm text-muted-foreground">
                      로그인 시 추가 인증을 요구합니다
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>IP 화이트리스트</Label>
                  <Textarea
                    placeholder="허용할 IP 주소를 입력하세요 (줄바꿈으로 구분)"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })
                    }
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 모든 IP에서 접근 가능합니다
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("보안")} disabled={isSaving}>
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
