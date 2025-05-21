import ky from 'ky';
import tokenService from '@/services/tokenService';

const API_CONFIG = {
  auth: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  konsultasi: process.env.NEXT_PUBLIC_KONSULTASI_BASE_URL || 'http://localhost:3001',
  profile: process.env.NEXT_PUBLIC_PROFILE_BASE_URL || 'http://localhost:3002',
  rating: process.env.NEXT_PUBLIC_RATING_BASE_URL || 'http://localhost:3003',
  chat: process.env.NEXT_PUBLIC_CHAT_BASE_URL || 'http://localhost:3004',
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
        (_request, _options, response) => {
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