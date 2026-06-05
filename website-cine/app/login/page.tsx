'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Film, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    // Client-side validation
    if (!email || !password) {
      setValidationError('Por favor complete todos los campos')
      return
    }

    if (!email.includes('@')) {
      setValidationError('Por favor ingrese un email válido')
      return
    }

    // Call login (matches POST /api/auth/login)
    const success = await login({ email, password })
    
    if (success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center transition-transform group-hover:scale-105">
              <Film className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Cine<span className="text-amber-500">Lux</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-gray-400">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Error messages */}
          {(error || validationError) && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error || validationError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link 
                href="/recuperar-contrase%C3%B1a" 
                className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black items-center justify-center p-12 relative overflow-hidden border-l border-zinc-800">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative text-center max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Film className="w-14 h-14 text-black" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Tu experiencia cinematográfica premium
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Reserva tus entradas, elige los mejores asientos y disfruta de las películas más recientes en la mejor calidad.
          </p>
        </div>
      </div>
    </div>
  )
}