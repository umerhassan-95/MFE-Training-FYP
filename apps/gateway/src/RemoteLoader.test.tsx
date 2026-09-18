import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RemoteLoader } from './RemoteLoader';

describe('Gateway remote loading', () => {
  it('displays a loading state while the remote resolves', () => {
    const Pending = React.lazy(() => new Promise<{ default: React.ComponentType }>(() => undefined));
    render(
      <RemoteLoader label="products">
        <Pending />
      </RemoteLoader>
    );
    expect(screen.getByText('Loading products…')).toBeInTheDocument();
  });

  it('displays an error state when the remote fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Boom(): React.ReactElement {
      throw new Error('remote down');
    }

    render(
      <RemoteLoader label="cart">
        <Boom />
      </RemoteLoader>
    );

    expect(screen.getByText('Unable to load module')).toBeInTheDocument();
    expect(screen.getByText(/cart remote is unavailable/i)).toBeInTheDocument();
  });
});
