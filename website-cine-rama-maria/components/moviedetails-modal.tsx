'use client'

import Image from 'next/image'
import { X, Clock, User, Calendar, Film, Ticket } from 'lucide-react'
import type { Movie } from '@/lib/api'

interface MovieDetailsModalProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
  onBook: () => void
}

export function MovieDetailsModal({ movie, isOpen, onClose, onBook }: MovieDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-cinema-dark/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-cinema-dark/80 hover:bg-cinema-dark transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Poster */}
          <div className="relative w-full md:w-2/5 aspect-[2/3] md:aspect-auto">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="object-cover w-full h-full"
          />
            {/* Gradient overlay for mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col">
            {/* Genre badge */}
            <div className="mb-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                {movie.genre_name}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              {movie.title}
            </h2>

            {/* Movie Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Director */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Director</span>
                </div>
                <p className="font-medium text-foreground">{movie.director}</p>
              </div>

              {/* Duration */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Duración</span>
                </div>
                <p className="font-medium text-foreground">{movie.duration} minutos</p>
              </div>

              {/* Genre */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Género</span>
                </div>
                <p className="font-medium text-foreground">{movie.genre_name}</p>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Estado</span>
                </div>
                <div className="flex items-center gap-2">
                  {movie.status === 'Activa' && (
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                  <p className="font-medium text-foreground">
                    {movie.status === 'Activa' ? 'En Cartelera' : movie.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Description placeholder */}
            <p className="text-muted-foreground mb-8 leading-relaxed flex-grow">
              Disfruta de esta increíble película en nuestras salas con la mejor tecnología 
              de proyección y sonido envolvente. Una experiencia cinematográfica que no 
              olvidarás.
            </p>

            {/* Book Button */}
            <button
              onClick={onBook}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <Ticket className="w-5 h-5" />
              Reservar Entradas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
