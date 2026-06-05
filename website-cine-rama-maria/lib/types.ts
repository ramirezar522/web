// Types matching your PostgreSQL schema and Express endpoints
// These types are re-exported from lib/api.ts for convenience

export type {
  // Auth types
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RecoverPasswordRequest,
  
  // Domain types
  Movie,
  Genre,
  Screening,
  Room,
  Booking,
  SeatAssignment,
  Customer,
  
  // Request types
  CreateBookingRequest,
  AssignSeatsRequest,
  CreateCustomerRequest,
} from './api'

// Payment types for the frontend payment flow
export interface PagoMovilData {
  banco: string
  telefono: string
  cedula: string
  monto: number
  referencia: string
}

export interface PayPalData {
  email: string
  monto: number
}

// User type for auth store
export interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  status: 'Activo' | 'Inactivo'
  role_name: 'Gerente' | 'Empleado'
}

// Booking flow state for multi-step booking modal
export interface BookingFlowState {
  movie: import('./api').Movie | null
  screening: import('./api').Screening | null
  selectedSeats: string[]
  customer: import('./api').Customer | null
  paymentMethod: 'pago_movil' | 'paypal' | null
  paymentData: PagoMovilData | PayPalData | null
  booking: import('./api').Booking | null
}
