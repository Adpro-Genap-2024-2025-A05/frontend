import { create } from 'zustand'

interface AuthState {
  user: { id: string; name: string } | null
  token: string | null
  login: (user: { id: string; name: string }, token: string) => void
  logout: () => void
}

const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}))

export default useAuth
