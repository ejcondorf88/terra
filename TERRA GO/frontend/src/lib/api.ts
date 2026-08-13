const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  async register(email: string, password: string, nombre: string, rol: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre, rol }),
    });
    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async getProfile(id: number, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}/users/${id}`, { headers });
    return response.json();
  }

  async getLotes(token: string) {
    const response = await fetch(`${API_URL}/app/lotes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
