import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Importamos la conexión base o mock de tu api para evitar bloqueos
// Nota: Ajustamos la importación para que no pida tipos rotos
import { moviesApi } from './api' 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-sj8l.onrender.com/api';

// User type matching your PostgreSQL schema
export interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  status: 'Activo' | 'Inactivo'
  role_name: 'Gerente' | 'Empleado'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: any) => Promise<boolean> // Usamos any para flexibilizar la petición de login
  logout: () => void
  clearError: () => void
  setUser: (user: User, token: string) => void
  fetchProfile: () => Promise<void>
}

// Mock user for development when backend is unavailable
const createMockUser = (email: string): User => ({
  user_id: 1,
  first_name: email.split('@')[0],
  last_name: 'Usuario',
  email: email,
  status: 'Activo',
  role_name: 'Empleado'
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: any) => {
        set({ isLoading: true, error: null })
        
        try {
          // Intentamos hacer la petición fetch directa a tu backend de producción o local
          const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          const data = await response.json();
          const realData = data.data || data;

          if (response.ok && realData.token) {
            set({
              user: realData.user,
              token: realData.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          } else {
            throw new Error(data.message || 'Credenciales incorrectas');
          }

        } catch (err: any) {
          // Fallback automático al usuario Mock en desarrollo si tu backend está apagado
          if (process.env.NODE_ENV === 'development') {
            const mockUser = createMockUser(credentials.email)
            set({
              user: mockUser,
              token: 'mock-jwt-token-' + Date.now(),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          }
          
          set({ isLoading: false, error: err.message || 'Error al conectar con el servidor' })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => set({ error: null }),
      
      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        })
      },

      fetchProfile: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await fetch(`${BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            const realData = data.data || data;
            set({ user: realData })
          }
        } catch (error) {
          console.error("Error al traer el perfil:", error);
        }
      },
    }),
    {
      name: 'cinelux-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);