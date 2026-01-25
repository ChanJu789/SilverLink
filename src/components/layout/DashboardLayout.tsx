import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Home,
  Phone,
  BarChart3,
  MessageSquare,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Settings,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "guardian" | "counselor" | "admin";
  userName: string;
  userAvatar?: string;
  navItems: NavItem[];
}

const DashboardLayout = ({
  children,
  role,
  userName,
  userAvatar,
  navItems
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const roleConfig = {
    guardian: {
      title: "보호자",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    counselor: {
      title: "상담사",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    admin: {
      title: "관리자",
      color: "text-info",
      bgColor: "bg-info/10",
    },
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-sidebar-foreground">마음돌봄</h1>
                  <p className="text-xs text-sidebar-foreground/60">국가 복지 서비스</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.title}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/30">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">{userName}</p>
                <p className={cn("text-xs", roleConfig[role].color)}>
                  {roleConfig[role].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>알림</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    새로운 알림이 없습니다
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    내 프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
