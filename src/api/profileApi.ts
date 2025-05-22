import { profileApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

const profileService = {
  getProfile: async () => {
    try {
      const response = await profileApi.get('profile').json<ApiResponse<any>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      throw error;
    }
  },
  
  // Kalo Butuh
};

export default profileService;