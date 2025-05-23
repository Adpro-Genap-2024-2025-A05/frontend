'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/api/authApi';
import tokenService from '@/services/tokenService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // Only check token expiration and get user from token - no API call
      if (tokenService.isTokenExpired()) {
        tokenService.clearAuth();
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const storedUser = tokenService.getUser();
      
      if (storedUser) {
        setUser(storedUser);
      }
      
      setIsLoading(false);
    };

    initAuth();

    const handleAuthError = () => {
      tokenService.clearAuth();
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('auth:error', handleAuthError);
    return () => window.removeEventListener('auth:error', handleAuthError);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginData = await authService.login(email, password);
      
      const userData = await tokenService.getUser();
      if (userData) {
        setUser(userData);
      }
      
      setIsLoading(false);
      
      return loginData.role;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  const isAuthenticated = () => {
    return !!user && !tokenService.isTokenExpired();
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  };
}