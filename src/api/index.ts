import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { showGlobalDuplicateLoginDialog } from '@/contexts/DuplicateLoginContext';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
});

// 토큰 저장소
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 만료 시 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorData = error.response?.data as { error?: string; message?: string } | undefined;
    const errorCode = errorData?.error;

    // 글로벌 에러 핸들링 스킵 플래그 확인
    // @ts-ignore
    if (error.config?._skipGlobalErrorHandler) {
      return Promise.reject(error);
    }

    // 세션 관련 오류 → 로그인 페이지로 리다이렉트
    const sessionErrors = ['SESSION_EXPIRED', 'REFRESH_REUSED', 'INVALID_TOKEN', 'TOKEN_EXPIRED'];
    if (sessionErrors.includes(errorCode || '')) {
      setAccessToken(null);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 중복 로그인 에러 처리 - 이미 다른 곳에서 로그인됨
    if (errorCode === 'ALREADY_LOGGED_IN') {
      showGlobalDuplicateLoginDialog();
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않았다면 토큰 갱신 시도
    // 단, 로그인 관련 API는 제외 (로그인 실패는 그냥 실패로 처리해야 함)
    const isLoginRequest = originalRequest && (
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/api/auth/refresh')
    );

    if (status === 401 && !isLoginRequest && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // 토큰 갱신 요청
        const response = await apiClient.post('/api/auth/refresh');
        const { accessToken: newToken } = response.data;

        setAccessToken(newToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
