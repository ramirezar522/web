'use client'

import { useState, useMemo, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { MovieCard } from '@/components/movie-card'
import { BookingModal } from '@/components/booking-modal'
import { mockMovies, mockGenres } from '@/lib/mock-data'
import { moviesApi, genresApi, type Movie, type Genre } from '@/lib/api'
import { Search, Filter, X, Loader2 } from 'lucide-react'

export default function BillboardPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // API data state
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch movies and genres on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Consumimos las promesas con la estructura real de tu api.ts
        const moviesData = await moviesApi.getAll()
        const genresData = await genresApi.getAll()

        // Validamos si el backend responde con el array directo o envuelto en un objeto .data
        const actualMovies = Array.isArray(moviesData) ? moviesData : (moviesData?.data || [])
        const actualGenres = Array.isArray(genresData) ? genresData : (genresData?.data || [])

        setMovies(actualMovies)
        setGenres(actualGenres.length > 0 ? actualGenres : mockGenres)
      } catch (err: any) {
        // Fallback a mock data si falla o si no hay API externa configurada todavía
        if (!process.env.NEXT_PUBLIC_API_URL) {
          setMovies(mockMovies)
          setGenres(mockGenres)
        } else {
          setError(err.message || 'Error al cargar los datos del cine')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter movies based on search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // Validamos si viene como boolean (true) o string ('Activa') para que TypeScript no chille
      const isActive = movie.status === true || movie.status === 'Activa'
      if (!isActive) return false
      
      // Search filter
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            movie.director.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Genre filter
      const matchesGenre = selectedGenre === null || movie.genre_id === selectedGenre
      
      return matchesSearch && matchesGenre
    })
  }, [movies, searchQuery, selectedGenre])

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGenre(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Cartelera
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubre las películas en cartelera y reserva tus entradas
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar películas o directores..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all sm:w-auto
                  ${showFilters || selectedGenre 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary text-foreground border-border hover:border-primary/50'
                  }
                `}
              >
                <Filter className="w-5 h-5" />
                Filtros
                {selectedGenre && (
                  <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Genre filters */}
            {showFilters && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Géneros</h3>
                  {selectedGenre && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Limpiar filtros
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGenre(null)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedGenre === null 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                      }
                    `}
                  >
                    Todos
                  </button>
                  {genres.map(genre => (
                    <button
                      key={genre.genre_id}
                      onClick={() => setSelectedGenre(genre.genre_id)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${selectedGenre === genre.genre_id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                        }
                      `}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando cartelera...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredMovies.length} {filteredMovies.length === 1 ? 'película' : 'películas'}
                  {searchQuery && ` para "${searchQuery}"`}
                  {selectedGenre && ` en ${genres.find(g => g.genre_id === selectedGenre)?.name}`}
                </p>
              </div>

              {/* Movie grid */}
              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMovies.map(movie => (
                    <MovieCard 
                      key={movie.movie_id} 
                      movie={movie} 
                      onSelect={handleMovieSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron películas
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Intenta con otros términos de búsqueda o filtros
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {selectedMovie && (
        <BookingModal 
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedMovie(null)
          }}
        />
      )}
    </div>
  )
}