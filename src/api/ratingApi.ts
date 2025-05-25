import { ratingApi as api } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface Rating {
  id: string;
  rating: number;
  konsultasiId: string;
  review?: string;
  createdAt: string;
  updatedAt: string;
  pacilianId: string;
  caregiverId: string;
  pacilianName: string;
}

export interface CaregiverRatingStats {
  caregiverId: string;
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

export interface CreateRatingRequest {
  rating: number;
  review?: string;
  konsultasiId: string;
}

export interface UpdateRatingRequest {
  rating: number;
  review?: string;
}

const ratingService = {
  createRating: async (data: CreateRatingRequest): Promise<Rating> => {
    try {
      const response = await api.post('rating', {
        json: data
      }).json<ApiResponse<Rating>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create rating', error);
      throw error;
    }
  },

  updateRating: async (ratingId: string, data: UpdateRatingRequest): Promise<Rating> => {
    try {
      const response = await api.put(`rating/${ratingId}`, {
        json: data
      }).json<ApiResponse<Rating>>();
      
      return response.data;
    } catch (error) {
      console.error('Failed to update rating', error);
      throw error;
    }
  },

  deleteRating: async (ratingId: string): Promise<void> => {
    try {
      await api.delete(`rating/${ratingId}`).json<ApiResponse<null>>();
    } catch (error) {
      console.error('Failed to delete rating', error);
      throw error;
    }
  },

  getRatingById: async (ratingId: string): Promise<Rating> => {
    try {
      const response = await api.get(`rating/${ratingId}`).json<ApiResponse<Rating>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rating', error);
      throw error;
    }
  },

  getRatingsByPacilian: async (pacilianId: string): Promise<Rating[]> => {
    try {
      const response = await api.get(`rating/pacilian/${pacilianId}`).json<ApiResponse<Rating[]>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pacilian ratings', error);
      throw error;
    }
  },

  getRatingsByCaregiver: async (caregiverId: string): Promise<Rating[]> => {
    try {
      const response = await api.get(`rating/caregiver/${caregiverId}`).json<ApiResponse<Rating[]>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch caregiver ratings', error);
      throw error;
    }
  },

  getCaregiverRatingStats: async (caregiverId: string): Promise<CaregiverRatingStats> => {
    try {
      const response = await api.get(`rating/caregiver/${caregiverId}/stats`).json<ApiResponse<CaregiverRatingStats>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch caregiver rating stats', error);
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

      const response = await api.post('auth/verify', {
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

export default ratingService;