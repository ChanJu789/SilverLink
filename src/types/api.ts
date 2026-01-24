// =====================
// 공통 타입 정의
// =====================

// API 공통 응답 형식
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

// =====================
// 인증 관련 타입
// =====================
export interface SignupRequest {
    loginId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
}

export interface LoginRequest {
    loginId: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    ttl: number;
    role: string;
}

export interface RefreshResponse {
    accessToken: string;
    ttl: number;
}

// =====================
// 사용자 관련 타입
// =====================
export interface MyProfileResponse {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: 'ADMIN' | 'COUNSELOR' | 'GUARDIAN' | 'ELDERLY';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: string;
}

export interface UpdateMyProfileRequest {
    name?: string;
    phone?: string;
}

// =====================
// 관리자 관련 타입
// =====================
export interface AdminResponse {
    userId: number;
    email: string;
    name: string;
    level: 'NATIONAL' | 'PROVINCIAL' | 'CITY' | 'DISTRICT';
    admCode: number;
    admName: string;
    createdAt: string;
}

export interface AdminCreateRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
    level: 'NATIONAL' | 'PROVINCIAL' | 'CITY' | 'DISTRICT';
    admCode: number;
}

export interface AdminUpdateRequest {
    name?: string;
    phone?: string;
    level?: 'NATIONAL' | 'PROVINCIAL' | 'CITY' | 'DISTRICT';
    admCode?: number;
}

// =====================
// 상담사 관련 타입
// =====================
export interface CounselorResponse {
    id: number;
    userId: number;
    email: string;
    name: string;
    phone: string;
    status: string;
    assignedElderlyCount: number;
    createdAt: string;
}

export interface CounselorRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
}

// =====================
// 어르신 관련 타입
// =====================
export interface ElderlySummaryResponse {
    elderlyId: number;
    name: string;
    age: number;
    gender: string;
    address: string;
    phone: string;
    lastCallDate?: string;
    counselorName?: string;
    guardianName?: string;
}

export interface HealthInfoResponse {
    elderlyId: number;
    bloodPressure?: string;
    bloodSugar?: string;
    medications: string[];
    diseases: string[];
    notes?: string;
}

// =====================
// 보호자 관련 타입
// =====================
export interface GuardianResponse {
    id: number;
    userId: number;
    email: string;
    name: string;
    phone: string;
    createdAt: string;
}

export interface GuardianRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
}

export interface GuardianElderlyResponse {
    guardianId: number;
    elderlyList: {
        elderlyId: number;
        name: string;
        relationType: string;
        age: number;
    }[];
}

// =====================
// 공지사항 관련 타입
// =====================
export interface NoticeResponse {
    id: number;
    title: string;
    content: string;
    category: string;
    isImportant: boolean;
    isPopup: boolean;
    targetRoles: string[];
    createdAt: string;
    viewCount: number;
    isRead: boolean;
}

// =====================
// FAQ 관련 타입
// =====================
export interface FaqResponse {
    id: number;
    category: string;
    question: string;
    answer: string;
    orderIndex: number;
}

// =====================
// 문의 관련 타입
// =====================
export interface InquiryResponse {
    id: number;
    title: string;
    content: string;
    status: 'PENDING' | 'ANSWERED';
    answer?: string;
    answeredAt?: string;
    createdAt: string;
    userName: string;
}

export interface InquiryRequest {
    title?: string;
    content: string;
}

// =====================
// 배정 관련 타입
// =====================
export interface AssignmentResponse {
    id: number;
    counselorId: number;
    counselorName: string;
    elderlyId: number;
    elderlyName: string;
    assignedAt: string;
}

export interface AssignmentRequest {
    counselorId: number;
    elderlyId: number;
}

// =====================
// 복지 서비스 관련 타입
// =====================
export interface WelfareListResponse {
    id: number;
    serviceName: string;
    category: string;
    targetGroup: string;
    region: string;
    summary: string;
}

export interface WelfareDetailResponse extends WelfareListResponse {
    content: string;
    applicationMethod: string;
    contactInfo: string;
    websiteUrl?: string;
}

export interface WelfareSearchRequest {
    keyword?: string;
    category?: string;
    region?: string;
}

// =====================
// 통화 리뷰 관련 타입
// =====================
export interface CallRecordSummaryResponse {
    callId: number;
    elderlyId: number;
    elderlyName: string;
    callAt: string;
    duration: number;
    emotion: 'GOOD' | 'NEUTRAL' | 'BAD';
    hasReview: boolean;
    summary?: string;
}

export interface CallRecordDetailResponse extends CallRecordSummaryResponse {
    transcript: string;
    emotionAnalysis: {
        overall: string;
        details: string;
    };
    aiSummary: string;
    review?: ReviewResponse;
}

export interface ReviewResponse {
    reviewId: number;
    callId: number;
    counselorId: number;
    counselorName: string;
    comment: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ReviewRequest {
    callId: number;
    comment: string;
}

export interface GuardianCallReviewResponse {
    callId: number;
    elderlyName: string;
    callAt: string;
    duration: number;
    emotion: 'GOOD' | 'NEUTRAL' | 'BAD';
    summary: string;
    counselorComment?: string;
}

export interface UnreviewedCountResponse {
    count: number;
}

// =====================
// 오프라인 회원가입 요청 타입
// =====================
export interface RegisterElderlyRequest {
    loginId: string;
    password?: string;
    name: string;
    phone: string;
    email?: string;
    admCode: number;
    birthDate: string;
    gender: 'M' | 'F';
    addressLine1: string;
    addressLine2?: string;
    zipcode?: string;
    memo?: string;
}

export interface RegisterGuardianRequest {
    loginId: string;
    password?: string;
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    zipcode?: string;
    elderlyUserId: number;
    relationType: string;
    memo?: string;
}
