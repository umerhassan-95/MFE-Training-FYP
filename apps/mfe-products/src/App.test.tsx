import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installNisum } from '@meridian/events';

const product = {
  id: 'p1',
  name: 'Stoneware Pourer',
  price: 48,
  category: 'Tableware',
  artisan: 'Hearth Studio',
  stock: 18,
  image: '',
  description: 'A pourer.'
};

vi.mock('@meridian/utilities', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@meridian/utilities')>();
  return {
    ...actual,
    apiFetch: vi.fn(async (path: string) => {
      if (String(path).startsWith('/api/products')) return [product];
      return {
        items: [{ productId: 'p1', name: 'Stoneware Pourer', price: 48, quantity: 1, image: '' }],
        totalItems: 1,
        totalPrice: 48
      };
    }),
    currency: (value: number) => `$${value}`
  };
});

import App from './App';

describe('Products MFE', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.__MERIDIAN_STORE__;
    delete window.NISUM;
    installNisum();
  });

  it('renders catalog pieces from the API', async () => {
    render(<App />);
    expect(await screen.findByText('Stoneware Pourer')).toBeInTheDocument();
    expect(screen.getByText('Add to cart')).toBeInTheDocument();
  });

  it('emits cart:item-added when a product is added', async () => {
    const received: unknown[] = [];
    window.NISUM!.listener('cart:item-added', (data) => received.push(data));
    render(<App />);
    await screen.findByText('Stoneware Pourer');
    fireEvent.click(screen.getByText('Add to cart'));
    await waitFor(() => {
      expect(received).toEqual([
        { productId: 'p1', quantity: 1, name: 'Stoneware Pourer' }
      ]);
    });
  });
});
