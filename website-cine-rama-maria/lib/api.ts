// WEBSITE-CINE / lib / api.ts

const BASE_URL = 'http://localhost:5000/api';

// --- 1. DEFINICIÓN DE TIPOS (Interfaces para TypeScript) ---
export interface Movie {
  movie_id: number;
  id?: number;
  title: string;
  synopsis?: string;
  director: string;
  year?: number;
  genre?: string;
  duration: number;
  poster_url: string;
  status: string;
  genre_id: number;
  genre_name?: string;
}

export interface Screening {
  id?: number;
  screening_id: number;
  movie_id: number;
  room_id: number;
  start_time?: string;
  date?: string;
  price?: number;
  date_time: string;
  movie_title?: string;
  room_number?: string;
  room_type?: string;
}

export interface Booking {
  id?: number;
  booking_id?: number;
  customer_id?: number;
  screening_id: number;
  user_id?: number;
  booking_status?: string;
  created_at?: string;
  customer_name?: string;
  movie_title?: string;
  screening_time?: string;
  staff_name?: string;
  seat_ids?: string[] | number[];
  status?: string;
}

export interface Room {
  id?: number;
  room_id: number;
  name?: string;
  room_number: string;
  capacity?: number;
  total_capacity: number;
  room_type: string;
  room_status: string;
}

export interface Genre {
  genre_id: number;
  name: string;
}

export interface Customer {
  customer_id?: number;
  first_name: string;
  last_name: string;
  cedula?: string;
  phone?: string;
  email?: string;
}

export interface SeatAssignment {
  assignment_id: number;
  seat_number: string;
  booking_id: number;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
  user?: any;
}

export interface RegisterRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

export interface RecoverPasswordRequest {
  email?: string;
}

export interface CreateBookingRequest {
  customer_id?: number;
  screening_id: number;
  user_id?: number;
  booking_status?: string;
}

export interface AssignSeatsRequest {
  bookingId: number;
  seats: string[];
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  cedula?: string;
  phone?: string;
  email?: string;
}


// --- 2. OBJETOS DE LA API (Hacia tus endpoints en plural del Backend) ---

// Módulo de Cine y Cartelera
export const moviesApi = {
  getAll: async (): Promise<{ data: Movie[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/movies`);
    if (!response.ok) throw new Error('Error al cargar películas');
    return response.json();
  },
  getById: async (id: number): Promise<{ data: Movie; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/movies/${id}`);
    if (!response.ok) throw new Error('Error al obtener la película');
    return response.json();
  }
};

export const genresApi = {
  getAll: async (): Promise<{ data: Genre[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/genres`);
    if (!response.ok) throw new Error('Error al cargar géneros');
    return response.json();
  }
};

export const screeningsApi = {
  getAll: async (): Promise<{ data: Screening[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/screenings`);
    if (!response.ok) throw new Error('Error al cargar funciones');
    return response.json();
  },
  getByMovie: async (movieId: number): Promise<{ data: Screening[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/screenings/movie/${movieId}`);
    if (!response.ok) throw new Error('Error al cargar funciones de la película');
    return response.json();
  }
};

export const roomsApi = {
  getAll: async (): Promise<{ data: Room[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/rooms`);
    if (!response.ok) throw new Error('Error al cargar salas');
    return response.json();
  }
};

export const seatsApi = {
  getByRoom: async (roomId: number): Promise<{ data: SeatAssignment[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/seats/room/${roomId}`);
    if (!response.ok) throw new Error('Error al cargar los asientos de la sala');
    return response.json();
  },
  getByBooking: async (bookingId: number): Promise<{ data: SeatAssignment[]; error?: string | null }> => {
    const response = await fetch(`${BASE_URL}/seats/booking/${bookingId}`);
    if (!response.ok) throw new Error('Error al cargar los asientos de la reserva');
    return response.json();
  },
  getAvailability: async (screeningId: number): Promise<string[]> => {
    const response = await fetch(`${BASE_URL}/seats/availability/${screeningId}`);
    if (!response.ok) throw new Error('Error al cargar la disponibilidad de asientos');
    const result = await response.json();
    return result.data || result;
  },
  assign: async (payload: { booking_id?: number; seats: string[] }): Promise<any> => {
    const response = await fetch(`${BASE_URL}/seats/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: payload.booking_id,
        seats: payload.seats
      })
    });
    if (!response.ok) throw new Error('Error al asignar asientos');
    return response.json();
  }
};

// Módulo de Ventas y Reservas
export const bookingsApi = {
  getAll: async (): Promise<{ data: Booking[]; error?: string | null }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/bookings`, { headers });
    if (!response.ok) throw new Error('Error al cargar reservas');
    return response.json();
  },
  getById: async (id: number): Promise<{ data: Booking; error?: string | null }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/bookings/${id}`, { headers });
    if (!response.ok) throw new Error('Error al obtener la reserva');
    return response.json();
  },
  create: async (bookingData: Booking): Promise<{ data: Booking; error?: string | null }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Error al procesar la reserva');
    return response.json();
  },
  cancel: async (id: number): Promise<{ data: any; error?: string | null }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers
    });
    if (!response.ok) throw new Error('Error al cancelar la reserva');
    return response.json();
  }
};