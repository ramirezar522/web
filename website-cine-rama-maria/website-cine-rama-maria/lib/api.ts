// WEBSITE-CINE / lib / api.ts

const BASE_URL = 'http://localhost:5000/api';

// --- 1. DEFINICIÓN DE TIPOS (Interfaces para TypeScript) ---
export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  poster_url?: string;
  duration?: number;
  genre_id?: number;
}

export interface Screening {
  id: number;
  movie_id: number;
  room_id: number;
  start_time: string;
  date: string;
  price: number;
}

export interface Booking {
  id?: number;
  customer_id?: number;
  screening_id: number;
  seat_ids: string[] | number[];
  status?: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
}


// --- 2. OBJETOS DE LA API (Hacia tus endpoints en plural del Backend) ---

// Módulo de Cine y Cartelera
export const moviesApi = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/movies`);
    if (!response.ok) throw new Error('Error al cargar películas');
    return response.json();
  },
  getById: async (id: number) => {
    const response = await fetch(`${BASE_URL}/movies/${id}`);
    if (!response.ok) throw new Error('Error al obtener la película');
    return response.json();
  }
};

export const screeningsApi = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/screenings`);
    if (!response.ok) throw new Error('Error al cargar funciones');
    return response.json();
  },
  getByMovie: async (movieId: number) => {
    const response = await fetch(`${BASE_URL}/screenings/movie/${movieId}`);
    if (!response.ok) throw new Error('Error al cargar funciones de la película');
    return response.json();
  }
};

export const roomsApi = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/rooms`);
    if (!response.ok) throw new Error('Error al cargar salas');
    return response.json();
  }
};

export const seatsApi = {
  getByRoom: async (roomId: number) => {
    const response = await fetch(`${BASE_URL}/seats/room/${roomId}`);
    if (!response.ok) throw new Error('Error al cargar los asientos de la sala');
    return response.json();
  },
  getAvailability: async (screeningId: number) => {
    const response = await fetch(`${BASE_URL}/seats/availability/${screeningId}`);
    if (!response.ok) throw new Error('Error al cargar la disponibilidad de asientos');
    const result = await response.json();
    return result.data || result;
  }
};

// Módulo de Ventas y Reservas
export const bookingsApi = {
  create: async (bookingData: Booking) => {
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error('Error al procesar la reserva');
    return response.json();
  }
};