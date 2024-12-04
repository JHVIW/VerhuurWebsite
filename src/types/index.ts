export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
    deposit: number;
  };
  stockTotal: number;
  stockAvailable: number;
  imageUrl?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  homeAddress: Address;
  deliveryAddress?: Address;
  joinDate: string;
}

export interface RentalItem {
  productId: string;
  quantity: number;
  dailyPrice: number;
  deposit: number;
}

export interface Rental {
  id: string;
  customerId: string;
  items: RentalItem[];
  startDate: string;
  endDate: string;
  status: 'active' | 'overdue' | 'completed' | 'cancelled';
  totalPrice: number;
  totalDeposit: number;
  deliveryAddress?: Address;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}