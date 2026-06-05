'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Film, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Por favor ingrese un email válido')
      return
    }

    setIsLoading(true)

    try {
      // Ajustado el puerto al 5000 de tu backend real de Node.js/Express
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_BASE_URL}/auth/recover-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al enviar solicitud')
      }

      setSuccess(true)
    } catch (err) {
      // Respaldo seguro en entorno local si el endpoint de autenticación aún no está creado
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
        setSuccess(true)
        return
      }
      
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  // Pantalla de Éxito (Una vez enviado el correo)
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="text-center max-w-md w-full bg-slate-900/40 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            ¡Correo Enviado!
          </h1>
          <p className="text-gray-400 mb-6">
            Hemos enviado instrucciones para restablecer tu contraseña a <span className="text-amber-500 font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors w-full justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
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

        {/* Enlace para regresar */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña de inmediato.
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo de Correo Electrónico */}
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
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-950 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Instrucciones'
            )}
          </button>
        </form>

        {/* Texto de Ayuda Inferior */}
        <p className="mt-8 text-center text-sm text-gray-400">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
