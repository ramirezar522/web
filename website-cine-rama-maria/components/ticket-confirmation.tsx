'use client'

import { useMemo, useState, useRef } from 'react'
import { QrCode, Calendar, Clock, MapPin, Film, Armchair, CheckCircle2, Download, Loader2, ExternalLink } from 'lucide-react'
import { type Movie, type Screening, type Booking, bookingsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

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

  // Generate real QR data with ticket details
  const qrData = useMemo(() => {
    return `Reserva: #${booking.booking_id}
Pelicula: ${movie.title}
Fecha: ${formattedDate.date}
Hora: ${formattedDate.time}
Sala: ${screening.room_number} (${screening.room_type})
Asientos: ${seats.sort().join(', ')}
Total: $${totalAmount.toFixed(2)}`.trim();
  }, [booking.booking_id, movie.title, formattedDate, screening, seats, totalAmount])

  const { user } = useAuthStore()
  const ticketCardRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [emailMessage, setEmailMessage] = useState('')

  // URL to the visual ticket page with all data encoded in search params
  const ticketUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      movie: movie.title,
      genre: movie.genre_name || '',
      duration: String(movie.duration || ''),
      date: formattedDate.date,
      time: formattedDate.time,
      room: String(screening.room_number || ''),
      roomType: screening.room_type || '',
      seats: seats.sort().join(', '),
      total: totalAmount.toFixed(2),
    });
    return `${base}/reservas/ticket/${booking.booking_id}?${params.toString()}`;
  }, [booking.booking_id, movie, formattedDate, screening, seats, totalAmount])

  const handleSendEmail = async () => {
    setIsSending(true)
    setEmailStatus('idle')
    setEmailMessage('')

    const recipientEmail = user?.email || undefined;
    const { data, error } = await bookingsApi.sendEmail(booking.booking_id!, recipientEmail)

    if (error) {
      setEmailStatus('error')
      setEmailMessage(error)
    } else {
      setEmailStatus('success')
      setEmailMessage(data?.previewUrl ? `¡Enviado! Puedes previsualizarlo aquí: ${data.previewUrl}` : '¡Ticket enviado al correo con éxito!')
    }
    setIsSending(false)
  }

  const handleDownload = async () => {
    if (!ticketCardRef.current) return
    setIsDownloading(true)
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const canvas = await html2canvas(ticketCardRef.current, {
        backgroundColor: '#0d0d1a',
        scale: 2,
        useCORS: true,
      })
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ticket-cinelux-${booking.booking_id}.webp`
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/webp', 0.95)
    } catch (err) {
      console.error('Error generating ticket image:', err)
    }
    setIsDownloading(false)
  }

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
      <div ref={ticketCardRef} className="relative bg-gradient-to-br from-card to-secondary rounded-2xl overflow-hidden border border-border">
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
                
                {/* Real QR Code - links to visual ticket page */}
                <div className="w-40 h-40 p-2 bg-white rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketUrl)}`}
                    alt={`QR Code para reserva #${booking.booking_id}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                
                <p className="text-xs font-mono text-muted-foreground text-center max-w-[200px]">
                  Reserva #{booking.booking_id?.toString().padStart(6, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Total and booking info */}
          <div className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Reserva</p>
              <p className="text-sm font-mono font-medium text-foreground">
                #{booking.booking_id!.toString().padStart(6, '0')}
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

      {/* Email Status Message */}
      {emailStatus !== 'idle' && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium border ${
          emailStatus === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400 font-semibold' 
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}>
          {emailStatus === 'success' && emailMessage.includes('http') ? (
            <span>
              ¡Ticket enviado!{' '}
              <a href={emailMessage.split('aquí: ')[1]} target="_blank" rel="noreferrer" className="underline hover:text-white font-bold ml-1">
                Ver email (Ethereal inbox) 📬
              </a>
            </span>
          ) : (
            emailMessage
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar (WebP)
              </>
            )}
          </button>
          <button 
            onClick={handleSendEmail}
            disabled={isSending}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSending ? 'Enviando...' : 'Enviar por Email'}
          </button>
        </div>
        <a
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Ticket Visual Completo
        </a>
      </div>
    </div>
  )
}
