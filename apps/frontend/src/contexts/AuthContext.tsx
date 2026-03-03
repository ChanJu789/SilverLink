import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient, { setAccessToken } from '@/api/index';
import { logout as apiLogout, refresh } from '@/api/auth';
import { getMyProfile } from '@/api/users';


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
                // 주의: 실패 시 리다이렉트 루프를 방지하기 위해 글로벌 에러 핸들러 스킵
                // @ts-ignore
                const response = await apiClient.post('/api/auth/refresh', null, { _skipGlobalErrorHandler: true });
                const { accessToken } = response.data;
                setAccessToken(accessToken);

                // 2. 사용자 프로필 정보 가져오기
                // @ts-ignore
                const profileResponse = await apiClient.get('/api/users/me', { _skipGlobalErrorHandler: true });
                const userProfile = profileResponse.data;

                // 3. 상태 업데이트
                setUser(userProfile);
                setIsLoggedIn(true);
            } catch (error) {
                // 쿠키 인증 실패 시 localStorage 확인 (백업)
                const storedToken = localStorage.getItem('accessToken');

                if (storedToken) {
                    try {
                        // 저장된 토큰이 유효한지 검증 (프로필 조회 시도)
                        setAccessToken(storedToken);

                        // 검증 시에는 글로벌 인터셉터(자동 리다이렉트)를 끄고 진행
                        // @ts-ignore
                        const response = await apiClient.get('/api/users/me', { _skipGlobalErrorHandler: true });
                        const userProfile = response.data;

                        setUser(userProfile);
                        setIsLoggedIn(true);
                    } catch (e) {
                        // 토큰이 만료되었거나 유효하지 않음 -> 초기화
                        console.warn("Stored session is invalid:", e);
                        setAccessToken(null);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
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
