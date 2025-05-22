import { chatApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

const chatService = {
  getChats: async () => {
    try {
      const response = await chatApi.get('chats').json<ApiResponse<any>>();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chats', error);
      throw error;
    }
  },
  
  // Related Function Kalo Butuh
};

export default chatService;