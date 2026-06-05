'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { BranchesModal } from '@/components/branches-modal'
import { Film, User, LogOut, Menu, X, Ticket, MapPin } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBranchesOpen, setIsBranchesOpen] = useState(false)

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
                href="/billboard" 
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
                    href="/my-bookings"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    <span className="text-sm font-medium">Mis Reservas</span>
                  </Link>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {user.role_name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Salir</span>
                  </button>
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
                    href="/register"
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
                  href="/billboard" 
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
                      href="/my-bookings" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Ticket className="w-4 h-4" />
                      Mis Reservas
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
                      href="/register"
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
