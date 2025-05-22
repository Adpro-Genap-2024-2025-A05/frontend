import { profileApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nik: string;
  address: string;
  phoneNumber: string;
  role: 'PACILIAN' | 'CAREGIVER';
  medicalHistory?: string;
  speciality?: string;
  workAddress?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  address?: string;
  phoneNumber?: string;
  medicalHistory?: string;
  speciality?: string;
  workAddress?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await profileApi.get('profile').json<ApiResponse<UserProfile>>();

      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      throw error;
    }
  },

  updateProfile: async (updateData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const response = await profileApi.put('profile', { json: updateData }).json<ApiResponse<UserProfile>>();
      return response.data;
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  },


  deleteAccount: async (): Promise<void> => {
    try {
      await profileApi.delete('profile').json<ApiResponse<void>>();
    } catch (error) {
      console.error('Failed to delete account', error);
      throw error;
    }
  },

  changePassword: async (passwordData: PasswordChangeRequest): Promise<void> => {
    try {
      await profileApi.post('profile/change-password', { json: passwordData }).json<ApiResponse<void>>();
    } catch (error) {
      console.error('Failed to change password', error);
      throw error;
    }
  }
};

export default profileService;