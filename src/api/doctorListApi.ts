import { doctorListApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

const doctorListService = {
  getdoctorList: async () => {
    try {
      const response = await doctorListApi.get('doctorList').json<ApiResponse<any>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctorList', error);
      throw error;
    }
  },
  
  // Kalo Butuh
};

export default doctorListService;