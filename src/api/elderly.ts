import apiClient from './index';
import { ElderlySummaryResponse, HealthInfoResponse } from '@/types/api';

/**
 * 어르신 요약 정보 조회
 * GET /api/elderly/{elderlyUserId}/summary
 */
export const getSummary = async (elderlyUserId: number): Promise<ElderlySummaryResponse> => {
    const response = await apiClient.get<ElderlySummaryResponse>(
        `/api/elderly/${elderlyUserId}/summary`
    );
    return response.data;
};

/**
 * 어르신 건강 정보 조회 (민감정보)
 * GET /api/elderly/{elderlyUserId}/health
 */
export const getHealthInfo = async (elderlyUserId: number): Promise<HealthInfoResponse> => {
    const response = await apiClient.get<HealthInfoResponse>(
        `/api/elderly/${elderlyUserId}/health`
    );
    return response.data;
};

export default {
    getSummary,
    getHealthInfo,
};
