import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Cart, FeatureFlags, Product, User } from '@meridian/shared-types';
import { storage } from '@meridian/utilities';

export interface AppState {
  user: User | null;
  token: string | null;
  cart: Cart;
  selectedProduct: Product | null;
  flags: FeatureFlags;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  setCart: (cart: Cart) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFlags: (flags: FeatureFlags) => void;
}

export const emptyCart = (): Cart => ({ items: [], totalItems: 0, totalPrice: 0 });

const defaultFlags: FeatureFlags = {
  newCheckout: true,
  artisanNotes: true,
  crossTabSync: true
};

const CART_KEY = 'meridian:cart';
const SESSION_KEY = 'meridian:session';

function createAppStore(): StoreApi<AppState> {
  const savedSession = storage.read<{ user: User; token: string } | null>(SESSION_KEY, null);
  const savedCart = storage.read<Cart>(CART_KEY, emptyCart());

  const store = createStore<AppState>((set) => ({
    user: savedSession?.user ?? null,
    token: savedSession?.token ?? null,
    cart: savedCart,
    selectedProduct: null,
    flags: defaultFlags,
    setSession: (user, token) => {
      storage.write(SESSION_KEY, { user, token });
      set({ user, token });
    },
    clearSession: () => {
      storage.remove(SESSION_KEY);
      storage.write(CART_KEY, emptyCart());
      set({ user: null, token: null, cart: emptyCart() });
    },
    setCart: (cart) => {
      storage.write(CART_KEY, cart);
      set({ cart });
    },
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setFlags: (flags) => set({ flags })
  }));

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === CART_KEY && event.newValue) {
        store.getState().setCart(JSON.parse(event.newValue) as Cart);
      }
      if (event.key === SESSION_KEY) {
        const next = event.newValue
          ? (JSON.parse(event.newValue) as { user: User; token: string })
          : null;
        if (next) store.getState().setSession(next.user, next.token);
        else store.getState().clearSession();
      }
    });
  }

  return store;
}

declare global {
  interface Window {
    __MERIDIAN_STORE__?: StoreApi<AppState>;
  }
}

export function getAppStore(): StoreApi<AppState> {
  if (typeof window === 'undefined') {
    return createAppStore();
  }
  if (!window.__MERIDIAN_STORE__) {
    window.__MERIDIAN_STORE__ = createAppStore();
  }
  return window.__MERIDIAN_STORE__;
}

export function useAppStore<T>(selector: (state: AppState) => T): T {
  return useStore(getAppStore(), selector);
}
