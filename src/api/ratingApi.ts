import { ratingApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

const ratingService = {
  getRatings: async () => {
    try {
      const response = await ratingApi.get('ratings').json<ApiResponse<any>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ratings', error);
      throw error;
    }
  },
  
  // Rating Kalo butuh
};

export default ratingService;