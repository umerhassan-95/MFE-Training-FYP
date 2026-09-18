import React, { useEffect, useState } from 'react';
import { Card, Loader } from '@meridian/shared-ui';
import { getNisum } from '@meridian/events';
import { useAppStore } from '@meridian/state';
import { apiFetch, currency } from '@meridian/utilities';
import type { Order } from '@meridian/shared-types';

export default function App() {
  const token = useAppStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setOrders(await apiFetch<Order[]>('/api/orders', { token }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    const unsub = getNisum().listener('order:created', (payload) => {
      setNotice(`New order ${payload.orderId} arrived via events.`);
      void load();
    });
    return unsub;
  }, [token]);

  if (loading) return <Loader label="Loading orders…" />;

  return (
    <section>
      <p className="hint">MFE · Orders</p>
      <h2 style={{ marginTop: 0 }}>Orders</h2>
      {notice ? <p className="hint">{notice}</p> : null}
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
      {!orders.length ? (
        <Card style={{ padding: '1.2rem' }}>
          <p>No orders yet. Checkout from the cart remote to create one.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {orders.map((order) => (
            <Card key={order.id} style={{ padding: '1rem 1.2rem' }}>
              <strong>{order.id}</strong>
              <div className="hint">{new Date(order.createdAt).toLocaleString()} · {order.status}</div>
              <p>{order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}</p>
              <p>{currency(order.totalPrice)}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
