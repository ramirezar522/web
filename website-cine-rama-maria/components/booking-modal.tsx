'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronRight, ChevronLeft, Clock, Calendar, MapPin, Film, Check } from 'lucide-react'
import { 
  type Movie, 
  type Screening, 
  type Booking,
  screeningsApi,
  bookingsApi,
  seatsApi,
  roomsApi,
  type Room
} from '@/lib/api'
import { mockScreenings, mockOccupiedSeats, mockRooms, ticketPrices } from '@/lib/mock-data'
import { SeatSelector } from './seat-selector'
import { PaymentGateway } from './payment'
import { TicketConfirmation } from './ticket-confirmation'
import { useAuthStore } from '@/lib/auth-store'

interface BookingModalProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
}

type BookingStep = 'screening' | 'seats' | 'payment' | 'confirmation'

// Payment data types matching backend expectations
interface PagoMovilData {
  banco: string
  telefono: string
  cedula: string
  monto: number
  referencia: string
}

interface PayPalData {
  email: string
  monto: number
}

export function BookingModal({ movie, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('screening')
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Data from API
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Fetch screenings and rooms on mount
  useEffect(() => {
    if (!isOpen) return
    
    const fetchData = async () => {
      setIsLoadingData(true)
      
      // GET /api/screenings
      const { data: screeningsData, error: screeningsError } = await screeningsApi.getAll()
      
      // GET /api/rooms
      const { data: roomsData } = await roomsApi.getAll()
      
      if (screeningsError || !screeningsData) {
        // Fallback to mock data
        setScreenings(mockScreenings.filter(s => s.movie_id === movie.movie_id))
        setRooms(mockRooms)
      } else {
        setScreenings(screeningsData.filter(s => s.movie_id === movie.movie_id))
        setRooms(roomsData || mockRooms)
      }
      
      setIsLoadingData(false)
    }
    
    fetchData()
  }, [isOpen, movie.movie_id])

  // Get room details for selected screening
  const selectedRoom = useMemo(() => {
    if (!selectedScreening) return null
    return rooms.find(r => r.room_id === selectedScreening.room_id) || 
           mockRooms.find(r => r.room_id === selectedScreening.room_id) || 
           null
  }, [selectedScreening, rooms])

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!selectedScreening) return 0
    const pricePerSeat = ticketPrices[selectedScreening.room_type || '2D'] || 8
    return selectedSeats.length * pricePerSeat
  }, [selectedScreening, selectedSeats])

  const handleScreeningSelect = async (screening: Screening) => {
    setSelectedScreening(screening)
    setSelectedSeats([])
    
    try {
      const occupied = await seatsApi.getAvailability(screening.screening_id)
      setOccupiedSeats(occupied || [])
    } catch (err) {
      console.error('Error fetching occupied seats:', err)
      setOccupiedSeats(mockOccupiedSeats[screening.screening_id] || [])
    }
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'screening':
        if (selectedScreening) setCurrentStep('seats')
        break
      case 'seats':
        if (selectedSeats.length > 0) setCurrentStep('payment')
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'seats':
        setCurrentStep('screening')
        break
      case 'payment':
        setCurrentStep('seats')
        break
    }
  }

  const handlePaymentComplete = async (
    method: 'pago_movil' | 'paypal', 
    data: PagoMovilData | PayPalData
  ) => {
    setIsProcessing(true)
    
    try {
      // Step 1: Create booking via POST /api/bookings
      const bookingPayload = {
        customer_id: 1, // In production, this would come from customer creation/lookup
        screening_id: selectedScreening!.screening_id,
        user_id: user?.user_id || 1,
        booking_status: 'Confirmada'
      }
      
      const { data: newBooking, error: bookingError } = await bookingsApi.create(bookingPayload)
      
      let createdBooking: Booking
      
      if (bookingError || !newBooking) {
        // Fallback for demo
        if (!process.env.NEXT_PUBLIC_API_URL) {
          createdBooking = {
            booking_id: Math.floor(Math.random() * 10000) + 1000,
            customer_id: 1,
            screening_id: selectedScreening!.screening_id,
            user_id: user?.user_id || 1,
            booking_status: 'Confirmada',
            created_at: new Date().toISOString(),
            movie_title: movie.title,
            screening_time: selectedScreening!.date_time
          }
        } else {
          throw new Error(bookingError || 'Error creating booking')
        }
      } else {
        createdBooking = {
          ...newBooking,
          movie_title: movie.title,
          screening_time: selectedScreening!.date_time
        }
      }
      
      // Step 2: Assign seats via POST /api/seats/assign
      const seatsPayload = {
        booking_id: createdBooking.booking_id,
        seats: selectedSeats
      }
      
      await seatsApi.assign(seatsPayload)
      
      setBooking(createdBooking)
      setCurrentStep('confirmation')
      
    } catch (err) {
      console.error('Booking error:', err)
      // Still show confirmation for demo purposes
      const mockBooking: Booking = {
        booking_id: Math.floor(Math.random() * 10000) + 1000,
        customer_id: 1,
        screening_id: selectedScreening!.screening_id,
        user_id: user?.user_id || 1,
        booking_status: 'Confirmada',
        created_at: new Date().toISOString(),
        movie_title: movie.title,
        screening_time: selectedScreening!.date_time
      }
      setBooking(mockBooking)
      setCurrentStep('confirmation')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setCurrentStep('screening')
    setSelectedScreening(null)
    setSelectedSeats([])
    setBooking(null)
    onClose()
  }

  if (!isOpen) return null

  // Format screening date/time
  const formatScreeningTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-cinema-dark/90 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 sm:w-14 sm:h-20 relative rounded-lg overflow-hidden flex-shrink-0">
              <img
              src={movie.poster_url}
              alt={movie.title}
              className="object-cover w-full h-full"
            />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground line-clamp-1">
                {movie.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {movie.genre_name} · {movie.duration} min
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'confirmation' && (
          <div className="px-4 sm:px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[
                { key: 'screening', label: 'Función' },
                { key: 'seats', label: 'Asientos' },
                { key: 'payment', label: 'Pago' }
              ].map((step, index) => {
                const stepIndex = ['screening', 'seats', 'payment'].indexOf(currentStep)
                const isActive = currentStep === step.key
                const isCompleted = stepIndex > index

                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary text-muted-foreground'
                        }
                      `}>
                        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`mt-1 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className={`w-12 sm:w-20 h-0.5 mx-2 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Step 1: Select Screening */}
          {currentStep === 'screening' && (
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Selecciona una función
              </h3>
              
              {isLoadingData ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando funciones...</p>
                </div>
              ) : screenings.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay funciones disponibles para esta película</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {screenings.map(screening => {
                    const { date, time } = formatScreeningTime(screening.date_time)
                    const isSelected = selectedScreening?.screening_id === screening.screening_id
                    const price = ticketPrices[screening.room_type || '2D']

                    return (
                      <button
                        key={screening.screening_id}
                        onClick={() => handleScreeningSelect(screening)}
                        className={`
                          w-full p-4 rounded-xl border text-left transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground capitalize">{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">{time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                {screening.room_number}
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                {screening.room_type}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">${price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">por asiento</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Seats */}
          {currentStep === 'seats' && selectedRoom && selectedScreening && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    Selecciona tus asientos
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScreening.room_number} ({selectedScreening.room_type}) · 
                    ${ticketPrices[selectedScreening.room_type || '2D']}/asiento
                  </p>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <SeatSelector
                room={selectedRoom}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={setSelectedSeats}
              />
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 'payment' && (
            <div className="max-w-md mx-auto">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-6 text-center">
                Método de Pago
              </h3>
              <PaymentGateway 
                amount={totalAmount} 
                onPaymentComplete={handlePaymentComplete}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && booking && selectedScreening && (
            <TicketConfirmation
              movie={movie}
              screening={selectedScreening}
              seats={selectedSeats}
              booking={booking}
              totalAmount={totalAmount}
            />
          )}
        </div>

        {/* Footer */}
        {currentStep !== 'confirmation' && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border flex-shrink-0 bg-secondary/30">
            {currentStep !== 'screening' ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </button>
            ) : (
              <div />
            )}
            
            {currentStep !== 'payment' && (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 'screening' && !selectedScreening) ||
                  (currentStep === 'seats' && selectedSeats.length === 0)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Close button for confirmation */}
        {currentStep === 'confirmation' && (
          <div className="p-4 sm:p-6 border-t border-border flex-shrink-0 bg-secondary/30">
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
