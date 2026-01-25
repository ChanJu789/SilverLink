import apiClient from './index';
import { MyProfileResponse, UpdateMyProfileRequest } from '@/types/api';

/**
 * 내 프로필 조회
 * GET /api/users/me
 */
export const getMyProfile = async (): Promise<MyProfileResponse> => {
    const response = await apiClient.get<MyProfileResponse>('/api/users/me');
    return response.data;
};

/**
 * 내 프로필 수정
 * PATCH /api/users/me
 */
export const updateMyProfile = async (data: UpdateMyProfileRequest): Promise<MyProfileResponse> => {
    const response = await apiClient.patch<MyProfileResponse>('/api/users/me', data);
    return response.data;
};

/**
 * 사용자 상태 변경 (관리자 전용)
 * PATCH /api/users/{userId}/status
 */
export const changeUserStatus = async (userId: number, status: string): Promise<void> => {
    await apiClient.patch(`/api/users/${userId}/status`, { status });
};

/**
 * 비밀번호 초기화 (관리자 전용)
 * POST /api/admin/users/{userId}/reset-password
 * @returns 임시 비밀번호
 */
export const resetPassword = async (userId: number): Promise<{ tempPassword: string }> => {
    const response = await apiClient.post<{ tempPassword: string }>(`/api/admin/users/${userId}/reset-password`);
    return response.data;
};

/**
 * 사용자 삭제 (관리자 전용)
 * DELETE /api/admin/users/{userId}
 */
export const deleteUser = async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${userId}`);
};

export default {
    getMyProfile,
    updateMyProfile,
    changeUserStatus,
    resetPassword,
    deleteUser,
};

