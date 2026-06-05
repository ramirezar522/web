'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Film, 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  QrCode,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { bookingsApi, seatsApi, type Booking, type SeatAssignment, type Movie } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { MovieDetailsModal } from '@/components/moviedetails-modal'

// Extended booking with seats for display
interface BookingWithSeats extends Booking {
  seats?: SeatAssignment[]
}

// Mock bookings for development
const mockBookings: BookingWithSeats[] = [
  {
    booking_id: 1001,
    customer_id: 1,
    screening_id: 1,
    user_id: 1,
    booking_status: 'Confirmada',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Juan Pérez',
    movie_title: 'Dune: Parte Dos',
    screening_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    staff_name: 'Admin',
    seats: [
      { assignment_id: 1, seat_number: 'C4', booking_id: 1001 },
      { assignment_id: 2, seat_number: 'C5', booking_id: 1001 },
    ],
    movie_id: 1,
    director: 'Denis Villeneuve',
    duration: 166,
    poster_url: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    genre_name: 'Ciencia Ficción'
  },
  {
    booking_id: 1002,
    customer_id: 1,
    screening_id: 4,
    user_id: 1,
    booking_status: 'Confirmada',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Juan Pérez',
    movie_title: 'Oppenheimer',
    screening_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    staff_name: 'Admin',
    seats: [
      { assignment_id: 3, seat_number: 'D6', booking_id: 1002 },
    ],
    movie_id: 2,
    director: 'Christopher Nolan',
    duration: 180,
    poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    genre_name: 'Drama'
  },
  {
    booking_id: 1003,
    customer_id: 1,
    screening_id: 8,
    user_id: 1,
    booking_status: 'Cancelada',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Juan Pérez',
    movie_title: 'John Wick 4',
    screening_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    staff_name: 'Admin',
    seats: [
      { assignment_id: 4, seat_number: 'A1', booking_id: 1003 },
      { assignment_id: 5, seat_number: 'A2', booking_id: 1003 },
      { assignment_id: 6, seat_number: 'A3', booking_id: 1003 },
    ],
    movie_id: 4,
    director: 'Chad Stahelski',
    duration: 169,
    poster_url: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    genre_name: 'Acción'
  },
]

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, token, user } = useAuthStore()
  
  const [bookings, setBookings] = useState<BookingWithSeats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleOpenMovieDetails = (booking: BookingWithSeats) => {
    const movieObj: Movie = {
      movie_id: booking.movie_id || 0,
      title: booking.movie_title || '',
      director: booking.director || 'N/A',
      duration: booking.duration || 0,
      poster_url: booking.poster_url || '/placeholder.jpg',
      status: 'Activa',
      genre_id: 0,
      genre_name: booking.genre_name || 'Drama',
    }
    setSelectedMovie(movieObj)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchBookings()
  }, [isAuthenticated, router])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)

    // GET /api/bookings with Bearer token
    const { data, error: apiError } = await bookingsApi.getAll()

    if (apiError) {
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setBookings(mockBookings)
        setIsLoading(false)
        return
      }
      
      setError(apiError)
      setIsLoading(false)
      return
    }

    if (data) {
      // Fetch seats for each booking
      const bookingsWithSeats: BookingWithSeats[] = await Promise.all(
        data.map(async (booking: Booking) => {
          const { data: seats } = await seatsApi.getByBooking(booking.booking_id!)
          return { ...booking, seats: seats || [] }
        })
      )
      setBookings(bookingsWithSeats)
    }

    setIsLoading(false)
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('¿Está seguro que desea cancelar esta reserva?')) return

    const { error: apiError } = await bookingsApi.cancel(bookingId)

    if (apiError && process.env.NEXT_PUBLIC_API_URL) {
      setError(apiError)
      return
    }

    // Update local state
    setBookings(prev => 
      prev.map(b => 
        b.booking_id === bookingId 
          ? { ...b, booking_status: 'Cancelada' } 
          : b
      )
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isUpcoming = (screeningTime: string) => {
    return new Date(screeningTime) > new Date()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Mis Reservas
            </h1>
            <p className="text-muted-foreground">
              {user ? `${user.first_name} ${user.last_name}` : 'Historial de reservas'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive font-medium">Error al cargar reservas</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {bookings.length === 0 && !error && (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              No tienes reservas
            </h2>
            <p className="text-muted-foreground mb-6">
              Explora nuestra cartelera y reserva tu próxima experiencia cinematográfica
            </p>
            <Link
              href="/cartelera"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Film className="w-5 h-5" />
              Ver Cartelera
            </Link>
          </div>
        )}

        {/* Bookings list */}
        {bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const upcoming = booking.screening_time ? isUpcoming(booking.screening_time) : false
              const isCancelled = booking.booking_status === 'Cancelada'

              return (
                <div 
                  key={booking.booking_id}
                  className={`
                    p-6 rounded-2xl border transition-all
                    ${isCancelled 
                      ? 'bg-secondary/30 border-border opacity-60' 
                      : upcoming 
                        ? 'bg-card border-primary/30' 
                        : 'bg-secondary/30 border-border'
                    }
                  `}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Movie Poster */}
                    {booking.poster_url && (
                      <div 
                        onClick={() => handleOpenMovieDetails(booking)}
                        className="w-20 h-28 relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity border border-border bg-secondary"
                      >
                        <img 
                          src={booking.poster_url} 
                          alt={booking.movie_title} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                    {/* Movie info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-destructive/20 text-destructive">
                                <XCircle className="w-3 h-3" />
                                Cancelada
                              </span>
                            ) : upcoming ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                Próxima
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                                Pasada
                              </span>
                            )}
                          </div>
                          <h3 
                            onClick={() => handleOpenMovieDetails(booking)}
                            className="font-serif text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                          >
                            {booking.movie_title}
                          </h3>
                          <button
                            onClick={() => handleOpenMovieDetails(booking)}
                            className="text-xs text-primary hover:underline mt-1 block font-medium"
                          >
                            Ver información de la película
                          </button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          #{booking.booking_id}
                        </span>
                      </div>

                      {/* Screening details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {booking.screening_time && (
                          <>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground capitalize">
                                {formatDate(booking.screening_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground">
                                {formatTime(booking.screening_time)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">
                            Sala {booking.screening_id}
                          </span>
                        </div>
                      </div>

                      {/* Seats */}
                      {booking.seats && booking.seats.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Asientos:</span>
                          <div className="flex gap-1">
                            {booking.seats.map((seat) => (
                              <span 
                                key={seat.assignment_id}
                                className="px-2 py-0.5 text-xs font-medium rounded bg-primary/20 text-primary"
                              >
                                {seat.seat_number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QR Code and actions */}
                    <div className="flex flex-col items-center gap-4">
                      {!isCancelled && upcoming && (
                        <>
                          <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                            <QrCode className="w-full h-full text-cinema-dark" />
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking.booking_id!)}
                            className="text-sm text-destructive hover:text-destructive/80 transition-colors"
                          >
                            Cancelar reserva
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Booking metadata */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Reservado el {formatDate(booking.created_at!)}
                    </span>
                    {booking.staff_name && (
                      <span>
                        Atendido por: {booking.staff_name}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onBook={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  )
}
