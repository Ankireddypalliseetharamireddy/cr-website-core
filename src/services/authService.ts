import apiClient from './apiClient';

export interface LoginCredentials {
    username: string;
    password: string;
    [key: string]: any;
}

export interface ResetPasswordPayload {
    identifier: string;
    otp_code: string;
    new_password: string;
}

export const authService = {
    login: (credentials: LoginCredentials) => apiClient.post('/auth/login', credentials),
    register: (data: any) => apiClient.post('/auth/register', data),
    getProfile: () => apiClient.get('/auth/profile/'),
    forgotPassword: (identifier: string) => apiClient.post('/auth/forgot-password/', { identifier }),
    verifyResetOtp: (identifier: string, otp_code: string) => apiClient.post('/auth/verify-reset-otp/', { identifier, otp_code }),
    resetPassword: (data: ResetPasswordPayload) => apiClient.post('/auth/reset-password/', data),
};

export default authService;
