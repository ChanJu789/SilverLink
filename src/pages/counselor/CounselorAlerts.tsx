import { useState } from "react";
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  Bell
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { counselorNavItems } from "@/config/counselorNavItems";
import { useAuth } from "@/contexts/AuthContext";

const alerts = [
  { 
    id: 1, 
    seniorName: "박영희", 
    age: 82,
    type: "건강 위험", 
    message: "통화 중 호흡 곤란 증상 언급. 평소보다 말이 느리고 기침이 잦음.", 
    time: "10분 전",
    severity: "critical",
    guardian: "박민수",
    guardianPhone: "010-2345-6789",
    status: "pending"
  },
  { 
    id: 2, 
    seniorName: "이철수", 
    age: 75,
    type: "정서 위험", 
    message: "우울감 호소, 외로움 표현. '살기 힘들다'는 표현 사용.", 
    time: "30분 전",
    severity: "high",
    guardian: "이영희",
    guardianPhone: "010-3456-7890",
    status: "pending"
  },
  { 
    id: 3, 
    seniorName: "정미영", 
    age: 80,
    type: "미응답", 
    message: "3회 연속 통화 미응답. 마지막 통화: 어제 오후 2시", 
    time: "1시간 전",
    severity: "medium",
    guardian: "정철수",
    guardianPhone: "010-4567-8901",
    status: "resolved"
  },
];

const SeverityBadge = ({ severity }: { severity: string }) => {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive" className="animate-pulse">긴급</Badge>;
    case "high":
      return <Badge className="bg-warning text-warning-foreground">주의</Badge>;
    case "medium":
      return <Badge variant="outline">보통</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
};

const CounselorAlerts = () => {
  const { user } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  const pendingAlerts = alerts.filter(a => a.status === "pending");

  return (
    <DashboardLayout
      role="counselor"
      userName={user?.name || "상담사"}
      navItems={counselorNavItems}
    >
      {/* Emergency Fullscreen Alert */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-lg bg-destructive text-destructive-foreground border-destructive">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive-foreground/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-destructive-foreground text-xl">긴급 상황 발생</DialogTitle>
                <DialogDescription className="text-destructive-foreground/80">즉각적인 대응이 필요합니다</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-destructive-foreground/10">
              <p className="font-semibold text-lg">박영희 어르신 (82세)</p>
              <p className="mt-2">통화 중 호흡 곤란 증상 언급. 평소보다 말이 느리고 기침이 잦음.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="bg-destructive-foreground text-destructive">
                <PhoneCall className="w-4 h-4 mr-2" />
                어르신 연락
              </Button>
              <Button variant="secondary" className="bg-destructive-foreground text-destructive">
                <PhoneCall className="w-4 h-4 mr-2" />
                보호자 연락
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-destructive-foreground/50 text-destructive-foreground hover:bg-destructive-foreground/10" onClick={() => setShowEmergencyDialog(false)}>
              확인 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">긴급 알림</h1>
            <p className="text-muted-foreground mt-1">어르신 위험 상황을 모니터링합니다</p>
          </div>
          {pendingAlerts.length > 0 && (
            <Button variant="destructive" onClick={() => setShowEmergencyDialog(true)}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              긴급 알림 {pendingAlerts.length}건
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card border-0 border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-destructive">{pendingAlerts.filter(a => a.severity === "critical").length}</p>
              <p className="text-sm text-muted-foreground">긴급</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 border-l-4 border-l-warning">
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-warning">{pendingAlerts.filter(a => a.severity === "high").length}</p>
              <p className="text-sm text-muted-foreground">주의</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 border-l-4 border-l-success">
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-success">{alerts.filter(a => a.status === "resolved").length}</p>
              <p className="text-sm text-muted-foreground">처리 완료</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">알림 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-5 rounded-xl border-2 ${
                  alert.severity === "critical" ? "border-destructive bg-destructive/5" :
                  alert.severity === "high" ? "border-warning bg-warning/5" :
                  "border-border bg-muted/30"
                } ${alert.status === "resolved" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={`${
                        alert.severity === "critical" ? "bg-destructive text-destructive-foreground" :
                        alert.severity === "high" ? "bg-warning text-warning-foreground" :
                        "bg-secondary"
                      }`}>
                        {alert.seniorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{alert.seniorName}</span>
                        <span className="text-muted-foreground">({alert.age}세)</span>
                        <SeverityBadge severity={alert.severity} />
                        <Badge variant="outline">{alert.type}</Badge>
                        {alert.status === "resolved" && <Badge className="bg-success/10 text-success border-0">처리완료</Badge>}
                      </div>
                      <p className="text-foreground mb-2">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">보호자: {alert.guardian} ({alert.guardianPhone})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-3">{alert.time}</p>
                    {alert.status !== "resolved" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <PhoneCall className="w-3 h-3 mr-1" />
                          연락
                        </Button>
                        <Button size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          처리
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CounselorAlerts;
