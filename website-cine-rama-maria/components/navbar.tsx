'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { BranchesModal } from '@/components/branches-modal'
import { Film, User, LogOut, Menu, X, Ticket, MapPin, Settings, UserCircle, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBranchesOpen, setIsBranchesOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : ''

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cinema-dark/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center transition-transform group-hover:scale-105">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-2xl font-bold text-foreground tracking-tight">
                Cine<span className="text-primary">Lux</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link 
                href="/cartelera" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Cartelera
              </Link>
              <button
                onClick={() => setIsBranchesOpen(true)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <MapPin className="w-4 h-4" />
                Sucursales
              </button>
              
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/reservas"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    <span className="text-sm font-medium">Mis Reservas</span>
                  </Link>
                  
                  {/* Profile dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {user.profile_photo ? (
                          <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{initials}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.first_name}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-12 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-border bg-secondary/30">
                          <p className="text-sm font-semibold text-foreground">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                            {user.role_name}
                          </span>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/perfil"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                          >
                            <UserCircle className="w-4 h-4 text-primary" />
                            Mi Perfil
                          </Link>
                          <Link
                            href="/configuracion"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4 text-primary" />
                            Configuración
                          </Link>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => { logout(); setIsProfileOpen(false) }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link 
                  href="/cartelera" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cartelera
                </Link>
                <button
                  onClick={() => {
                    setIsBranchesOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2 text-left"
                >
                  <MapPin className="w-4 h-4" />
                  Sucursales
                </button>
                
                {isAuthenticated && user ? (
                  <>
                    <Link 
                      href="/reservas" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Ticket className="w-4 h-4" />
                      Mis Reservas
                    </Link>
                    <Link 
                      href="/perfil" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <Link 
                      href="/configuracion" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <div className="flex items-center gap-2 py-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-2 py-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      className="inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Ticket className="w-4 h-4" />
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Branches Modal */}
      <BranchesModal 
        isOpen={isBranchesOpen} 
        onClose={() => setIsBranchesOpen(false)} 
      />
    </>
  )
}
