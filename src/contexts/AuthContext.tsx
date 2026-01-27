import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { logout as apiLogout, refresh } from '@/api/auth';
import { getMyProfile } from '@/api/users';
import { setAccessToken } from '@/api/index';

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

    // 초기화: 쿠키를 통한 세션 자동 복원 (새로고침 시)
    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Refresh Token으로 Access Token 재발급 시도 (쿠키 사용)
                await refresh();

                // 2. 사용자 프로필 정보 가져오기
                const userProfile = await getMyProfile();

                // 3. 상태 업데이트
                setUser(userProfile);
                setIsLoggedIn(true);
            } catch (error) {
                // 세션 복원 실패 (로그아웃 상태로 시작)
                // Session restoration failed (user not logged in)
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, []);

    // 로그인 처리 (메모리에만 저장)
    const login = useCallback((accessToken: string, userData: User) => {
        setAccessToken(accessToken); // API Client 헤더 설정
        // localStorage.setItem... 삭제 (보안 강화)
        setUser(userData);
        setIsLoggedIn(true);
    }, []);

    // 로그아웃 처리
    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            setAccessToken(null); // 메모리 토큰 삭제
            setUser(null);
            setIsLoggedIn(false);
            // localStorage 정리 (이전 버전 잔재가 있다면 삭제)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
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
