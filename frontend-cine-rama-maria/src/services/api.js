// Centralized API Service for Cinema Management System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Función auxiliar para centralizar las peticiones HTTP y manejo de Tokens (JWT)
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Si existe un token guardado, lo inyectamos para pasar el authMiddleware del backend
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error en la comunicación con el servidor');
  }

  // Como tu backend usa successResponse(), los datos reales vienen envueltos en .data
  return result.data || result;
};

// ============== AUTH API ==============
export const authApi = {
  // POST /api/auth/login
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Guardamos el token de inmediato para las siguientes consultas
    localStorage.setItem('token', data.token);

    // Adaptamos la respuesta del backend para que v0 no se rompa (necesita el rol en MAYÚSCULAS)
    return {
      token: data.token,
      user: {
        id: data.user.id,
        first_name: data.user.name.split(' ')[0] || '',
        last_name: data.user.name.split(' ')[1] || '',
        role: data.user.role.toUpperCase() // 'GERENTE' o 'EMPLEADO'
      }
    };
  },

  // GET /api/auth/me
  getProfile: async () => {
    const data = await apiRequest('/auth/me');
    return {
      user_id: data.id,
      first_name: data.name.split(' ')[0] || '',
      last_name: data.name.split(' ')[1] || '',
      email: data.email,
      role_name: data.role.toUpperCase()
    };
  }
};

// ============== USERS API ==============
export const usersApi = {
  // GET /api/users (Viene de tu ruta de listado administrada por Gerente)
  getAll: async () => {
    return await apiRequest('/users'); 
  },

  // POST /api/users
  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // PUT /api/users/:id
  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // DELETE /api/users/:id
  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== CUSTOMERS API ==============
export const customersApi = {
  // Si aún no creas este controlador en el backend, conserva este mock temporalmente
  getAll: async () => {
    return [
      { customer_id: 1, first_name: 'Roberto', last_name: 'Sánchez', email: 'roberto@email.com', phone: '555-1234', created_at: '2024-01-15' }
    ];
  },
  create: async (data) => ({ customer_id: Date.now(), ...data }),
  update: async (id, data) => ({ customer_id: id, ...data }),
  delete: async (id) => true
};

// ============== MOVIES API ==============
export const moviesApi = {
  // GET /api/movies
  getAll: async () => {
    return await apiRequest('/movies');
  },

  // GET /api/movies/:id
  getById: async (id) => {
    return await apiRequest(`/movies/${id}`);
  },

  // POST /api/movies
  create: async (movieData) => {
    return await apiRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    });
  },

  // PUT /api/movies/:id
  update: async (id, movieData) => {
    return await apiRequest(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    });
  },

  // DELETE /api/movies/:id
  delete: async (id) => {
    return await apiRequest(`/movies/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== GENRES API ==============
export const genresApi = {
  // GET /api/genres
  getAll: async () => {
    return await apiRequest('/genres');
  },

  // POST /api/genres
  create: async (name) => {
    return await apiRequest('/genres', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },

  // PUT /api/genres/:id
  update: async (id, name) => {
    return await apiRequest(`/genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  },

  // DELETE /api/genres/:id
  delete: async (id) => {
    return await apiRequest(`/genres/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== ROOMS API ==============
export const roomsApi = {
  // GET /api/rooms
  getAll: async () => {
    return await apiRequest('/rooms');
  },

  // POST /api/rooms
  create: async (roomData) => {
    return await apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },

  // PUT /api/rooms/:id
  update: async (id, roomData) => {
    return await apiRequest(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  },

  // DELETE /api/rooms/:id
  delete: async (id) => {
    return await apiRequest(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== SCREENINGS (FUNCIONES) API ==============
export const screeningsApi = {
  // GET /api/screenings
  getAll: async () => {
    return await apiRequest('/screenings');
  },

  // GET /api/screenings/:id (Adaptado para tu controlador)
  getByMovieId: async (movieId) => {
    return await apiRequest(`/screenings/${movieId}`);
  },

  // POST /api/screenings
  create: async (screeningData) => {
    return await apiRequest('/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData)
    });
  },

  // DELETE /api/screenings/:id
  delete: async (id) => {
    return await apiRequest(`/screenings/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== BOOKINGS API ==============
export const bookingsApi = {
  // GET /api/bookings
  getAll: async () => {
    return await apiRequest('/bookings');
  },

  // GET /api/bookings/:id
  getById: async (id) => {
    return await apiRequest(`/bookings/${id}`);
  },

  // POST /api/bookings
  create: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (id) => {
    return await apiRequest(`/bookings/${id}/cancel', {
      method: 'PATCH'
    });
  }
};

// ============== SEATS API ==============
export const seatsApi = {
  // GET /api/seats/booking/:bookingId
  getByBooking: async (bookingId) => {
    return await apiRequest(`/seats/booking/${bookingId}`);
  },

  // POST /api/seats/assign
  assign: async (bookingId, seatsArray) => {
    return await apiRequest('/seats/assign', {
      method: 'POST',
      body: JSON.stringify({ bookingId, seats: seatsArray })
    });
  },

  // GET /api/seats/availability/:screeningId (Real, llamando al backend)
  getAvailability: async (screeningId) => {
    return await apiRequest(`/seats/availability/${screeningId}`);
  }
};

// ============== INVENTORY, MOVEMENTS & DASHBOARD REAL APIs ==============
export const inventoryApi = {
  getAll: async () => {
    const products = await apiRequest('/inventory/products');
    return products.map(p => {
      const stock = p.current_stock ?? 0;
      const minStock = p.min_stock ?? 5;
      const status = stock === 0 ? 'Crítico' : (stock < minStock ? 'Bajo' : 'Normal');
      return {
        item_id: p.product_id,
        name: p.name,
        category: p.category_name || 'Varios',
        stock: stock,
        min_stock: minStock,
        price: p.price || 5.00,
        status: status
      };
    });
  },
  create: async (data) => {
    const categories = {
      'Snacks': 1,
      'Bebidas': 2,
      'Confitería': 3,
      'Comida': 1,
      'Combos': 1,
      'Dulces': 3
    };
    const category_id = categories[data.category] || 1;
    const backendData = {
      name: data.name,
      min_stock: parseInt(data.min_stock) || 5,
      category_id: category_id
    };
    const newProduct = await apiRequest('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
    return {
      item_id: newProduct.product_id,
      name: newProduct.name,
      category: data.category,
      stock: 0,
      min_stock: newProduct.min_stock,
      price: data.price || 5.00,
      status: 'Bajo'
    };
  },
  update: async (id, data) => {
    const categories = {
      'Snacks': 1,
      'Bebidas': 2,
      'Confitería': 3,
      'Comida': 1,
      'Combos': 1,
      'Dulces': 3
    };
    const category_id = categories[data.category] || 1;
    const backendData = {
      name: data.name,
      min_stock: parseInt(data.min_stock) || 5,
      category_id: category_id
    };
    return await apiRequest(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData)
    });
  },
  delete: async (id) => {
    return await apiRequest(`/inventory/products/${id}`, {
      method: 'DELETE'
    });
  }
};

export const movementsApi = {
  getAll: async () => {
    return await apiRequest('/movements');
  },
  create: async (data) => {
    const backendData = {
      user_id: data.user_id || 1,
      product_id: data.item_id,
      movement_type: data.type,
      quantity: parseInt(data.quantity)
    };
    return await apiRequest('/movements', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
  }
};

export const dashboardApi = {
  getStats: async () => {
    return await apiRequest('/dashboard/stats');
  },
  getRecentBookings: async () => {
    return await apiRequest('/dashboard/bookings/recent');
  },
  getRoomOccupancy: async () => {
    return await apiRequest('/dashboard/rooms/occupancy');
  },
  getLowStock: async () => {
    const stockAlerts = await apiRequest('/dashboard/products/low-stock');
    return stockAlerts.map(item => ({
      item_id: item.item_id,
      name: item.name,
      stock: item.stock,
      min_stock: item.min_stock,
      status: item.status
    }));
  }
};