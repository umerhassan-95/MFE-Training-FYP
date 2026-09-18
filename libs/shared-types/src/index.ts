export type UserRole = 'customer' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'placed' | 'packed' | 'shipped';
  createdAt: string;
}

export interface FeatureFlags {
  newCheckout: boolean;
  artisanNotes: boolean;
  crossTabSync: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type NisumEventName =
  | 'user:login'
  | 'user:logout'
  | 'cart:item-added'
  | 'cart:item-removed'
  | 'cart:updated'
  | 'product:selected'
  | 'order:created'
  | 'notification:show';

export interface CartItemAddedPayload {
  productId: string;
  quantity: number;
  name: string;
}

export interface CartItemRemovedPayload {
  productId: string;
}

export interface NotificationPayload {
  tone: 'success' | 'info' | 'error';
  message: string;
}

export interface ProductSelectedPayload {
  productId: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  totalPrice: number;
}

export type NisumEventMap = {
  'user:login': User;
  'user:logout': undefined;
  'cart:item-added': CartItemAddedPayload;
  'cart:item-removed': CartItemRemovedPayload;
  'cart:updated': Cart;
  'product:selected': ProductSelectedPayload;
  'order:created': OrderCreatedPayload;
  'notification:show': NotificationPayload;
};
