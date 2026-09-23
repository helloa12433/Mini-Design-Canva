import { ApiResponse, CanvasData, CanvasMetadata, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${res.status}`
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to parse server response'
    };
  }
}

export const api = {
  // Authentication
  async register(name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });
    const result = await handleResponse<{ user: User; token: string }>(res);
    if (result.success && result.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', result.data.token);
    }
    return result;
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const result = await handleResponse<{ user: User; token: string }>(res);
    if (result.success && result.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', result.data.token);
    }
    return result;
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    return handleResponse(res);
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse<User>(res);
  },

  // Canvas
  async createCanvas(name: string, shapes: any[]): Promise<ApiResponse<CanvasData>> {
    const res = await fetch(`${API_BASE}/api/canvases`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ name, shapes })
    });
    return handleResponse<CanvasData>(res);
  },

  async getCanvases(): Promise<ApiResponse<CanvasMetadata[]>> {
    const res = await fetch(`${API_BASE}/api/canvases`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse<CanvasMetadata[]>(res);
  },

  async getCanvasById(id: string): Promise<ApiResponse<CanvasData>> {
    const res = await fetch(`${API_BASE}/api/canvases/${id}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse<CanvasData>(res);
  },

  async updateCanvas(id: string, name: string, shapes: any[]): Promise<ApiResponse<CanvasData>> {
    const res = await fetch(`${API_BASE}/api/canvases/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ name, shapes })
    });
    return handleResponse<CanvasData>(res);
  },

  async deleteCanvas(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch(`${API_BASE}/api/canvases/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  }
};
