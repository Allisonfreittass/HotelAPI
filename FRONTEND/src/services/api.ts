const API_BASE_URL = 'http://localhost:3000/api';

export const fetchRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar quartos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    throw error;
  }
};

export const createBooking = async (bookingData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      throw new Error(`Erro ao criar reserva: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    throw error;
  }
};

export const fetchUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Erro ao criar usuário: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(`Erro ao fazer login: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const fetchCurrentUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Erro ao atualizar usuário: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

export const fetchUserBookings = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?user=${userId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar reservas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Erro ao cancelar reserva: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    throw error;
  }
};

// Funções para Avaliações
export const fetchReviews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar avaliações: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    throw error;
  }
};

export const createReview = async (reviewData: any) => {
  try {
    // Obter o token do localStorage (assumindo que você o armazena lá)
    const authToken = localStorage.getItem('authToken'); 
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Incluir o token no cabeçalho Authorization
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(reviewData),
    });
    
    // Se a resposta for 401 ou 403, o token pode estar inválido ou expirado
    if (response.status === 401 || response.status === 403) {
      // Opcional: redirecionar para login ou limpar token
      // localStorage.removeItem('authToken');
      // window.location.href = '/login';
      throw new Error('Não autorizado. Por favor, faça login novamente.');
    }

    if (!response.ok) {
      throw new Error(`Erro ao criar avaliação: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    throw error;
  }
}; 