import axios from 'axios';
import type { Product, Customer, Rental } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData);
    return response.data;
  },
};

export const products = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  create: async (product: Omit<Product, 'id' | 'stockAvailable'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const customers = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  create: async (customer: Omit<Customer, 'id' | 'joinDate'>): Promise<Customer> => {
    const response = await api.post('/customers', customer);
    return response.data;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

export const rentals = {
  getAll: async (): Promise<Rental[]> => {
    const response = await api.get('/rentals');
    return response.data;
  },

  create: async (rental: Omit<Rental, 'id' | 'status'>): Promise<Rental> => {
    const response = await api.post('/rentals', rental);
    return response.data;
  },

  update: async (id: string, rental: Partial<Rental>): Promise<Rental> => {
    const response = await api.put(`/rentals/${id}`, rental);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/rentals/${id}`);
  },

  generateInvoice: async (id: string): Promise<Blob> => {
    const response = await api.get(`/rentals/${id}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },
};