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

    // 초기화: 쿠키 또는 localStorage를 통한 세션 복원
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
                // 쿠키 인증 실패 시 localStorage 확인 (백업)
                const storedToken = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    try {
                        setAccessToken(storedToken);
                        setUser(JSON.parse(storedUser));
                        setIsLoggedIn(true);
                    } catch (e) {
                        // 데이터 파싱 실패 등
                        localStorage.clear();
                        setUser(null);
                        setIsLoggedIn(false);
                    }
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, []);

    // 로그인 처리
    const login = useCallback((accessToken: string, userData: User) => {
        setAccessToken(accessToken); // API Client 헤더 설정

        // Session Persistence (localStorage)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

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

            // localStorage 정리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
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
