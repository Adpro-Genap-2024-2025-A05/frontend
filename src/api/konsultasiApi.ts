import { konsultasiApi as api } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface CaregiverPublicDto {
  id: string;
  name: string;
  email: string;
  speciality: string;
  workAddress: string;
  phoneNumber: string;
}

export interface PacilianPublicDto {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  medicalHistory?: string;
}

export interface CreateKonsultasiDto {
  scheduleId: string;
  scheduleDateTime: string;
  notes?: string;
}

export interface UpdateKonsultasiRequestDto {
  newScheduleDateTime: string;
  newScheduleId?: string;
  notes?: string;
}

export interface RescheduleKonsultasiDto {
  newScheduleDateTime: string; 
  newScheduleId?: string;
  notes?: string;
}

interface TokenVerificationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  role?: string;
  expiresIn?: number;
}

export interface KonsultasiResponse {
  id: string;
  scheduleId: string;
  caregiverId: string;
  pacilianId: string;
  scheduleDateTime: string;
  notes?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'DONE' | 'RESCHEDULED';
  lastUpdated: string;

  caregiverData?: CaregiverPublicDto;
  pacilianData?: PacilianPublicDto;
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

const konsultasiService = {
  createKonsultasi: async (data: CreateKonsultasiDto): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post('api/konsultasi', {
        json: data
      }).json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create konsultasi', error);
      throw error;
    }
  },

  updateKonsultasiRequest: async (konsultasiId: string, data: UpdateKonsultasiRequestDto): Promise<KonsultasiResponse> => {
    try {
      const response = await api.put(`api/konsultasi/${konsultasiId}/update-request`, {
        json: data
      }).json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to update konsultasi request', error);
      throw error;
    }
  },

  confirmKonsultasi: async (konsultasiId: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/confirm`, {})
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to confirm konsultasi', error);
      throw error;
    }
  },

  cancelKonsultasi: async (konsultasiId: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/cancel`, {})
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to cancel konsultasi', error);
      throw error;
    }
  },

  completeKonsultasi: async (konsultasiId: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/complete`, {})
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to complete konsultasi', error);
      throw error;
    }
  },

  rescheduleKonsultasi: async (konsultasiId: string, data: RescheduleKonsultasiDto): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/reschedule`, {
        json: data
      }).json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to reschedule konsultasi', error);
      throw error;
    }
  },

  acceptReschedule: async (konsultasiId: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/accept-reschedule`, {})
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to accept reschedule', error);
      throw error;
    }
  },

  rejectReschedule: async (konsultasiId: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.post(`api/konsultasi/${konsultasiId}/reject-reschedule`, {})
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to reject reschedule', error);
      throw error;
    }
  },

  getKonsultasiById: async (konsultasiId: string, role: string): Promise<KonsultasiResponse> => {
    try {
      const response = await api.get(`api/konsultasi/${konsultasiId}`)
        .json<ApiResponse<KonsultasiResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get konsultasi', error);
      throw error;
    }
  },

  getPacilianKonsultasi: async (): Promise<KonsultasiResponse[]> => {
    try {
      const response = await api.get('api/konsultasi/pacilian')
        .json<ApiResponse<KonsultasiResponse[]>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get pacilian konsultasi', error);
      throw error;
    }
  },

  getCaregiverKonsultasi: async (): Promise<KonsultasiResponse[]> => {
    try {
      const response = await api.get('api/konsultasi/caregiver')
        .json<ApiResponse<KonsultasiResponse[]>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get caregiver konsultasi', error);
      throw error;
    }
  },

  getRequestedKonsultasi: async (): Promise<KonsultasiResponse[]> => {
    try {
      const response = await api.get('api/konsultasi/caregiver/requested')
        .json<ApiResponse<KonsultasiResponse[]>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get requested konsultasi', error);
      throw error;
    }
  },

  createSchedule: async (scheduleData: any): Promise<Schedule> => {
    try {
      const response = await api.post('api/schedule/caregiver', {
        json: scheduleData
      }).json<ApiResponse<Schedule>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule', error);
      throw error;
    }
  },
  
  createOneTimeSchedule: async (scheduleData: any): Promise<Schedule> => {
    try {
      const response = await api.post('api/schedule/caregiver/one-time', {
        json: scheduleData
      }).json<ApiResponse<Schedule>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create one-time schedule', error);
      throw error;
    }
  },
  
  getCaregiverSchedules: async (): Promise<Schedule[]> => {
    try {
      const response = await api.get('api/schedule/caregiver').json<ApiResponse<Schedule[]>>();
      return response.data;
    } catch (error) {
      console.error('Failed to get caregiver schedules', error);
      throw error;
    }
  },

  getCaregiverSchedulesById: async (caregiverId: string): Promise<Schedule[]> => {
    try {
      const response = await api.get(`api/schedule/caregiver/${caregiverId}`)
        .json<ApiResponse<Schedule[]>>();
      return response.data;
    } catch (error) {
      console.error('Failed to get caregiver schedules by ID', error);
      throw error;
    }
  },
  
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    try {
      await api.delete(`api/schedule/caregiver/${scheduleId}`).json<ApiResponse<null>>();
    } catch (error) {
      console.error('Failed to delete schedule', error);
      throw error;
    }
  },
  
  updateSchedule: async (scheduleId: string, scheduleData: any): Promise<Schedule> => {
    try {
      const response = await api.put(`api/schedule/caregiver/${scheduleId}`, {
        json: scheduleData
      }).json<ApiResponse<Schedule>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to update schedule', error);
      throw error;
    }
  },
  
  getAvailableTimes: async (scheduleId: string, weeksAhead: number = 4): Promise<string[]> => {
    try {
      const response = await api.get(`api/schedule/${scheduleId}/available?weeksAhead=${weeksAhead}`)
        .json<ApiResponse<string[]>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get available times', error);
      throw error;
    }
  },
  
  checkAvailability: async (scheduleId: string, dateTime: string): Promise<boolean> => {
    try {
      const response = await api.get(`api/schedule/${scheduleId}/check-availability?dateTime=${dateTime}`)
        .json<ApiResponse<boolean>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to check availability', error);
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const token = tokenService.getToken();
      
      if (!token) {
        return { valid: false };
      }
      
      if (tokenService.isTokenExpired()) {
        tokenService.clearAuth();
        return { valid: false };
      }
      
      const response = await api.post('auth/verify').json<ApiResponse<TokenVerificationResponse>>();
      
      if (!response.data.valid) {
        tokenService.clearAuth();
      }
      
      return response.data;
    } catch (error) {
      console.error('Token verification failed', error);
      tokenService.clearAuth();
      return { valid: false };
    }
  },
};

export default konsultasiService;