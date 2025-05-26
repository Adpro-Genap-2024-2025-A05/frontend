import ky from 'ky';
import tokenService from '@/services/tokenService';

const API_CONFIG = {
  baseUrls: {
    auth: process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:8080/api',
    konsultasi: process.env.NEXT_PUBLIC_KONSULTASI_BASE_URL || 'http://localhost:8081/api',
    doctorList: process.env.NEXT_PUBLIC_DOCTOR_LIST_BASE_URL || 'http://localhost:8082/api',
    rating: process.env.NEXT_PUBLIC_RATING_BASE_URL || 'http://localhost:8083/api',
    chat: process.env.NEXT_PUBLIC_CHAT_BASE_URL || 'http://localhost:8084/api',
  },
  verifyEndpoint: 'auth/verify'
};

export type ServiceType = 'auth' | 'konsultasi' | 'doctorList' | 'rating' | 'chat';

export const getServiceBaseUrl = (serviceType: ServiceType): string => {
  return API_CONFIG.baseUrls[serviceType];
};

export const createApiMiddleware = (baseUrl: string) => {
  return ky.create({
    prefixUrl: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
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

export const authApi = createApiMiddleware(API_CONFIG.baseUrls.auth);
export const konsultasiApi = createApiMiddleware(API_CONFIG.baseUrls.konsultasi);
export const doctorListApi = createApiMiddleware(API_CONFIG.baseUrls.doctorList);
export const ratingApi = createApiMiddleware(API_CONFIG.baseUrls.rating);
export const chatApi = createApiMiddleware(API_CONFIG.baseUrls.chat);

export const verifyTokenForService = async (serviceType: ServiceType): Promise<boolean> => {
  const token = tokenService.getToken();
  if (!token) return false;
  
  try {
    const api = serviceType === 'auth' ? authApi : 
               serviceType === 'konsultasi' ? konsultasiApi :
               serviceType === 'doctorList' ? doctorListApi :
               serviceType === 'rating' ? ratingApi : chatApi;
               
    const response = await api.post(API_CONFIG.verifyEndpoint).json<{status: number, message: string, timestamp: string, data: {valid: boolean}}>();
    
    return response.data.valid === true;
  } catch (error) {
    console.error(`Token verification failed for ${serviceType}:`, error);
    return false;
  }
};

const api = {
  auth: authApi,
  konsultasi: konsultasiApi,
  doctorList: doctorListApi,
  rating: ratingApi,
  chat: chatApi
};

export default api;