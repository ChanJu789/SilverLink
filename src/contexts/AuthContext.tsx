import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { logout as apiLogout } from '@/api/auth';

type UserRole = 'ADMIN' | 'COUNSELOR' | 'GUARDIAN' | 'ELDERLY';

interface User {
    id: number;
    role: UserRole;
    name: string;
    loginId?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    role: UserRole | null;
    login: (accessToken: string, user: User) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 초기화: localStorage에서 상태 복원
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr) as User;
                setUser(userData);
                setIsLoggedIn(true);
            } catch {
                // 파싱 오류 시 정리
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
            }
        }
        setIsLoading(false);
    }, []);

    // 로그인 처리
    const login = useCallback((accessToken: string, userData: User) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role);
        setUser(userData);
        setIsLoggedIn(true);
    }, []);

    // 로그아웃 처리
    const logout = useCallback(async () => {
        try {
            // 서버에 로그아웃 요청
            await apiLogout();
        } catch (error) {
            console.error('Logout API error:', error);
            // 서버 에러가 나도 클라이언트 상태는 정리
        } finally {
            // 로컬 상태 정리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            setUser(null);
            setIsLoggedIn(false);
        }
    }, []);

    const value: AuthContextType = {
        isLoggedIn,
        user,
        role: user?.role ?? null,
        login,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * 인증 상태를 사용하는 훅
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * 역할별 홈 페이지 경로 반환
 */
export const getRoleHomePath = (role: UserRole | null): string => {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'COUNSELOR':
            return '/counselor';
        case 'GUARDIAN':
            return '/guardian';
        case 'ELDERLY':
            return '/senior';
        default:
            return '/';
    }
};

export default AuthContext;
