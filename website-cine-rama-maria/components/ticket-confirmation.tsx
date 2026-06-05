'use client'

import { useMemo } from 'react'
import { QrCode, Calendar, Clock, MapPin, Film, Armchair, CheckCircle2 } from 'lucide-react'
import type { Movie, Screening, Booking } from '@/lib/api'

interface TicketConfirmationProps {
  movie: Movie
  screening: Screening
  seats: string[]
  booking: Booking
  totalAmount: number
}

export function TicketConfirmation({ 
  movie, 
  screening, 
  seats, 
  booking, 
  totalAmount 
}: TicketConfirmationProps) {
  // Format date
  const formattedDate = useMemo(() => {
    const date = new Date(screening.date_time)
    return {
      date: date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }, [screening.date_time])

  // Generate mock QR data
  const qrData = useMemo(() => {
    return `CINELUX-${booking.booking_id}-${Date.now()}`
  }, [booking.booking_id])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          ¡Reserva Confirmada!
        </h2>
        <p className="text-muted-foreground">
          Tu entrada ha sido generada exitosamente
        </p>
      </div>

      {/* Ticket Card */}
      <div className="relative bg-gradient-to-br from-card to-secondary rounded-2xl overflow-hidden border border-border">
        {/* Gold accent line */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        
        {/* Ticket content */}
        <div className="p-6">
          {/* Movie info */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border border-dashed">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                {movie.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {movie.genre_name} · {movie.duration} min
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {formattedDate.date}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Hora</p>
                <p className="text-sm font-medium text-foreground">
                  {formattedDate.time}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sala</p>
                <p className="text-sm font-medium text-foreground">
                  {screening.room_number} ({screening.room_type})
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Armchair className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Asientos</p>
                <p className="text-sm font-medium text-foreground">
                  {seats.sort().join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          <div className="relative">
            {/* Notch decorations */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-12 rounded-r-full bg-background" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-12 rounded-l-full bg-background" />
            
            <div className="py-6 border-t border-b border-border border-dashed">
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                  Código de entrada
                </p>
                
                {/* Mock QR Code */}
                <div className="w-36 h-36 p-2 bg-white rounded-lg mb-4">
                  <div className="w-full h-full grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs font-mono text-muted-foreground">
                  {qrData}
                </p>
              </div>
            </div>
          </div>

          {/* Total and booking info */}
          <div className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Reserva</p>
              <p className="text-sm font-mono font-medium text-foreground">
                #{booking.booking_id.toString().padStart(6, '0')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total pagado</p>
              <p className="text-2xl font-bold text-primary">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-primary/10 border-t border-primary/20">
          <p className="text-center text-xs text-muted-foreground">
            Presenta este código QR en la entrada del cine. Llega 15 minutos antes de la función.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors">
          Descargar Ticket
        </button>
        <button className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Enviar por Email
        </button>
      </div>
    </div>
  )
}
