'use client'

import { useRef, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Film, Calendar, Clock, MapPin, Armchair, QrCode, Download, Loader2 } from 'lucide-react'

export default function TicketPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ticketId = params.id as string
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Read ticket data from URL search params (encoded by ticket-confirmation)
  const ticketData = useMemo(() => {
    const movie = searchParams.get('movie') || 'Película'
    const genre = searchParams.get('genre') || ''
    const duration = searchParams.get('duration') || ''
    const date = searchParams.get('date') || '---'
    const time = searchParams.get('time') || '---'
    const room = searchParams.get('room') || '---'
    const roomType = searchParams.get('roomType') || ''
    const seats = searchParams.get('seats') || '---'
    const total = searchParams.get('total') || '0.00'

    return { movie, genre, duration, date, time, room, roomType, seats, total }
  }, [searchParams])

  const hasData = searchParams.get('movie') !== null

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

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 text-center max-w-sm">
          <QrCode className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ticket No Encontrado</h2>
          <p className="text-white/50 text-sm">El ticket solicitado no existe o el enlace está incompleto.</p>
        </div>
      </div>
    )
  }

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
              {ticketData.movie}
            </h1>
            <p className="text-white/40 text-sm">
              {ticketData.genre}{ticketData.genre && ticketData.duration ? ' · ' : ''}{ticketData.duration ? `${ticketData.duration} min` : ''}
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
                <p className="text-sm font-medium text-white capitalize leading-snug">{ticketData.date}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Hora</span>
                </div>
                <p className="text-sm font-medium text-white">{ticketData.time}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Sala</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {ticketData.room}{ticketData.roomType ? ` (${ticketData.roomType})` : ''}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Armchair className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Asientos</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {ticketData.seats}
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
                    #{ticketId.padStart(6, '0')}
                  </p>
                </div>
                {Number(ticketData.total) > 0 && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Total</p>
                    <p className="text-2xl font-bold text-white">
                      ${Number(ticketData.total).toFixed(2)}
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

      {/* Download Button */}
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
