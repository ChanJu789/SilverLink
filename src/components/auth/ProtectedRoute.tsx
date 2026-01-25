import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

type UserRole = "ADMIN" | "COUNSELOR" | "GUARDIAN" | "ELDERLY";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

/**
 * 권한 기반 라우트 보호 컴포넌트
 * - 로그인 여부 확인
 * - 허용된 역할 확인
 * - 미인증 시 로그인 페이지로 리다이렉트
 * - 권한 부족 시 홈 또는 지정된 페이지로 리다이렉트
 */
const ProtectedRoute = ({
    children,
    allowedRoles,
    redirectTo = "/login",
}: ProtectedRouteProps) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        try {
            const token = localStorage.getItem("accessToken");
            const userStr = localStorage.getItem("user");

            // 토큰이 없으면 미인증
            if (!token) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // 역할 제한이 없으면 로그인만 확인
            if (!allowedRoles || allowedRoles.length === 0) {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            // 역할 확인
            if (userStr) {
                const user = JSON.parse(userStr);
                const userRole = user.role as UserRole;

                if (allowedRoles.includes(userRole)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setIsAuthorized(false);
        } finally {
            setIsLoading(false);
        }
    };

    // 로딩 중
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">권한을 확인하는 중...</p>
                </div>
            </div>
        );
    }

    // 미인증 시 로그인 페이지로
    if (!isAuthorized) {
        const token = localStorage.getItem("accessToken");

        // 토큰이 없으면 로그인으로
        if (!token) {
            return (
                <Navigate
                    to={redirectTo}
                    state={{ from: location.pathname }}
                    replace
                />
            );
        }

        // 토큰은 있지만 권한이 없으면 홈으로
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

/**
 * 역할별 홈 페이지 경로 반환
 */
export const getRoleHomePath = (role: UserRole): string => {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "COUNSELOR":
            return "/counselor";
        case "GUARDIAN":
            return "/guardian";
        case "ELDERLY":
            return "/senior";
        default:
            return "/";
    }
};

/**
 * 로그인 상태 확인 훅
 */
export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{
        id: number;
        role: UserRole;
        name: string;
    } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
                setUser(null);
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
    };

    return { isLoggedIn, user, logout };
};

export default ProtectedRoute;
