'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { bookingsApi, seatsApi, moviesApi, screeningsApi } from '@/lib/api'
import { Film, Calendar, Clock, MapPin, Armchair, QrCode, Download, Loader2 } from 'lucide-react'
import type { Booking, Movie, Screening } from '@/lib/api'

export default function TicketPage() {
  const params = useParams()
  const ticketId = params.id as string
  const ticketRef = useRef<HTMLDivElement>(null)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [screening, setScreening] = useState<Screening | null>(null)
  const [seats, setSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function loadTicket() {
      try {
        // Fetch booking data
        const { data: bookingData, error: bookingError } = await bookingsApi.getById(Number(ticketId))
        if (bookingError || !bookingData?.booking_id) {
          setError('Ticket no encontrado')
          setLoading(false)
          return
        }
        setBooking(bookingData)

        // Fetch seats
        const { data: seatsData } = await seatsApi.getByBooking(bookingData.booking_id!)
        const seatNames = seatsData?.map((s: any) => s.seat_number || `A${s.assignment_id}`) || []
        setSeats(seatNames)

        // Fetch screening
        if (bookingData.screening_id) {
          const { data: allScreenings } = await screeningsApi.getAll()
          const scr = allScreenings.find((s: Screening) => s.screening_id === bookingData.screening_id)
          if (scr) {
            setScreening(scr)
            // Fetch movie
            if (scr.movie_id) {
              const { data: movieData } = await moviesApi.getById(scr.movie_id)
              if (movieData) setMovie(movieData)
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el ticket')
      }
      setLoading(false)
    }
    if (ticketId) loadTicket()
  }, [ticketId])

  const formattedDate = screening?.date_time ? (() => {
    const date = new Date(screening.date_time)
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  })() : { date: '---', time: '---' }

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return
    setIsDownloading(true)
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0d0d1a',
        scale: 2,
        useCORS: true,
      })
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ticket-cinelux-${ticketId}.webp`
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/webp', 0.95)
    } catch (err) {
      console.error('Error generating image:', err)
    }
    setIsDownloading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-white/60 text-sm">Cargando ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 text-center max-w-sm">
          <QrCode className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ticket No Encontrado</h2>
          <p className="text-white/50 text-sm">{error || 'El ticket solicitado no existe o ha expirado.'}</p>
        </div>
      </div>
    )
  }

  const totalAmount = (screening as any)?.price ? Number((screening as any).price) * seats.length : 0

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Visual Ticket Card */}
      <div
        ref={ticketRef}
        className="w-full max-w-md mx-auto"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* Ticket Container */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#1a1a2e] rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-500/5">
          
          {/* Header with gold gradient */}
          <div className="relative px-6 pt-6 pb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5" />
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  Cine<span className="text-amber-500">Lux</span>
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Confirmado</span>
              </div>
            </div>

            {/* Movie Title */}
            <h1 className="text-2xl font-bold text-white mb-1 leading-tight">
              {movie?.title || booking.movie_title || 'Película'}
            </h1>
            <p className="text-white/40 text-sm">
              {movie?.genre_name || ''}{movie?.genre_name && movie?.duration ? ' · ' : ''}{movie?.duration ? `${movie.duration} min` : ''}
            </p>
          </div>

          {/* Info Grid */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Fecha</span>
                </div>
                <p className="text-sm font-medium text-white capitalize leading-snug">{formattedDate.date}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Hora</span>
                </div>
                <p className="text-sm font-medium text-white">{formattedDate.time}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Sala</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {screening?.room_number || '---'}{screening?.room_type ? ` (${screening.room_type})` : ''}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Armchair className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Asientos</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {seats.length > 0 ? seats.sort().join(', ') : '---'}
                </p>
              </div>
            </div>

            {/* Tear Line */}
            <div className="relative my-2">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-10 rounded-r-full bg-[#0d0d1a]" />
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-10 rounded-l-full bg-[#0d0d1a]" />
              <div className="border-t border-dashed border-white/10" />
            </div>

            {/* QR + Booking ID + Total */}
            <div className="flex items-center gap-5 pt-4">
              {/* Real QR */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 bg-white rounded-xl p-1.5 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      typeof window !== 'undefined' 
                        ? window.location.href 
                        : `https://cinelux.com/reservas/ticket/${ticketId}`
                    )}`}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Booking details */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Reserva</p>
                  <p className="text-lg font-mono font-bold text-amber-500">
                    #{booking.booking_id?.toString().padStart(6, '0')}
                  </p>
                </div>
                {totalAmount > 0 && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Total</p>
                    <p className="text-2xl font-bold text-white">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-amber-500/5 border-t border-amber-500/10">
            <p className="text-center text-[11px] text-white/30">
              Presenta este código QR en la entrada del cine · Llega 15 min antes
            </p>
          </div>
        </div>
      </div>

      {/* Download Button (outside the ticket for capture) */}
      <button
        onClick={handleDownloadImage}
        disabled={isDownloading}
        className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando imagen...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Descargar Ticket (WebP)
          </>
        )}
      </button>
    </div>
  )
}
