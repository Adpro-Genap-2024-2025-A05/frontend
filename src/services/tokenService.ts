const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface JwtPayload {
  role: string;
  name: string;
  id: string;
  sub: string;  
  iat: number;  
  exp: number;  
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const jsonPayload = atob(padded);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT', error);
    return null;
  }
};

const tokenService = {
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    
    const payload = decodeJwt(token);
    if (payload) {
      const userData: UserData = {
        id: payload.id,
        email: payload.sub,
        name: payload.name,
        role: payload.role
      };
      tokenService.setUser(userData);
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isTokenExpired: (): boolean => {
    const token = tokenService.getToken();
    if (!token) return true;
    
    const payload = decodeJwt(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  getTokenExpiryTime: (): number => {
    const token = tokenService.getToken();
    if (!token) return 0;
    
    const payload = decodeJwt(token);
    if (!payload) return 0;
    
    return payload.exp * 1000; 
  },

  getTokenRemainingTime: (): number => {
    const expiry = tokenService.getTokenExpiryTime();
    if (expiry === 0) return 0;
    
    const remaining = expiry - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  setUser: (userData: UserData): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  getUser: (): UserData | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data', error);
      return null;
    }
  },

  clearUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  clearAuth: (): void => {
    tokenService.clearToken();
    tokenService.clearUser();
  },
  
  parseToken: (): JwtPayload | null => {
    const token = tokenService.getToken();
    if (!token) return null;
    return decodeJwt(token);
  }
};

export default tokenService;