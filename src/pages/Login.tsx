import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Shield,
  Users,
  UserCog,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { login } from "@/api/auth";

type UserRole = "guardian" | "counselor" | "admin" | "senior";

interface RoleConfig {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roles: RoleConfig[] = [
  {
    id: "guardian",
    title: "보호자",
    description: "부모님의 안부와 상태를 확인하세요",
    icon: <Heart className="w-6 h-6" />,
    color: "bg-accent/10 text-accent border-accent/20",
  },
  {
    id: "counselor",
    title: "상담사",
    description: "담당 어르신을 관리하고 상담하세요",
    icon: <Users className="w-6 h-6" />,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "admin",
    title: "관리자",
    description: "시스템 전체를 관리합니다",
    icon: <UserCog className="w-6 h-6" />,
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: "senior",
    title: "어르신",
    description: "방문등록 및 서비스 이용",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-success/10 text-success border-success/20",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("guardian");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    phone: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 실제 API 로그인 호출
      const response = await login({
        loginId: formData.loginId,
        password: formData.password,
      });

      // 서버에서 받은 실제 role로만 네비게이션 (보안 강화)
      const serverRole = response.role?.toLowerCase();

      if (!serverRole) {
        toast.error("로그인 실패", {
          description: "사용자 역할을 확인할 수 없습니다.",
        });
        return;
      }

      // 역할별 제목 매핑
      const roleNames: Record<string, string> = {
        guardian: "보호자",
        counselor: "상담사",
        admin: "관리자",
        elderly: "어르신",
      };

      toast.success("로그인 성공", {
        description: `${roleNames[serverRole] || serverRole}으로 로그인되었습니다.`,
      });

      // 서버에서 받은 실제 role 기반으로만 네비게이션
      if (serverRole === "guardian") {
        navigate("/guardian");
      } else if (serverRole === "counselor") {
        navigate("/counselor");
      } else if (serverRole === "admin") {
        navigate("/admin");
      } else if (serverRole === "elderly") {
        navigate("/senior");
      } else {
        toast.error("알 수 없는 역할", {
          description: `역할 '${serverRole}'은(는) 지원되지 않습니다.`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "로그인에 실패했습니다.";
      toast.error("로그인 실패", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">마음돌봄</h1>
            <p className="text-xs text-muted-foreground">국가 복지 서비스</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              안녕하세요, 반갑습니다
            </h2>
            <p className="text-muted-foreground">
              로그인하여 서비스를 이용해주세요
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  if (role.id === "senior") {
                    // 어르신은 바로 전용 로그인 페이지로 이동
                    navigate("/senior/login");
                  } else {
                    setSelectedRole(role.id);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedRole === role.id
                  ? `${role.color} border-current shadow-soft`
                  : "bg-card border-border hover:border-muted-foreground/30"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role.id ? role.color : "bg-muted"
                      }`}
                  >
                    {role.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{role.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <Card className="shadow-elevated border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {roles.find((r) => r.id === selectedRole)?.title} 로그인
              </CardTitle>
              <CardDescription>
                계정 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="id" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="id" className="gap-2">
                    <UserCog className="w-4 h-4" />
                    아이디
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <Phone className="w-4 h-4" />
                    휴대폰
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleLogin}>
                  <TabsContent value="id" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="loginId">아이디</Label>
                      <Input
                        id="loginId"
                        type="text"
                        placeholder="아이디를 입력하세요"
                        value={formData.loginId}
                        onChange={(e) =>
                          setFormData({ ...formData, loginId: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="비밀번호를 입력하세요"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="phone">휴대폰 번호</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    <Button type="button" variant="outline" className="w-full">
                      인증번호 받기
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="verify">인증번호</Label>
                      <Input
                        id="verify"
                        type="text"
                        placeholder="인증번호 6자리"
                      />
                    </div>
                  </TabsContent>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    variant="hero"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        로그인
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>

              {/* Links */}
              <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  아이디 찾기
                </button>
                <span className="text-border">|</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  비밀번호 찾기
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                회원가입은 관리자를 통해서만 가능합니다
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            로그인 시 <span className="text-primary cursor-pointer hover:underline">이용약관</span> 및{" "}
            <span className="text-primary cursor-pointer hover:underline">개인정보처리방침</span>에 동의합니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
