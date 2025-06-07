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
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ao fazer login: ${response.statusText}`);
    }
    
    return data;
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
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para enviar sua avaliação.');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(reviewData),
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      // Acesso negado
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erro ao criar avaliação: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para continuar.');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erro ao deletar avaliação: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    throw error;
  }
};

export const clearAllReviews = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para continuar.');
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/admin/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erro ao limpar avaliações: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao limpar avaliações:', error);
    throw error;
  }
};

export const createRoom = async (roomData: any) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para continuar.');
    }

    console.log('Enviando dados do quarto:', roomData);
    
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: roomData, // FormData já inclui o Content-Type correto
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      console.error('Erro na resposta:', data);
      throw new Error(data.message || `Erro ao criar quarto: ${response.statusText}`);
    }

    console.log('Quarto criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    throw error;
  }
};

export const updateRoom = async (roomId: string, roomData: any) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para continuar.');
    }

    console.log('Atualizando quarto:', roomId);
    console.log('Dados para atualização:', roomData);
    
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: roomData instanceof FormData ? roomData : JSON.stringify(roomData),
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      console.error('Erro na resposta:', data);
      throw new Error(data.message || `Erro ao atualizar quarto: ${response.statusText}`);
    }

    console.log('Quarto atualizado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error);
    throw error;
  }
};

export const deleteRoom = async (roomId: string) => {
  try {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Não autorizado. Por favor, faça login para continuar.');
    }
    
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(data.message || 'Sua sessão expirou. Por favor, faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error(data.message || 'Você não tem permissão para realizar esta ação.');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erro ao deletar quarto: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao deletar quarto:', error);
    throw error;
  }
}; 