import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('Orders MFE', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.__MERIDIAN_STORE__;
    delete window.NISUM;
  });

  it('renders orders without requiring sign in', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Orders' })).toBeInTheDocument();
  });
});
