import React from 'react';

type Variant = 'primary' | 'accent' | 'ghost';

export function Button({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`ui-btn ui-btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ui-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />;
}

export function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="ui-error" role="status">
      <div className="ui-loader" style={{ margin: '0 auto 1rem' }} />
      <p>{label}</p>
    </div>
  );
}

export function Badge({ value }: { value: number }) {
  if (!value) return null;
  return <span className="ui-badge">{value}</span>;
}

export function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="ui-modal-backdrop" onClick={onClose} role="presentation">
      <div className="ui-modal ui-card" onClick={(e) => e.stopPropagation()} role="dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <h2 style={{ marginTop: 0 }}>{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children?: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { fallback?: React.ReactNode; children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error({
      ts: new Date().toISOString(),
      level: 'error',
      scope: 'error-boundary',
      message: error.message
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="ui-error ui-card">
            <h2>Unable to load module</h2>
            <p>{this.state.message || 'The remote micro frontend is unavailable.'}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
