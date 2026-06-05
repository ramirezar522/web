'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { MovieCard } from '@/components/movie-card'
import { BookingModal } from '@/components/booking-modal'
import { MovieDetailsModal } from '@/components/moviedetails-modal'
// Importamos la API real y el tipo correcto desde tu lib/api
import { moviesApi, Movie } from '@/lib/api' 
import { Ticket, ArrowRight, Sparkles, Clock, Film } from 'lucide-react'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Llamada al Backend al cargar la página
  useEffect(() => {
    moviesApi.getAll()
      .then((data) => {
        console.log("Películas cargadas desde la BD:", data)
        setMovies(data)
      })
      .catch((error) => {
        console.error("Error conectando con la API de películas:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Lógica dinámica con los datos reales de la Base de Datos
  // Si tu tabla usa strings u otros estados, adáptalo; si no, toma la primera película de la BD como destacada.
  const featuredMovie = movies.find(m => (m as any).status === 'Activa') || movies[0]
  
  // Tomamos hasta 4 películas reales para la vista previa en la cartelera principal
  const previewMovies = movies.slice(0, 4)

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsDetailsOpen(true)
  }

  const handleBookFromDetails = () => {
    setIsDetailsOpen(false)
    setIsBookingOpen(true)
  }

  const handleCloseAll = () => {
    setIsDetailsOpen(false)
    setIsBookingOpen(false)
    setSelectedMovie(null)
  }

  // Pantalla de carga limpia mientras conecta con Express
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <Film className="w-12 h-12 text-primary animate-spin" />
        <p className="font-medium tracking-wide animate-pulse">Conectando con el complejo de CineLux...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Solo se renderiza si hay películas en la Base de Datos */}
      {featuredMovie ? (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
            src={featuredMovie.poster_url}
            alt={featuredMovie.title}
            className="absolute inset-0 w-full h-full object-cover"
              //src={featuredMovie.poster_url || '/placeholder.jpg'}
              //alt={featuredMovie.title}
              //fill
              //className="object-cover"
              //priority
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Estreno Destacado</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                {featuredMovie.title}
              </h1>

              {/* Meta info */}
              <div className="flex items-center flex-wrap gap-4 mb-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{featuredMovie.duration || '120'} min</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span className="px-3 py-1 rounded-full bg-secondary text-sm">
                  {(featuredMovie as any).genre_name || 'Acción / Drama'}
                </span>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {featuredMovie.synopsis || 'Sumérgete en una experiencia cinematográfica única. Las mejores películas, las salas más cómodas y un servicio de primera clase te esperan.'}
              </p>

              {/* CTA Button */}
              <button
                onClick={() => handleMovieSelect(featuredMovie)}
                className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                <Ticket className="w-5 h-5" />
                Reservar Ahora
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No hay ninguna película destacada disponible.
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Film,
                title: 'Última Tecnología',
                description: 'Proyección 4K, sonido Dolby Atmos y salas VIP para la mejor experiencia.'
              },
              {
                icon: Ticket,
                title: 'Reserva Fácil',
                description: 'Selecciona tu película, elige tus asientos y paga en segundos.'
              },
              {
                icon: Sparkles,
                title: 'Estrenos Exclusivos',
                description: 'Sé el primero en ver los blockbusters y películas más esperadas.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
                En Cartelera
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Explora las películas disponibles y reserva tu experiencia cinematográfica
              </p>
            </div>
            <Link 
              href="/billboard"
              className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              Ver todas
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Movie Grid o Aviso de Cartelera Vacía */}
          {movies.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card">
              <p className="text-muted-foreground">No se encontraron películas en la cartelera. Añade registros en tu base de datos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {previewMovies.map(movie => (
              <MovieCard
              key={movie.movie_id || movie.id}
             movie={movie}
              onSelect={handleMovieSelect}
            />
            ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="sm:hidden text-center">
            <Link 
              href="/billboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Ver toda la cartelera
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent blur-3xl" />
            </div>

            <div className="relative p-8 sm:p-12 lg:p-16 text-center">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                ¿Listo para tu próxima aventura cinematográfica?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Únete a CineLux y disfruta de promociones exclusivas, preventas y mucho más.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/billboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl border border-foreground/20 text-foreground font-semibold hover:bg-secondary transition-all"
                >
                  Explorar Cartelera
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                Cine<span className="text-primary">Lux</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <Link href="/billboard" className="hover:text-foreground transition-colors">Cartelera</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2026 CineLux. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal 
          movie={selectedMovie}
          isOpen={isDetailsOpen}
          onClose={handleCloseAll}
          onBook={handleBookFromDetails}
        />
      )}

      {/* Booking Modal */}
      {selectedMovie && (
        <BookingModal 
          movie={selectedMovie}
          isOpen={isBookingOpen}
          onClose={handleCloseAll}
        />
      )}
    </div>
  )
}