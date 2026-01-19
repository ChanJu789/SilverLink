import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Heart, 
  Fingerprint, 
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  LogIn
} from "lucide-react";
import { useWebAuthn, isWebAuthnSupported } from "@/hooks/useWebAuthn";

const SeniorLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationName, setRegistrationName] = useState("");
  
  const {
    isSupported,
    isPlatformAvailable,
    isRegistering,
    isAuthenticating,
    error,
    register,
    authenticate,
    checkPlatformAuthenticator,
  } = useWebAuthn();

  useEffect(() => {
    checkPlatformAuthenticator();
  }, [checkPlatformAuthenticator]);

  // 지문 인증 로그인
  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      toast.success("지문 인증 성공!", {
        description: "어서오세요. 마음돌봄 서비스입니다.",
      });
      navigate("/senior");
    } else if (error) {
      toast.error(error);
    }
  };

  // 지문 등록
  const handleBiometricRegistration = async () => {
    if (!registrationName.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    const credential = await register(registrationName);
    if (credential) {
      toast.success("지문 등록 완료!", {
        description: "이제 지문으로 로그인할 수 있습니다.",
      });
      setShowRegistrationDialog(false);
      setRegistrationName("");
      setIsRegistrationMode(false);
    } else if (error) {
      toast.error(error);
    }
  };

  // 휴대폰 인증 로그인 (기존 방식)
  const handlePhoneLogin = () => {
    if (!phoneNumber.trim()) {
      toast.error("휴대폰 번호를 입력해주세요.");
      return;
    }
    toast.success("인증번호가 발송되었습니다.");
  };

  const webAuthnSupport = isWebAuthnSupported();
  const showBiometric = webAuthnSupport && isPlatformAvailable;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">마음돌봄</h1>
        <p className="text-lg text-muted-foreground mt-2">국가 복지 서비스</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {isRegistrationMode ? "생체 인증 등록" : "어르신 로그인"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isRegistrationMode 
                ? "지문을 등록하시면 더 쉽게 로그인할 수 있어요" 
                : "간편하게 로그인하세요"}
            </p>
          </div>

          {/* Biometric Login Card */}
          {showBiometric && !isRegistrationMode && (
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Fingerprint className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl">지문으로 로그인</CardTitle>
                <CardDescription className="text-base">
                  등록된 지문으로 빠르게 로그인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleBiometricLogin}
                  className="w-full h-16 text-xl font-bold rounded-xl"
                  size="lg"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      인증 중...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-6 h-6 mr-3" />
                      지문 인증하기
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full h-12 text-lg"
                  onClick={() => setShowRegistrationDialog(true)}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  새 지문 등록하기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Registration Mode */}
          {isRegistrationMode && showBiometric && (
            <Card className="shadow-lg border-2 border-success/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2">
                  <Shield className="w-12 h-12 text-success" />
                </div>
                <CardTitle className="text-xl">지문 등록</CardTitle>
                <CardDescription className="text-base">
                  이름을 입력하고 지문을 등록하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regName" className="text-lg">이름</Label>
                  <Input
                    id="regName"
                    placeholder="이름을 입력하세요"
                    value={registrationName}
                    onChange={(e) => setRegistrationName(e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                
                <Button
                  onClick={handleBiometricRegistration}
                  className="w-full h-16 text-xl font-bold rounded-xl bg-success hover:bg-success/90"
                  size="lg"
                  disabled={isRegistering || !registrationName.trim()}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-6 h-6 mr-3" />
                      지문 등록하기
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-lg"
                  onClick={() => setIsRegistrationMode(false)}
                >
                  뒤로 가기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* WebAuthn Not Supported Warning */}
          {!showBiometric && (
            <Card className="shadow-lg border-2 border-warning/20">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  이 기기에서는 지문 인증을 사용할 수 없어요
                </p>
                <p className="text-muted-foreground">
                  아래 휴대폰 번호로 로그인해주세요
                </p>
              </CardContent>
            </Card>
          )}

          {/* Divider */}
          {showBiometric && !isRegistrationMode && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground text-base">
                  또는
                </span>
              </div>
            </div>
          )}

          {/* Phone Login Card */}
          {!isRegistrationMode && (
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">휴대폰 인증</CardTitle>
                    <CardDescription className="text-base">
                      휴대폰 번호로 로그인하세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-lg">휴대폰 번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                
                <Button
                  onClick={handlePhoneLogin}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium rounded-xl"
                  size="lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  인증번호 받기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Back to Main Login */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-lg text-muted-foreground"
              onClick={() => navigate("/login")}
            >
              다른 계정으로 로그인
            </Button>
          </div>
        </div>
      </main>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">지문 등록</DialogTitle>
            <DialogDescription className="text-lg">
              이름을 입력하고 지문을 등록하세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialogName" className="text-lg">이름</Label>
              <Input
                id="dialogName"
                placeholder="이름을 입력하세요"
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                className="h-14 text-lg"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 sm:flex-col">
            <Button
              onClick={handleBiometricRegistration}
              className="w-full h-16 text-lg font-bold"
              disabled={isRegistering || !registrationName.trim()}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Fingerprint className="w-6 h-6 mr-3" />
                  지문 등록하기
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegistrationDialog(false)}
              className="w-full h-14 text-lg"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Info */}
      {showBiometric && !isRegistrationMode && (
        <footer className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">이 기기는 생체 인증을 지원합니다</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SeniorLogin;
