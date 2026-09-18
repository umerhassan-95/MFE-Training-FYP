export type UserRole = 'customer' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Tableware' | 'Lighting' | 'Textiles' | 'Furniture' | 'Objects';
  description: string;
  image: string;
  stock: number;
  artisan: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'placed' | 'packed' | 'shipped';
  createdAt: string;
}

export function summarizeCart(items: CartItem[]) {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
}
