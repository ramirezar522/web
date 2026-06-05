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
import { bookingsApi, seatsApi, type Booking, type SeatAssignment } from '@/lib/api'
import { Navbar } from '@/components/navbar'

// Interfaz extendida para incluir los asientos asociados
interface BookingWithSeats extends Booking {
  seats?: SeatAssignment[]
}

// Datos de prueba locales (Mock data)
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
    ]
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
    ]
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
    ]
  },
]

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  
  const [bookings, setBookings] = useState<BookingWithSeats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchBookings()
  }, [isAuthenticated, router])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: apiError } = await bookingsApi.getAll()

    if (apiError) {
      // Respaldo automático con los datos mock en desarrollo si no responde el backend
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
        await new Promise(resolve => setTimeout(resolve, 600))
        setBookings(mockBookings)
        setIsLoading(false)
        return
      }
      
      setError(apiError)
      setIsLoading(false)
      return
    }

    if (data) {
      const bookingsWithSeats: BookingWithSeats[] = await Promise.all(
        data.map(async (booking) => {
          const { data: seats } = await seatsApi.getByBooking(booking.booking_id)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Mis Reservas
            </h1>
            <p className="text-gray-400 text-sm">
              {user ? `${user.first_name} ${user.last_name}` : 'Historial de reservas'}
            </p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium">Error al cargar reservas</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Estado Vacío (Sin Reservas) */}
        {bookings.length === 0 && !error && (
          <div className="text-center py-16 bg-slate-900/20 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No tienes reservas activas
            </h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
              Explora nuestra cartelera y reserva tus puestos para tu próxima experiencia cinematográfica.
            </p>
            <Link
              href="/cartelera"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
            >
              <Film className="w-5 h-5" />
              Ver Cartelera
            </Link>
          </div>
        )}

        {/* Lista de Reservas */}
        {bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const upcoming = booking.screening_time ? isUpcoming(booking.screening_time) : false
              const isCancelled = booking.booking_status === 'Cancelada'

              return (
                <div 
                  key={booking.booking_id}
                  className={`
                    p-6 rounded-2xl border transition-all backdrop-blur-sm
                    ${isCancelled 
                      ? 'bg-slate-950/40 border-white/5 opacity-50' 
                      : upcoming 
                        ? 'bg-slate-900/40 border-amber-500/30 hover:border-amber-500/50' 
                        : 'bg-slate-950/40 border-white/5 opacity-75'
                    }
                  `}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Información de la Película */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                                <XCircle className="w-3 h-3" />
                                Cancelada
                              </span>
                            ) : upcoming ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                                <CheckCircle className="w-3 h-3" />
                                Próxima
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-500/10 text-gray-400 border border-white/5">
                                Pasada
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            {booking.movie_title}
                          </h3>
                        </div>
                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/5 text-gray-400">
                          ID: #{booking.booking_id}
                        </span>
                      </div>

                      {/* Detalles de la función */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 border-y border-white/5 py-3 my-3">
                        {booking.screening_time && (
                          <>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar className="w-4 h-4 text-amber-500" />
                              <span className="text-sm capitalize">
                                {formatDate(booking.screening_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span className="text-sm">
                                {formatTime(booking.screening_time)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="text-sm">
                            Sala {booking.screening_id}
                          </span>
                        </div>
                      </div>

                      {/* Puestos / Asientos */}
                      {booking.seats && booking.seats.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Ticket className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-400">Asientos asignados:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {booking.seats.map((seat) => (
                              <span 
                                key={seat.assignment_id}
                                className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              >
                                {seat.seat_number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Código QR y Acciones de Cancelación */}
                    <div className="flex flex-col items-center justify-center gap-3 lg:self-center bg-slate-950/50 p-4 rounded-xl border border-white/5 min-w-[140px]">
                      {!isCancelled && upcoming ? (
                        <>
                          <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-black/50">
                            <QrCode className="w-full h-full text-black" />
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking.booking_id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium hover:underline mt-1"
                          >
                            Cancelar reserva
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Ticket className="w-8 h-8 text-gray-700 mx-auto mb-1" />
                          <span className="text-xs text-gray-500 font-medium">No disponible</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadatos de la Reserva */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                      Reservado el {formatDate(booking.created_at)}
                    </span>
                    {booking.staff_name && (
                      <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
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
    </div>
  )
}