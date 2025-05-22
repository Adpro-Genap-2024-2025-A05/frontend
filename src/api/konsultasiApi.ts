// api/konsultasiApi.ts
import { konsultasiApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

const konsultasiService = {
  getKonsultasi: async () => {
    try {
      const response = await konsultasiApi.get('konsultasi').json<ApiResponse<any>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch konsultasi data', error);
      throw error;
    }
  },
  
  // Konsultasi kalo butuh
};

export default konsultasiService;