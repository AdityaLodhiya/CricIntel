import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (userData, token, refreshToken) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        set({ user: userData, isAuthenticated: true, token })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, token: null })
      },

      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } }))
    }),
    {
      name: 'cricintel-auth',
    }
  )
)
