import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { products } from './data';
import { summarizeCart, type CartItem, type Order, type User } from './types';
import { mountSwagger } from './swagger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const app = express();
const PORT = Number(process.env.API_PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'meridian-dev-secret';

const users: User[] = [
  {
    id: 'u1',
    name: 'Maya Chen',
    email: 'maya@meridian.shop',
    role: 'customer',
    password: 'meridian123'
  },
  {
    id: 'u2',
    name: 'Guest Atelier',
    email: 'guest@meridian.shop',
    role: 'guest',
    password: 'guest123'
  }
];

const carts = new Map<string, CartItem[]>();
const orders = new Map<string, Order[]>();
const startedAt = Date.now();

app.use(cors());
app.use(express.json());
mountSwagger(app);

app.use((req, _res, next) => {
  console.info({
    ts: new Date().toISOString(),
    level: 'info',
    scope: 'api',
    message: `${req.method} ${req.path}`
  });
  next();
});

function identity(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string };
      const user = users.find((u) => u.id === payload.sub);
      if (!user) return res.status(401).json({ message: 'Unknown user' });
      (req as express.Request & { user: User }).user = user;
      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  const guestId = String(req.headers['x-guest-id'] || '').trim();
  if (!guestId) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const id = `guest:${guestId}`;
  let user = users.find((entry) => entry.id === id);
  if (!user) {
    user = {
      id,
      name: 'Guest',
      email: `guest-${guestId.slice(0, 8)}@meridian.shop`,
      role: 'guest',
      password: ''
    };
    users.push(user);
  }
  (req as express.Request & { user: User }).user = user;
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round((Date.now() - startedAt) / 1000),
    service: 'meridian-api'
  });
});

app.get('/api/flags', (_req, res) => {
  res.json({
    newCheckout: process.env.FLAG_NEW_CHECKOUT !== 'false',
    artisanNotes: true,
    crossTabSync: true
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
  const { password: _password, ...safe } = user;
  res.json({ token, user: safe });
});

app.get('/api/products', (req, res) => {
  const category = String(req.query.category || '');
  const q = String(req.query.q || '').toLowerCase();
  const result = products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.artisan.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

app.get('/api/cart', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  res.json(summarizeCart(carts.get(user.id) || []));
});

app.post('/api/cart', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  const { productId, quantity = 1 } = req.body as { productId?: string; quantity?: number };
  const product = products.find((item) => item.id === productId);
  if (!product) return res.status(400).json({ message: 'Invalid product' });
  if (quantity < 1) return res.status(400).json({ message: 'Invalid quantity' });

  const items = carts.get(user.id) || [];
  const existing = items.find((item) => item.productId === product.id);
  if (existing) existing.quantity += quantity;
  else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    });
  }
  carts.set(user.id, items);
  res.status(201).json(summarizeCart(items));
});

app.put('/api/cart/:id', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  const { quantity } = req.body as { quantity?: number };
  const items = carts.get(user.id) || [];
  const item = items.find((entry) => entry.productId === req.params.id);
  if (!item) return res.status(404).json({ message: 'Cart item not found' });
  if (!quantity || quantity < 1) {
    const next = items.filter((entry) => entry.productId !== req.params.id);
    carts.set(user.id, next);
    return res.json(summarizeCart(next));
  }
  item.quantity = quantity;
  carts.set(user.id, items);
  res.json(summarizeCart(items));
});

app.delete('/api/cart/:id', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  const next = (carts.get(user.id) || []).filter((item) => item.productId !== req.params.id);
  carts.set(user.id, next);
  res.json(summarizeCart(next));
});

app.post('/api/orders', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  const items = carts.get(user.id) || [];
  if (!items.length) return res.status(400).json({ message: 'Cart is empty' });
  const order: Order = {
    id: `ord_${Date.now()}`,
    userId: user.id,
    items,
    totalPrice: summarizeCart(items).totalPrice,
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  orders.set(user.id, [order, ...(orders.get(user.id) || [])]);
  carts.set(user.id, []);
  res.status(201).json(order);
});

app.get('/api/orders', identity, (req, res) => {
  const user = (req as express.Request & { user: User }).user;
  res.json(orders.get(user.id) || []);
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error({ level: 'error', scope: 'api', message: error.message });
  res.status(500).json({ message: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.info(`Meridian API ready on http://localhost:${PORT}`);
  console.info(`Swagger UI: http://localhost:${PORT}/api/docs`);
});
