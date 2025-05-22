import { konsultasiApi } from '@/middleware/apiMiddleware';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

interface CreateScheduleDto {
  day: string;
  startTime: string;
  endTime: string;
}

interface CreateOneTimeScheduleDto {
  specificDate: string;
  startTime: string;
  endTime: string;
}

interface Schedule {
  id: string;
  caregiverId: string;
  day: string;
  startTime: string;
  endTime: string;
  specificDate?: string;
  oneTime: boolean;
}

export const scheduleApi = {
  createSchedule: async (scheduleData: CreateScheduleDto): Promise<Schedule> => {
    try {
      const response = await konsultasiApi.post('schedule/caregiver', {
        json: scheduleData
      }).json<ApiResponse<Schedule>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule', error);
      throw error;
    }
  },
  
  createOneTimeSchedule: async (scheduleData: CreateOneTimeScheduleDto): Promise<Schedule> => {
    try {
      const response = await konsultasiApi.post('schedule/caregiver/one-time', {
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
      const response = await konsultasiApi.get('schedule/caregiver').json<ApiResponse<Schedule[]>>();
      return response.data;
    } catch (error) {
      console.error('Failed to get caregiver schedules', error);
      throw error;
    }
  },
  
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    try {
      await konsultasiApi.delete(`schedule/caregiver/${scheduleId}`).json<ApiResponse<null>>();
    } catch (error) {
      console.error('Failed to delete schedule', error);
      throw error;
    }
  },
  
  updateSchedule: async (scheduleId: string, scheduleData: CreateScheduleDto): Promise<Schedule> => {
    try {
      const response = await konsultasiApi.put(`schedule/caregiver/${scheduleId}`, {
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
      const response = await konsultasiApi.get(`schedule/${scheduleId}/available?weeksAhead=${weeksAhead}`)
        .json<ApiResponse<string[]>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to get available times', error);
      throw error;
    }
  },
  
  checkAvailability: async (scheduleId: string, dateTime: string): Promise<boolean> => {
    try {
      const response = await konsultasiApi.get(`schedule/${scheduleId}/check-availability?dateTime=${dateTime}`)
        .json<ApiResponse<boolean>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to check availability', error);
      throw error;
    }
  }
};