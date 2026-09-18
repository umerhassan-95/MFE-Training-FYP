import React, { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button } from '@meridian/shared-ui';
import { getNisum } from '@meridian/events';
import { useAppStore } from '@meridian/state';
import { apiFetch, logger } from '@meridian/utilities';
import type { Cart, FeatureFlags } from '@meridian/shared-types';
import { RemoteLoader } from './RemoteLoader';
import { LoginPanel, NotificationHost, ApiHealth } from './panels';

const ProductsApp = React.lazy(() => import('products/App'));
const CartApp = React.lazy(() => import('cart/App'));
const OrdersApp = React.lazy(() => import('orders/App'));
const log = logger('gateway');

export default function App() {
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const cart = useAppStore((s) => s.cart);
  const flags = useAppStore((s) => s.flags);
  const setCart = useAppStore((s) => s.setCart);
  const setFlags = useAppStore((s) => s.setFlags);
  const clearSession = useAppStore((s) => s.clearSession);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith('/cart')
    ? 'Cart'
    : location.pathname.startsWith('/orders')
      ? 'Orders'
      : 'Catalog';

  useEffect(() => {
    apiFetch<FeatureFlags>('/api/flags')
      .then(setFlags)
      .catch((error) => log.warn('Flags unavailable', { error: String(error) }));
  }, [setFlags]);

  useEffect(() => {
    apiFetch<Cart>('/api/cart', { token })
      .then(setCart)
      .catch((error) => log.warn('Cart hydrate failed', { error: String(error) }));
  }, [token, setCart]);

  useEffect(() => {
    const events = getNisum();
    const unsubscribers = [
      events.listener('cart:updated', setCart),
      events.listener('order:created', () => navigate('/orders')),
      events.listener('user:logout', () => navigate('/'))
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [navigate, setCart]);

  function logout() {
    clearSession();
    getNisum().emit('user:logout');
    getNisum().emit('notification:show', { tone: 'info', message: 'Signed out of Meridian.' });
  }

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          Meridian
          <span>Shop</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Catalog
          </NavLink>
          <NavLink to="/cart">
            Cart <Badge value={cart.totalItems} />
          </NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
        <div className="user-box">
          {user ? (
            <>
              <div>
                <strong>{user.name}</strong>
                <div className="hint">{user.email}</div>
              </div>
              <Button variant="ghost" onClick={logout}>
                Out
              </Button>
            </>
          ) : (
            <LoginPanel compact />
          )}
        </div>
        {flags.artisanNotes ? <p className="hint">Feature flag: artisan notes are on.</p> : null}
        {flags.newCheckout ? <p className="hint">Feature flag: checkout is on.</p> : null}
        <ApiHealth />
      </aside>
      <main className="stage">
        <div className="topbar">
          <div>
            <div className="hint">Gateway</div>
            <h1 style={{ margin: '0.2rem 0 0' }}>{pageTitle}</h1>
          </div>
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <RemoteLoader label="products">
                <ProductsApp />
              </RemoteLoader>
            }
          />
          <Route
            path="/cart"
            element={
              <RemoteLoader label="cart">
                <CartApp />
              </RemoteLoader>
            }
          />
          <Route
            path="/orders"
            element={
              <RemoteLoader label="orders">
                <OrdersApp />
              </RemoteLoader>
            }
          />
        </Routes>
      </main>
      <NotificationHost />
    </div>
  );
}
