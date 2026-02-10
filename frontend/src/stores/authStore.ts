import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, authApi, LoginCredentials, RegisterData, parseApiError } from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(credentials)
          set({ token: response.token, isLoading: false })
          await get().fetchUser()
        } catch (error: unknown) {
          const message = parseApiError(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.register(data)
          // Auto login after register
          await get().login({ email: data.email, password: data.password })
        } catch (error: unknown) {
          const message = parseApiError(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      googleLogin: async (credential) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.googleLogin(credential)
          set({ token: response.token, isLoading: false })
          await get().fetchUser()
        } catch (error: unknown) {
          const message = parseApiError(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
      },

      fetchUser: async () => {
        const token = get().token
        if (!token) return

        try {
          const user = await authApi.me()
          set({ user })
        } catch {
          set({ user: null, token: null })
        }
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'heatcheck-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
