import React, { useEffect, useState } from 'react';
import { Button, Card } from '@meridian/shared-ui';
import { getNisum } from '@meridian/events';
import { useAppStore } from '@meridian/state';
import { apiFetch } from '@meridian/utilities';
import type { AuthResponse } from '@meridian/shared-types';

export function LoginPanel({ compact = false }: { compact?: boolean }) {
  const setSession = useAppStore((s) => s.setSession);
  const [email, setEmail] = useState('maya@meridian.shop');
  const [password, setPassword] = useState('meridian123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setSession(result.user, result.token);
      getNisum().emit('user:login', result.user);
      getNisum().emit('notification:show', {
        tone: 'success',
        message: `Welcome back, ${result.user.name.split(' ')[0]}.`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ padding: compact ? '0.9rem' : '1.4rem' }}>
      <h2 style={{ marginTop: 0, fontSize: compact ? 15 : undefined }}>Sign in</h2>
      {compact ? null : <p className="hint">maya@meridian.shop / meridian123</p>}
      <form className="login-grid" onSubmit={onSubmit}>
        <input className="ui-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="ui-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}

export function ApiHealth() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    apiFetch<{ status: string }>('/api/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('down'));
  }, []);

  return <p className="hint">API: {status}</p>;
}

export function NotificationHost() {
  const [toasts, setToasts] = useState<Array<{ id: number; tone: string; message: string }>>([]);

  useEffect(() => {
    const unsub = getNisum().listener('notification:show', (payload) => {
      const id = Date.now();
      setToasts((current) => [...current, { id, ...payload }]);
      setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3200);
    });
    return unsub;
  }, []);

  return (
    <div className="ui-toast">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ui-toast-item ui-toast-${toast.tone}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
