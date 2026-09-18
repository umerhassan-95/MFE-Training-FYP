import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary, Loader } from './components';

describe('shared UI', () => {
  it('renders a loader label', () => {
    render(<Loader label="Loading products…" />);
    expect(screen.getByText('Loading products…')).toBeInTheDocument();
  });

  it('renders the remote error fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Boom(): React.ReactElement {
      throw new Error('remote down');
    }
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Unable to load module')).toBeInTheDocument();
  });
});
