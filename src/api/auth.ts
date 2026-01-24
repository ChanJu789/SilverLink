import apiClient, { setAccessToken, getAccessToken } from './index';
import { LoginRequest, TokenResponse, RefreshResponse } from '@/types/api';

/**
 * 로그인 API
 * POST /api/auth/login
 */
export const signup = async (data: any): Promise<number> => {
    const response = await apiClient.post<number>('/api/auth/signup', data);
    return response.data;
};

export const login = async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', credentials);

    // 토큰 저장
    setAccessToken(response.data.accessToken);

    return response.data;
};

/**
 * 토큰 갱신 API
 * POST /api/auth/refresh
 */
export const refresh = async (): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>('/api/auth/refresh');

    // 새 토큰 저장
    setAccessToken(response.data.accessToken);

    return response.data;
};

/**
 * 로그아웃 API
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
    try {
        await apiClient.post('/api/auth/logout');
    } finally {
        // 토큰 삭제
        setAccessToken(null);
    }
};

/**
 * 현재 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
    return getAccessToken() !== null;
};

export default {
    login,
    refresh,
    logout,
    isAuthenticated,
};
