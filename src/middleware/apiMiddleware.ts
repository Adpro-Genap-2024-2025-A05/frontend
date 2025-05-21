import ky from 'ky';
import tokenService from '@/services/tokenService';

const API_CONFIG = {
  auth: process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:8080',
  konsultasi: process.env.NEXT_PUBLIC_KONSULTASI_BASE_URL || 'http://localhost:8081',
  profile: process.env.NEXT_PUBLIC_PROFILE_BASE_URL || 'http://localhost:8082',
  rating: process.env.NEXT_PUBLIC_RATING_BASE_URL || 'http://localhost:8083',
  chat: process.env.NEXT_PUBLIC_CHAT_BASE_URL || 'http://localhost:8084',
};

const VERIFY_ENDPOINTS = {
  auth: 'api/auth/verify',
  konsultasi: 'api/konsultasi/verify',
  profile: 'api/profile/verify',
  rating: 'api/rating/verify',
  chat: 'api/chat/verify',
};

export type ServiceType = 'auth' | 'konsultasi' | 'profile' | 'rating' | 'chat';

interface TokenVerificationResponse {
  data?: {
    valid?: boolean;
  };
}

export const verifyTokenForService = async (serviceType: ServiceType): Promise<boolean> => {
  const token = tokenService.getToken();
  if (!token) return false;
  
  try {
    const api = createApiMiddleware(API_CONFIG[serviceType]);
    const response = await api.post(VERIFY_ENDPOINTS[serviceType]).json<TokenVerificationResponse>();
    
    return response?.data?.valid === true;
  } catch (error) {
    console.error(`Token verification failed for ${serviceType}:`, error);
    return false;
  }
};

const createApiMiddleware = (baseUrl: string) => {
  return ky.create({
    prefixUrl: baseUrl,
    timeout: 30000,
    hooks: {
      beforeRequest: [
        request => {
          const token = tokenService.getToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      ],
      afterResponse: [
        async (_request, _options, response) => {
          if (response.status === 401) {
            tokenService.clearAuth();
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:error', { 
                detail: { message: 'Authentication failed' } 
              }));
            }
          }
          
          return response;
        }
      ]
    }
  });
};

export const authApi = createApiMiddleware(API_CONFIG.auth);
export const konsultasiApi = createApiMiddleware(API_CONFIG.konsultasi);
export const profileApi = createApiMiddleware(API_CONFIG.profile);
export const ratingApi = createApiMiddleware(API_CONFIG.rating);
export const chatApi = createApiMiddleware(API_CONFIG.chat);

const api = {
  auth: authApi,
  konsultasi: konsultasiApi,
  profile: profileApi,
  rating: ratingApi,
  chat: chatApi
};

export default api;