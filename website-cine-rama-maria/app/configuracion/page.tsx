'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { Navbar } from '@/components/navbar'
import {
  ArrowLeft, Lock, Eye, EyeOff, Bell, BellOff, Globe, Moon, Sun,
  Shield, CheckCircle2, AlertCircle, Loader2, Trash2, LogOut, Mail
} from 'lucide-react'

export default function ConfiguracionPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore()

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Preferences state (client-side only)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [language, setLanguage] = useState('es')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' })
      return
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    setIsChangingPassword(true)
    const result = await updateProfile({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    })

    if (result.success) {
      setPasswordMessage({ type: 'success', text: '¡Contraseña actualizada exitosamente!' })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } else {
      setPasswordMessage({ type: 'error', text: result.error || 'Error al cambiar la contraseña' })
    }
    setIsChangingPassword(false)
  }

  const handleDeleteAccount = () => {
    // This would call a real delete endpoint in production
    logout()
    router.push('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Configuración</h1>
              <p className="text-muted-foreground text-sm">Administra la seguridad y preferencias de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Change Password Section */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Cambiar Contraseña</h2>
                    <p className="text-xs text-muted-foreground">Asegura tu cuenta con una contraseña fuerte</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Repite la nueva contraseña"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Message */}
                  {passwordMessage && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}>
                      {passwordMessage.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{passwordMessage.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Contraseña'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
                    <p className="text-xs text-muted-foreground">Controla cómo recibes alertas</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Push notifications toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      {notifications ? (
                        <Bell className="w-5 h-5 text-primary" />
                      ) : (
                        <BellOff className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">Notificaciones push</p>
                        <p className="text-xs text-muted-foreground">Recibe alertas de nuevas funciones</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        notifications ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                        notifications ? 'left-6' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Email notifications toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Notificaciones por email</p>
                        <p className="text-xs text-muted-foreground">Promociones y novedades por correo</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        emailNotifications ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                        emailNotifications ? 'left-6' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Apariencia e Idioma</h2>
                    <p className="text-xs text-muted-foreground">Personaliza tu experiencia visual</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Theme selector */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="w-5 h-5 text-primary" />
                      ) : (
                        <Sun className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">Tema</p>
                        <p className="text-xs text-muted-foreground">
                          {theme === 'dark' ? 'Modo oscuro (Cinematic)' : 'Modo claro'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Language selector */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Idioma</p>
                        <p className="text-xs text-muted-foreground">Idioma de la interfaz</p>
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Información de Cuenta</h2>
                    <p className="text-xs text-muted-foreground">Datos de tu cuenta en CineLux</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rol</p>
                    <p className="text-sm font-semibold text-primary">{user.role_name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                    <p className="text-sm font-semibold text-green-400">{user.status || 'Activo'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correo</p>
                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">Zona de peligro</p>
                      <p className="text-xs text-muted-foreground">Acciones irreversibles</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          logout()
                          router.push('/')
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">¿Eliminar cuenta?</h3>
                    <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Escribe <span className="font-mono text-destructive font-bold">ELIMINAR</span> para confirmar:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 mb-4"
                  placeholder="ELIMINAR"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setDeleteConfirmText('')
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'ELIMINAR'}
                    className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

