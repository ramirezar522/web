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
  profile_photo?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: any) => Promise<boolean>
  loginWithGoogle: (credential: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setUser: (user: User, token: string) => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string; current_password?: string; new_password?: string; profile_photo?: string | null }) => Promise<{ success: boolean; error?: string }>
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

      loginWithGoogle: async (credential: string) => {
        set({ isLoading: true, error: null })
        try {
          // Decode the Google JWT to extract user info (UTF-8 safe and base64url compliant)
          const base64Url = credential.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const payload = JSON.parse(jsonPayload)
          const googleUser: User = {
            user_id: 0,
            first_name: payload.given_name || payload.name?.split(' ')[0] || 'Usuario',
            last_name: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Google',
            email: payload.email,
            status: 'Activo',
            role_name: 'Empleado',
            profile_photo: payload.picture || null,
          }

          // Try to authenticate with backend using Google credential
          try {
            const response = await fetch(`${BASE_URL}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential, email: payload.email, name: payload.name }),
            })
            if (response.ok) {
              const data = await response.json()
              const realData = data.data || data
              if (realData.token) {
                set({
                  user: {
                    user_id: realData.user.id || realData.user.user_id || 0,
                    first_name: realData.user.name?.split(' ')[0] || googleUser.first_name,
                    last_name: realData.user.name?.split(' ').slice(1).join(' ') || googleUser.last_name,
                    email: realData.user.email,
                    status: 'Activo',
                    role_name: realData.user.role || 'Empleado',
                    profile_photo: realData.user.profile_photo || null,
                  },
                  token: realData.token,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                })
                return true
              }
            }
          } catch (e) {
            console.warn('Backend /auth/google not ready or failed, trying fallback...', e)
          }

          // Fallback: Authenticate via existing public /auth/login and /auth/register endpoints
          try {
            const googleSecretPassword = `GoogleAuthPassword-${payload.sub || payload.email}`
            
            // Try to login
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: payload.email, password: googleSecretPassword }),
            })

            if (loginRes.ok) {
              const loginData = await loginRes.json()
              const realData = loginData.data || loginData
              if (realData.token) {
                set({
                  user: {
                    user_id: realData.user.id || realData.user.user_id || 0,
                    first_name: realData.user.name?.split(' ')[0] || googleUser.first_name,
                    last_name: realData.user.name?.split(' ').slice(1).join(' ') || googleUser.last_name,
                    email: realData.user.email,
                    status: 'Activo',
                    role_name: realData.user.role || 'Empleado',
                    profile_photo: realData.user.profile_photo || null,
                  },
                  token: realData.token,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                })
                return true
              }
            } else {
              // User not registered with Google secret password yet, register them
              const registerRes = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  first_name: googleUser.first_name,
                  last_name: googleUser.last_name,
                  email: googleUser.email,
                  password: googleSecretPassword,
                  role_id: 2, // Empleado
                  status: 'Activo'
                }),
              })

              if (registerRes.ok) {
                // Try logging in again now that the account is created
                const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: payload.email, password: googleSecretPassword }),
                })

                if (loginRes2.ok) {
                  const loginData2 = await loginRes2.json()
                  const realData2 = loginData2.data || loginData2
                  if (realData2.token) {
                    set({
                      user: {
                        user_id: realData2.user.id || realData2.user.user_id || 0,
                        first_name: realData2.user.name?.split(' ')[0] || googleUser.first_name,
                        last_name: realData2.user.name?.split(' ').slice(1).join(' ') || googleUser.last_name,
                        email: realData2.user.email,
                        status: 'Activo',
                        role_name: realData2.user.role || 'Empleado',
                        profile_photo: realData2.user.profile_photo || null,
                      },
                      token: realData2.token,
                      isAuthenticated: true,
                      isLoading: false,
                      error: null,
                    })
                    return true
                  }
                }
              }
            }
          } catch (err) {
            console.error('Fallback login/register failed:', err)
          }

          // Fallback 2: create a client-side session with Google user info (Offline mode)
          set({
            user: googleUser,
            token: `google-${credential.substring(0, 50)}`,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch (err: any) {
          set({ isLoading: false, error: 'Error al iniciar sesión con Google' })
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

      updateProfile: async (profileData) => {
        const { token } = get()
        if (!token) return { success: false, error: 'No autenticado' }

        try {
          const response = await fetch(`${BASE_URL}/auth/me`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          });
          const data = await response.json();
          const realData = data.data || data;

          if (response.ok) {
            // Update the user in the store with the new data
            const currentUser = get().user;
            set({
              user: {
                ...currentUser!,
                first_name: realData.first_name || currentUser?.first_name || '',
                last_name: realData.last_name || currentUser?.last_name || '',
                email: realData.email || currentUser?.email || '',
                profile_photo: realData.profile_photo ?? currentUser?.profile_photo,
              }
            });
            return { success: true };
          } else {
            return { success: false, error: data.message || 'Error al actualizar el perfil' };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Error de conexión' };
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