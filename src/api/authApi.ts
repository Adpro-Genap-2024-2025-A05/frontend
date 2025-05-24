import { authApi as api } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

interface LoginResponse {
  accessToken: string;
  email: string;
  name: string;
  role: string;
  expiresIn: number;
}

interface RegisterResponse {
  id: string;
  role: string;
  message: string;
}

interface TokenVerificationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  role?: string;
  expiresIn?: number;
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

const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('auth/login', {
        json: { email, password }
      }).json<ApiResponse<LoginResponse>>();
      
      tokenService.setToken(response.data.accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  registerPacilian: async (registerData: any) => {
    try {
      const response = await api.post('auth/register/pacilian', {
        json: registerData
      }).json<ApiResponse<RegisterResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  },

  registerCaregiver: async (registerData: any) => {
    try {
      const response = await api.post('auth/register/caregiver', {
        json: registerData
      }).json<ApiResponse<RegisterResponse>>();
      
      return response.data;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('profile').json<ApiResponse<UserProfile>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      throw error;
    }
  },

  updateProfile: async (updateData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const response = await api.put('profile', { json: updateData }).json<ApiResponse<UserProfile>>();
      return response.data;
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  },

  deleteAccount: async (): Promise<void> => {
    try {
      await api.delete('profile').json<ApiResponse<void>>();
    } catch (error) {
      console.error('Failed to delete account', error);
      throw error;
    }
  },

  changePassword: async (passwordData: PasswordChangeRequest): Promise<void> => {
    try {
      await api.post('profile/change-password', { json: passwordData }).json<ApiResponse<void>>();
    } catch (error) {
      console.error('Failed to change password', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('auth/logout');
      tokenService.clearAuth();
    } catch (error) {
      console.error('Logout failed', error);
      tokenService.clearAuth();
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

  isAuthenticated: async (): Promise<boolean> => {
    const token = tokenService.getToken();
    if (!token || tokenService.isTokenExpired()) {
      tokenService.clearAuth();
      return false;
    }
    
    const verification = await authService.verifyToken();
    return verification.valid === true;
  },

  getUserRole: (): string | null => {
    const payload = tokenService.parseToken();
    return payload?.role || null;
  }
};

export default authService;
