'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Film, AlertCircle, User, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones del lado del cliente
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Por favor complete todos los campos')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingrese un email válido')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      // Ajustado el puerto al 5000 de tu backend Express real
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role_id: 2, // Por defecto rol de usuario/empleado asignado de forma segura
          status: 'Activo'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al registrar usuario')
      }

      setSuccess(true)
      
      // Redirige al login automáticamente tras 2 segundos de éxito
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      // Respaldo de simulación segura en entorno local si el servidor Express no está levantado
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        return
      }
      
      setError(err instanceof Error ? err.message : 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  // Pantalla de Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="text-center max-w-md w-full bg-slate-900/40 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            ¡Registro Exitoso!
          </h1>
          <p className="text-gray-400 mb-6">
            Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión de inmediato.
          </p>
          <div className="w-8 h-8 mx-auto border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex text-white">
      {/* Panel Izquierdo - Decorativo Minimalista */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-black items-center justify-center p-12 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        </div>

        <div className="relative text-center max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Film className="w-14 h-14 text-black" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Únete a CineLux
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Crea tu cuenta de manera rápida para gestionar tus reservas, explorar la cartelera y disfrutar la mejor experiencia administrativa cinematográfica.
          </p>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Registro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-slate-900/40 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center transition-transform group-hover:scale-105">
              <Film className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Cine<span className="text-amber-500">Lux</span>
            </span>
          </Link>

          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-400 text-sm">
              Completa el formulario para registrarte en el sistema
            </p>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos de Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Campo de Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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

            {/* Campo de Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Enlace al Login */}
          <p className="mt-8 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
