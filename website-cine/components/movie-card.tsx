'use client'

import Image from 'next/image'
import type { Movie } from '@/lib/api'
import { Clock, User } from 'lucide-react'

interface MovieCardProps {
  movie: Movie
  onSelect: (movie: Movie) => void
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(movie)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
      />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Genre badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
            {movie.genre_name}
          </span>
        </div>

        {/* Status indicator */}
        {movie.status === 'Activa' && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              En cartelera
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="line-clamp-1">{movie.director}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{movie.duration} min</span>
          </div>
        </div>

        {/* View Details button */}
        <button className="mt-4 w-full py-2.5 rounded-lg bg-secondary text-foreground font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Ver Detalles
        </button>
      </div>
    </div>
  )
}
