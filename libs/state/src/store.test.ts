import { beforeEach, describe, expect, it } from 'vitest';
import { emptyCart, getAppStore } from './index';

describe('global store', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.__MERIDIAN_STORE__;
  });

  it('initializes with an empty cart', () => {
    const store = getAppStore();
    expect(store.getState().cart).toEqual(emptyCart());
    expect(store.getState().user).toBeNull();
  });

  it('updates session and cart', () => {
    const store = getAppStore();
    store.getState().setSession(
      { id: 'u1', name: 'Maya', email: 'maya@meridian.shop', role: 'customer' },
      'token'
    );
    store.getState().setCart({
      items: [
        {
          productId: 'p1',
          name: 'Pourer',
          price: 48,
          quantity: 2,
          image: ''
        }
      ],
      totalItems: 2,
      totalPrice: 96
    });

    expect(store.getState().user?.name).toBe('Maya');
    expect(store.getState().cart.totalItems).toBe(2);
  });

  it('is consumed as a singleton across getAppStore calls', () => {
    const first = getAppStore();
    first.getState().setCart({
      items: [{ productId: 'p1', name: 'Pourer', price: 48, quantity: 1, image: '' }],
      totalItems: 1,
      totalPrice: 48
    });
    expect(getAppStore().getState().cart.totalItems).toBe(1);
  });
});
