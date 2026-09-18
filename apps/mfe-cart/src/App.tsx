import React, { useEffect } from 'react';
import { Button, Card } from '@meridian/shared-ui';
import { getNisum } from '@meridian/events';
import { useAppStore } from '@meridian/state';
import { apiFetch, currency } from '@meridian/utilities';
import type { Cart, Order } from '@meridian/shared-types';
import './cart.css';

export default function App() {
  const token = useAppStore((s) => s.token);
  const cart = useAppStore((s) => s.cart);
  const flags = useAppStore((s) => s.flags);
  const setCart = useAppStore((s) => s.setCart);

  useEffect(() => {
    const unsub = getNisum().listener('cart:item-added', (payload) => {
      getNisum().emit('notification:show', {
        tone: 'info',
        message: `Cart remote received ${payload.name}.`
      });
    });
    return unsub;
  }, []);

  async function refresh() {
    const next = await apiFetch<Cart>('/api/cart', { token });
    setCart(next);
    getNisum().emit('cart:updated', next);
  }

  async function updateQty(productId: string, quantity: number) {
    const next = await apiFetch<Cart>(`/api/cart/${productId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ quantity })
    });
    setCart(next);
    getNisum().emit('cart:updated', next);
  }

  async function removeItem(productId: string) {
    const next = await apiFetch<Cart>(`/api/cart/${productId}`, { method: 'DELETE', token });
    setCart(next);
    getNisum().emit('cart:item-removed', { productId });
    getNisum().emit('cart:updated', next);
  }

  async function checkout() {
    const order = await apiFetch<Order>('/api/orders', { method: 'POST', token });
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
    getNisum().emit('order:created', { orderId: order.id, totalPrice: order.totalPrice });
    getNisum().emit('cart:updated', { items: [], totalItems: 0, totalPrice: 0 });
    getNisum().emit('notification:show', {
      tone: 'success',
      message: `Order ${order.id} placed.`
    });
  }

  return (
    <section>
      <p className="hint">MFE · Cart</p>
      <h2 style={{ marginTop: 0 }}>Cart</h2>
      {!cart.items.length ? (
        <Card style={{ padding: '1.4rem' }}>
          <p>Nothing here yet. Add a piece from the catalog remote.</p>
          <Button variant="ghost" onClick={() => void refresh()}>
            Refresh from API
          </Button>
        </Card>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.items.map((item) => (
              <Card key={item.productId} className="line" style={{ marginBottom: '0.8rem' }}>
                <img src={item.image} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <div className="hint">{currency(item.price)}</div>
                  <div className="qty">
                    <Button variant="ghost" onClick={() => void updateQty(item.productId, item.quantity - 1)}>
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="ghost" onClick={() => void updateQty(item.productId, item.quantity + 1)}>
                      +
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => void removeItem(item.productId)}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
          <Card style={{ padding: '1.2rem', height: 'fit-content' }}>
            <h3>Summary</h3>
            <p>{cart.totalItems} items</p>
            <p className="price" style={{ fontSize: '1.4rem' }}>
              {currency(cart.totalPrice)}
            </p>
            {flags.newCheckout ? (
              <Button variant="accent" onClick={() => void checkout()}>
                Place order
              </Button>
            ) : (
              <p className="hint">Checkout is behind a feature flag.</p>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}
