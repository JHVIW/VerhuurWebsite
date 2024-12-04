import { create } from 'zustand';
import { Product, Customer, Rental, User } from '../types';
import * as api from './api';

interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;

  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'stockAvailable'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Customers
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Rentals
  rentals: Rental[];
  fetchRentals: () => Promise<void>;
  addRental: (rental: Omit<Rental, 'id' | 'status'>) => Promise<void>;
  updateRental: (id: string, rental: Partial<Rental>) => Promise<void>;
  deleteRental: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  initAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ currentUser: user });
        // Fetch initial data
        await Promise.all([
          get().fetchProducts(),
          get().fetchCustomers(),
          get().fetchRentals(),
        ]);
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
  login: async (email, password) => {
    try {
      const { access_token } = await api.auth.login(email, password);
      const user = { id: '1', email, name: 'Admin User', role: 'admin' };
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ currentUser: user });
      // Fetch initial data after login
      await Promise.all([
        get().fetchProducts(),
        get().fetchCustomers(),
        get().fetchRentals(),
      ]);
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ currentUser: null, products: [], customers: [], rentals: [] });
  },

  // Products
  products: [],
  fetchProducts: async () => {
    try {
      const products = await api.products.getAll();
      set({ products });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },
  addProduct: async (product) => {
    try {
      const newProduct = await api.products.create(product);
      set((state) => ({ products: [...state.products, newProduct] }));
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },
  updateProduct: async (id, product) => {
    try {
      const updatedProduct = await api.products.update(id, product);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updatedProduct } : p
        ),
      }));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      await api.products.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Customers
  customers: [],
  fetchCustomers: async () => {
    try {
      const customers = await api.customers.getAll();
      set({ customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  },
  addCustomer: async (customer) => {
    try {
      const newCustomer = await api.customers.create(customer);
      set((state) => ({ customers: [...state.customers, newCustomer] }));
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },
  updateCustomer: async (id, customer) => {
    try {
      const updatedCustomer = await api.customers.update(id, customer);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...updatedCustomer } : c
        ),
      }));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
  deleteCustomer: async (id) => {
    try {
      await api.customers.delete(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Rentals
  rentals: [],
  fetchRentals: async () => {
    try {
      const rentals = await api.rentals.getAll();
      set({ rentals });
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  },
  addRental: async (rental) => {
    try {
      const newRental = await api.rentals.create(rental);
      set((state) => ({ rentals: [...state.rentals, newRental] }));
    } catch (error) {
      console.error('Error adding rental:', error);
      throw error;
    }
  },
  updateRental: async (id, rental) => {
    try {
      const updatedRental = await api.rentals.update(id, rental);
      set((state) => ({
        rentals: state.rentals.map((r) =>
          r.id === id ? { ...r, ...updatedRental } : r
        ),
      }));
    } catch (error) {
      console.error('Error updating rental:', error);
      throw error;
    }
  },
  deleteRental: async (id) => {
    try {
      await api.rentals.delete(id);
      set((state) => ({
        rentals: state.rentals.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting rental:', error);
      throw error;
    }
  },
}));

// Initialize auth state when the app loads
useStore.getState().initAuth();