import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getAppStore } from '@meridian/state';
import { installNisum } from '@meridian/events';
import App from './App';

describe('Cart MFE', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.__MERIDIAN_STORE__;
    delete window.NISUM;
    installNisum();
  });

  it('shows an empty cart without requiring sign in', () => {
    render(<App />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it('renders shared cart state', () => {
    getAppStore().getState().setCart({
      items: [
        { productId: 'p1', name: 'Stoneware Pourer', price: 48, quantity: 1, image: '' }
      ],
      totalItems: 1,
      totalPrice: 48
    });
    render(<App />);
    expect(screen.getByText('Stoneware Pourer')).toBeInTheDocument();
    expect(screen.getByText('Place order')).toBeInTheDocument();
  });

  it('receives cart:item-added events from other MFEs', () => {
    const notices: string[] = [];
    window.NISUM!.listener('notification:show', (payload) => notices.push(payload.message));
    render(<App />);
    act(() => {
      window.NISUM!.emit('cart:item-added', {
        productId: 'p1',
        quantity: 1,
        name: 'Stoneware Pourer'
      });
    });
    expect(notices.some((message) => message.includes('Stoneware Pourer'))).toBe(true);
  });

  it('updates when global cart state changes', () => {
    render(<App />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    act(() => {
      getAppStore().getState().setCart({
        items: [{ productId: 'p2', name: 'Wool Throw', price: 128, quantity: 1, image: '' }],
        totalItems: 1,
        totalPrice: 128
      });
    });
    expect(screen.getByText('Wool Throw')).toBeInTheDocument();
  });
});
