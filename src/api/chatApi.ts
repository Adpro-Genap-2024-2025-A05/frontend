import { chatApi } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  sessionId: string;
  createdAt: string;
  editedAt?: string;
  edited: boolean;
  deleted: boolean;
  isLoading?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  user2: {
    id: string;
    name: string;
    role: 'pacilian' | 'caregiver';
    avatar?: string | null;
  };
  updatedAt: string;
  lastMessage?: ChatMessage;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface AjaxState {
  isLoading: boolean;
  error: string | null;
}

const chatService = {
  verifyToken: async (): Promise<boolean> => {
    try {
      const token = tokenService.getToken();

      if (!token || tokenService.isTokenExpired()) {
        tokenService.clearAuth();
        return false;
      }

      const response = await chatApi.post('auth/verify', {
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

  getSessions: async (): Promise<ChatSession[]> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    try {
      const response = await chatApi.get('chat/session/user').json<ApiResponse<any[]>>();
      const sessionData = response.data;
      const user = tokenService.getUser();
      const isPacilian = user?.role === 'PACILIAN';

      return sessionData.map((session: any): ChatSession => ({
        id: session.id,
        user2: {
          id: isPacilian ? session.caregiver : session.pacilian,
          name: isPacilian ? session.caregiverName : session.pacilianName,
          role: isPacilian ? 'caregiver' : 'pacilian',
          avatar: null,
        },
        updatedAt: session.createdAt,
        lastMessage: session.messages?.length
          ? {
              id: session.messages.at(-1).id,
              content: session.messages.at(-1).content,
              senderId: session.messages.at(-1).senderId,
              sessionId: session.id,
              createdAt: session.messages.at(-1).createdAt,
              editedAt: session.messages.at(-1).editedAt,
              edited: session.messages.at(-1).edited,
              deleted: session.messages.at(-1).deleted,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Failed to get chat sessions:', error);
      throw new Error('Gagal mengambil data sesi chat');
    }
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    try {
      const response = await chatApi.get(`chat/session/${sessionId}`).json<ApiResponse<{ messages: any[] }>>();

      return response.data.messages.map((msg: any): ChatMessage => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        sessionId: sessionId,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        edited: msg.edited,
        deleted: msg.deleted,
        isLoading: false,
        isEditing: false,
        isDeleting: false,
      }));
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw new Error('Gagal mengambil pesan chat');
    }
  },

  sendMessage: async (
    sessionId: string, 
    content: string,
    onProgress?: (state: AjaxState) => void
  ): Promise<ChatMessage> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    onProgress?.({ isLoading: true, error: null });

    try {
      const response = await chatApi.post('chat/send', {
        json: { content, sessionId },
      }).json<ApiResponse<ChatMessage>>();

      onProgress?.({ isLoading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = 'Gagal mengirim pesan';
      
      onProgress?.({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  editMessage: async (
    messageId: string, 
    content: string,
    onProgress?: (state: AjaxState) => void
  ): Promise<ChatMessage> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    onProgress?.({ isLoading: true, error: null });

    try {
      const response = await chatApi.put(`chat/message/${messageId}`, {
        json: { content },
      }).json<ApiResponse<ChatMessage>>();

      onProgress?.({ isLoading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to edit message:', error);
      const errorMessage = 'Gagal mengedit pesan';
      
      onProgress?.({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteMessage: async (
    messageId: string,
    onProgress?: (state: AjaxState) => void
  ): Promise<void> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    onProgress?.({ isLoading: true, error: null });

    try {
      await chatApi.delete(`chat/message/${messageId}`);
      
      onProgress?.({ isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to delete message:', error);
      const errorMessage = 'Gagal menghapus pesan';
      
      onProgress?.({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  createSession: async (caregiverId: string): Promise<ChatSession> => {
    const isValid = await chatService.verifyToken();
    if (!isValid) throw new Error('Token tidak valid');

    try {
      const token = tokenService.getToken();
      const response = await chatApi.post('chat/session/create', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        json: { caregiver: caregiverId },
      }).json<ApiResponse<any>>();

      const data = response.data;
      const user = tokenService.getUser();
      const isPacilian = user?.role === 'PACILIAN';

      return {
        id: data.id,
        user2: {
          id: isPacilian ? data.caregiver : data.pacilian,
          name: isPacilian ? data.caregiverUsername : data.pacilianUsername,
          role: isPacilian ? 'caregiver' : 'pacilian',
          avatar: null,
        },
        updatedAt: data.createdAt,
        lastMessage: undefined,
      };
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw new Error('Gagal membuat sesi chat');
    }
  }
};

export default chatService;