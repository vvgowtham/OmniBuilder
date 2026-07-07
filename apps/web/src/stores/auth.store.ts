import { create } from 'zustand';
import { authApi } from '../lib/api';

interface AuthState {
  user: { id: string; email: string; fullName: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.accessToken);
    set({ user: res.data.user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
