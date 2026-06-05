import type { Movie, Genre, Screening, Room } from './types'

// Mock data aligned with your PostgreSQL schema

export const mockGenres: Genre[] = [
  { genre_id: 1, name: 'Acción' },
  { genre_id: 2, name: 'Drama' },
  { genre_id: 3, name: 'Comedia' },
  { genre_id: 4, name: 'Terror' },
  { genre_id: 5, name: 'Ciencia Ficción' },
  { genre_id: 6, name: 'Romance' },
  { genre_id: 7, name: 'Animación' },
]

export const mockMovies: Movie[] = [
  {
    movie_id: 1,
    title: 'Dune: Parte Dos',
    director: 'Denis Villeneuve',
    duration: 166,
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 5,
    genre_name: 'Ciencia Ficción'
  },
  {
    movie_id: 2,
    title: 'Oppenheimer',
    director: 'Christopher Nolan',
    duration: 180,
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 2,
    genre_name: 'Drama'
  },
  {
    movie_id: 3,
    title: 'Spider-Man: Across the Spider-Verse',
    director: 'Joaquim Dos Santos',
    duration: 140,
    poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 7,
    genre_name: 'Animación'
  },
  {
    movie_id: 4,
    title: 'John Wick 4',
    director: 'Chad Stahelski',
    duration: 169,
    poster_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 1,
    genre_name: 'Acción'
  },
  {
    movie_id: 5,
    title: 'Barbie',
    director: 'Greta Gerwig',
    duration: 114,
    poster_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 3,
    genre_name: 'Comedia'
  },
  {
    movie_id: 6,
    title: 'The Conjuring 4',
    director: 'James Wan',
    duration: 112,
    poster_url: 'https://images.unsplash.com/photo-1505635552518-3b72d4d7d74c?w=400&h=600&fit=crop',
    status: 'Activa',
    genre_id: 4,
    genre_name: 'Terror'
  },
]

export const mockRooms: Room[] = [
  { room_id: 1, room_number: 'Sala 1', total_capacity: 120, room_type: '2D', room_status: 'Disponible' },
  { room_id: 2, room_number: 'Sala 2', total_capacity: 80, room_type: '3D', room_status: 'Disponible' },
  { room_id: 3, room_number: 'Sala VIP', total_capacity: 40, room_type: 'VIP', room_status: 'Disponible' },
]

// Generate screenings for today and tomorrow
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const formatDate = (date: Date, hours: number, minutes: number) => {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const mockScreenings: Screening[] = [
  // Dune screenings
  { screening_id: 1, date_time: formatDate(today, 14, 0), movie_id: 1, room_id: 1, movie_title: 'Dune: Parte Dos', room_number: 'Sala 1', room_type: '2D' },
  { screening_id: 2, date_time: formatDate(today, 17, 30), movie_id: 1, room_id: 2, movie_title: 'Dune: Parte Dos', room_number: 'Sala 2', room_type: '3D' },
  { screening_id: 3, date_time: formatDate(today, 21, 0), movie_id: 1, room_id: 3, movie_title: 'Dune: Parte Dos', room_number: 'Sala VIP', room_type: 'VIP' },
  
  // Oppenheimer screenings
  { screening_id: 4, date_time: formatDate(today, 15, 0), movie_id: 2, room_id: 1, movie_title: 'Oppenheimer', room_number: 'Sala 1', room_type: '2D' },
  { screening_id: 5, date_time: formatDate(today, 19, 0), movie_id: 2, room_id: 3, movie_title: 'Oppenheimer', room_number: 'Sala VIP', room_type: 'VIP' },
  
  // Spider-Man screenings
  { screening_id: 6, date_time: formatDate(today, 13, 0), movie_id: 3, room_id: 2, movie_title: 'Spider-Man: Across the Spider-Verse', room_number: 'Sala 2', room_type: '3D' },
  { screening_id: 7, date_time: formatDate(today, 16, 30), movie_id: 3, room_id: 1, movie_title: 'Spider-Man: Across the Spider-Verse', room_number: 'Sala 1', room_type: '2D' },
  
  // John Wick screenings
  { screening_id: 8, date_time: formatDate(today, 20, 0), movie_id: 4, room_id: 1, movie_title: 'John Wick 4', room_number: 'Sala 1', room_type: '2D' },
  { screening_id: 9, date_time: formatDate(tomorrow, 18, 0), movie_id: 4, room_id: 2, movie_title: 'John Wick 4', room_number: 'Sala 2', room_type: '3D' },
  
  // Barbie screenings
  { screening_id: 10, date_time: formatDate(today, 12, 0), movie_id: 5, room_id: 1, movie_title: 'Barbie', room_number: 'Sala 1', room_type: '2D' },
  { screening_id: 11, date_time: formatDate(tomorrow, 15, 30), movie_id: 5, room_id: 3, movie_title: 'Barbie', room_number: 'Sala VIP', room_type: 'VIP' },
  
  // Conjuring screenings
  { screening_id: 12, date_time: formatDate(today, 22, 0), movie_id: 6, room_id: 2, movie_title: 'The Conjuring 4', room_number: 'Sala 2', room_type: '3D' },
]

// Simulated occupied seats per screening (for demo)
export const mockOccupiedSeats: Record<number, string[]> = {
  1: ['A3', 'A4', 'B5', 'B6', 'C7', 'D2', 'D3'],
  2: ['B2', 'B3', 'C4', 'C5', 'E1', 'E2'],
  3: ['A1', 'A2', 'B1', 'B2'],
  4: ['C3', 'C4', 'C5', 'D3', 'D4', 'D5'],
  5: ['A5', 'A6', 'B5', 'B6'],
  6: ['B1', 'B2', 'B3', 'C1', 'C2'],
  7: ['D4', 'D5', 'E4', 'E5'],
  8: ['A1', 'A2', 'A3', 'B1', 'B2'],
  9: ['C2', 'C3', 'D2', 'D3'],
  10: ['E5', 'E6', 'E7'],
  11: ['A3', 'A4', 'B3', 'B4'],
  12: ['C1', 'C2', 'D1', 'D2', 'E1'],
}

// Ticket prices by room type
export const ticketPrices: Record<string, number> = {
  '2D': 8.00,
  '3D': 12.00,
  'VIP': 20.00,
}

// Venezuelan banks for Pago Móvil
export const venezuelanBanks = [
  'Banco de Venezuela',
  'Banesco',
  'Banco Mercantil',
  'BBVA Provincial',
  'Banco del Caribe',
  'Banco Exterior',
  'Banco Nacional de Crédito',
  'Banplus',
  'Banco Activo',
  'Bancamiga',
]
