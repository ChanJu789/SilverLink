import apiClient from './index';
import { NoticeResponse, PageResponse } from '@/types/api';

interface NoticeListParams {
    keyword?: string;
    page?: number;
    size?: number;
}

// 공지사항 생성/수정 요청 타입 (백엔드 NoticeRequest DTO와 일치)
export interface NoticeRequest {
    title: string;
    content: string;
    category: 'NOTICE' | 'EVENT' | 'NEWS' | 'SYSTEM';
    targetMode: 'ALL' | 'ROLE_SET';
    targetRoles?: ('ADMIN' | 'COUNSELOR' | 'GUARDIAN' | 'ELDERLY')[];
    isPriority?: boolean;
    isPopup?: boolean;
    popupStartAt?: string;
    popupEndAt?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
}


/**
 * 공지사항 목록 조회
 * GET /api/notices
 */
export const getNotices = async (params?: NoticeListParams): Promise<PageResponse<NoticeResponse>> => {
    const response = await apiClient.get<PageResponse<NoticeResponse>>('/api/notices', { params });
    return response.data;
};

/**
 * 팝업 공지사항 조회
 * GET /api/notices/popups
 */
export const getPopups = async (): Promise<NoticeResponse[]> => {
    const response = await apiClient.get<NoticeResponse[]>('/api/notices/popups');
    return response.data;
};

/**
 * 공지사항 상세 조회
 * GET /api/notices/{id}
 */
export const getNoticeDetail = async (id: number): Promise<NoticeResponse> => {
    const response = await apiClient.get<NoticeResponse>(`/api/notices/${id}`);
    return response.data;
};

/**
 * 공지사항 읽음 처리
 * POST /api/notices/{id}/read
 */
export const markAsRead = async (id: number): Promise<void> => {
    await apiClient.post(`/api/notices/${id}/read`);
};

// ==================
// 관리자용 API
// ==================

/**
 * 관리자: 공지사항 목록 조회
 * GET /api/admin/notices
 */
export const getAdminNotices = async (params?: NoticeListParams): Promise<PageResponse<NoticeResponse>> => {
    const response = await apiClient.get<PageResponse<NoticeResponse>>('/api/admin/notices', { params });
    return response.data;
};

/**
 * 관리자: 공지사항 생성
 * POST /api/admin/notices
 */
export const createNotice = async (request: NoticeRequest): Promise<number> => {
    const response = await apiClient.post<number>('/api/admin/notices', request);
    return response.data;
};

/**
 * 관리자: 공지사항 상세 조회
 * GET /api/admin/notices/{id}
 */
export const getAdminNoticeDetail = async (id: number): Promise<NoticeResponse> => {
    const response = await apiClient.get<NoticeResponse>(`/api/admin/notices/${id}`);
    return response.data;
};

/**
 * 관리자: 공지사항 삭제
 * DELETE /api/admin/notices/{id}
 */
export const deleteNotice = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/notices/${id}`);
};

/**
 * 관리자: 공지사항 수정
 * PUT /api/admin/notices/{id}
 */
export const updateNotice = async (id: number, request: NoticeRequest): Promise<void> => {
    await apiClient.put(`/api/admin/notices/${id}`, request);
};

/**
 * 공지사항 필독 확인
 * POST /api/notices/{id}/confirm
 */
export const confirmNotice = async (id: number): Promise<void> => {
    await apiClient.post(`/api/notices/${id}/confirm`);
};

/**
 * 관리자: 공지사항 확인자 목록 조회
 * GET /api/notices/{id}/confirm-list
 */
export interface NoticeConfirmUser {
    userId: number;
    name: string;
    confirmedAt: string;
}

export const getConfirmList = async (id: number): Promise<NoticeConfirmUser[]> => {
    const response = await apiClient.get<NoticeConfirmUser[]>(`/api/notices/${id}/confirm-list`);
    return response.data;
};

/**
 * 관리자: 공지사항 복구
 * POST /api/admin/notices/{id}/restore
 */
export const restoreNotice = async (id: number): Promise<void> => {
    await apiClient.post(`/api/admin/notices/${id}/restore`);
};

/**
 * 관리자: 공지사항 상태 변경
 * PATCH /api/admin/notices/{id}/status
 */
export const changeNoticeStatus = async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/api/admin/notices/${id}/status`, null, {
        params: { status }
    });
};

/**
 * 관리자: 공지사항 일괄 상태 변경
 * PATCH /api/admin/notices/bulk-status
 */
export const bulkChangeNoticeStatus = async (ids: number[], status: string): Promise<void> => {
    await apiClient.patch('/api/admin/notices/bulk-status', null, {
        params: { ids: ids.join(','), status }
    });
};

/**
 * 테스트 API
 * GET /api/admin/notices/test
 */
export const testNoticeApi = async (): Promise<string> => {
    const response = await apiClient.get<string>('/api/admin/notices/test');
    return response.data;
};

/**
 * 관리자: 공지사항 분류 변경
 * PATCH /api/admin/notices/{id}/category
 */
export const changeNoticeCategory = async (id: number, category: string, isPriority: boolean = false): Promise<void> => {
    await apiClient.patch(`/api/admin/notices/${id}/category`, null, {
        params: { category, isPriority }
    });
};

/**
 * 관리자: 공지사항 대상 변경
 * PATCH /api/admin/notices/{id}/target
 */
export const changeNoticeTarget = async (id: number, targetMode: string, targetRoles?: string[]): Promise<void> => {
    const params: any = { targetMode };
    if (targetRoles && targetRoles.length > 0) {
        params.targetRoles = targetRoles;
    }
    
    await apiClient.patch(`/api/admin/notices/${id}/target`, null, {
        params
    });
};

export default {
    getNotices,
    getPopups,
    getNoticeDetail,
    markAsRead,
    confirmNotice,
    // Admin APIs
    getAdminNotices,
    createNotice,
    getAdminNoticeDetail,
    deleteNotice,
    updateNotice,
    getConfirmList,
    restoreNotice,
    changeNoticeStatus,
    changeNoticeCategory,
    changeNoticeTarget,
    bulkChangeNoticeStatus,
    testNoticeApi,
};

