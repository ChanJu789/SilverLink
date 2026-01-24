import apiClient from './index';
import { NoticeResponse, PageResponse } from '@/types/api';

interface NoticeListParams {
    keyword?: string;
    page?: number;
    size?: number;
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

export default {
    getNotices,
    getPopups,
    getNoticeDetail,
    markAsRead,
};
