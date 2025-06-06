import { doctorListApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface Schedule {
  id: string;
  caregiverId: string;
  day: string;
  startTime: string;
  endTime: string;
  specificDate?: string;
  oneTime: boolean;
}

export interface Doctor {
  id: string;
  caregiverId: string;
  name: string;
  email: string;
  speciality: string;
  workAddress: string;
  phoneNumber: string;
  description: string;
  rating: number;
  totalRatings: number;
  workingSchedules: Schedule[];
}

export interface DoctorSearchParams {
  name?: string;
  speciality?: string;
  workingSchedule?: string;
  workingDay?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

const doctorListService = {
  searchDoctors: async (params: DoctorSearchParams = {}): Promise<PaginatedResponse<Doctor>> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.name) searchParams.append('name', params.name);
      if (params.speciality) searchParams.append('speciality', params.speciality);
      if (params.workingDay) searchParams.append('workingDay', params.workingDay);
      if (params.startTime) searchParams.append('startTime', params.startTime);
      if (params.endTime) searchParams.append('endTime', params.endTime);
      // Keep backward compatibility
      if (params.workingSchedule) searchParams.append('workingSchedule', params.workingSchedule);
      
      searchParams.append('page', (params.page || 0).toString());
      searchParams.append('size', (params.size || 10).toString());

      const queryString = searchParams.toString();
      const endpoint = queryString ? `doctor/search?${queryString}` : 'doctor/search';
      
      const response = await doctorListApi.get(endpoint).json<ApiResponse<PaginatedResponse<Doctor>>>();
      console.log('Response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to search doctors', error);
      throw error;
    }
  },

  getAllDoctors: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Doctor>> => {
    try {
      const response = await doctorListApi.get(`doctor?page=${page}&size=${size}`).json<ApiResponse<PaginatedResponse<Doctor>>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctors', error);
      throw error;
    }
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    try {
      const response = await doctorListApi.get(`doctor/${id}`).json<ApiResponse<Doctor>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctor details', error);
      throw error;
    }
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      const token = tokenService.getToken();

      if (!token || tokenService.isTokenExpired()) {
        tokenService.clearAuth();
        return false;
      }

      const response = await doctorListApi.post('auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).json<ApiResponse<{ valid: boolean }>>();

      if (!response.data.valid) {
        tokenService.clearAuth();
      }

      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed', error);
      tokenService.clearAuth();
      return false;
    }
  },
};

export default doctorListService;