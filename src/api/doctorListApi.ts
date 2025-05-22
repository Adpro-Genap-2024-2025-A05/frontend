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
  totalReviews: number;
  workingSchedules: Schedule[];
}

export interface DoctorSearchParams {
  name?: string;
  speciality?: string;
  workingSchedule?: string;
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
      if (params.workingSchedule) searchParams.append('workingSchedule', params.workingSchedule);
      
      searchParams.append('page', (params.page || 0).toString());
      searchParams.append('size', (params.size || 10).toString());

      const queryString = searchParams.toString();
      const endpoint = queryString ? `doctor/search?${queryString}` : 'doctor/search';
      
      const response = await doctorListApi.get(endpoint).json<ApiResponse<PaginatedResponse<Doctor>>>();
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
  }
};

export default doctorListService;