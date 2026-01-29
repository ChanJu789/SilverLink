import apiClient from './index';

/**
 * Passkey/WebAuthn 인증 API 모듈
 * 백엔드: PasskeyController (/api/auth/passkey)
 */

export interface StartRegResponse {
    requestId: string;
    creationOptionsJson: string;
}

export interface StartAuthResponse {
    requsetId: string;  // Note: typo in backend ('requsetId' instead of 'requestId')
    assertionRequestJson: string;
}

export interface TokenResponse {
    accessToken: string;
    expiresIn: number;
    role: string;
}

/**
 * Passkey 등록 시작 (옵션 가져오기)
 */
export const startPasskeyRegistration = async (userId: number): Promise<StartRegResponse> => {
    const response = await apiClient.post<StartRegResponse>('/api/auth/passkey/register/options', {
        userId,
    });
    return response.data;
};

/**
 * Passkey 등록 완료 (브라우저 인증 후 검증)
 */
export const finishPasskeyRegistration = async (
    userId: number,
    requestId: string,
    credentialJson: string
): Promise<void> => {
    await apiClient.post('/api/auth/passkey/register/verify', {
        userId,
        requestId,
        credentialJson,
    });
};

/**
 * Passkey 로그인 시작 (옵션 가져오기)
 */
export const startPasskeyLogin = async (loginId?: string): Promise<StartAuthResponse> => {
    const response = await apiClient.post<StartAuthResponse>('/api/auth/passkey/login/options', {
        loginId: loginId || null,
    });
    return response.data;
};

/**
 * Passkey 로그인 완료 (브라우저 인증 후 검증 및 토큰 발급)
 */
export const finishPasskeyLogin = async (
    requestId: string,
    credentialJson: string
): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/auth/passkey/login/verify', {
        requestId,
        credentialJson,
    });
    return response.data;
};

export default {
    startPasskeyRegistration,
    finishPasskeyRegistration,
    startPasskeyLogin,
    finishPasskeyLogin,
};
