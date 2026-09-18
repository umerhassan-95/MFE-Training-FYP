import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Loader, Modal } from '@meridian/shared-ui';
import { getNisum } from '@meridian/events';
import { useAppStore } from '@meridian/state';
import { apiFetch, currency } from '@meridian/utilities';
import type { Cart, Product } from '@meridian/shared-types';
import './products.css';

const categories = ['All', 'Tableware', 'Lighting', 'Textiles', 'Furniture', 'Objects'];

export default function App() {
  const token = useAppStore((s) => s.token);
  const flags = useAppStore((s) => s.flags);
  const setCart = useAppStore((s) => s.setCart);
  const setSelectedProduct = useAppStore((s) => s.setSelectedProduct);
  const selectedProduct = useAppStore((s) => s.selectedProduct);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (query) params.set('q', query);
    apiFetch<Product[]>(`/api/products?${params.toString()}`)
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load catalog'))
      .finally(() => setLoading(false));
  }, [category, query]);

  const visible = useMemo(() => products, [products]);

  async function addToCart(product: Product) {
    try {
      const cart = await apiFetch<Cart>('/api/cart', {
        method: 'POST',
        token,
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      setCart(cart);
      getNisum().emit('cart:item-added', {
        productId: product.id,
        quantity: 1,
        name: product.name
      });
      getNisum().emit('cart:updated', cart);
      getNisum().emit('notification:show', {
        tone: 'success',
        message: `${product.name} added to cart.`
      });
    } catch (err) {
      getNisum().emit('notification:show', {
        tone: 'error',
        message: err instanceof Error ? err.message : 'Could not add to cart'
      });
    }
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    getNisum().emit('product:selected', { productId: product.id });
  }

  if (loading) return <Loader label="Loading products…" />;
  if (error) {
    return (
      <Card className="ui-error">
        <h2>Catalog unavailable</h2>
        <p>{error}</p>
      </Card>
    );
  }

  return (
    <section>
      <div className="catalog-head">
        <div>
          <p className="hint">MFE · Products</p>
          <h2 style={{ margin: 0 }}>Products</h2>
        </div>
        <input
          className="ui-input"
          style={{ maxWidth: 260 }}
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="filters">
        {categories.map((item) => (
          <Button key={item} variant={item === category ? 'primary' : 'ghost'} onClick={() => setCategory(item)}>
            {item}
          </Button>
        ))}
      </div>
      <div className="grid" style={{ marginTop: '1rem' }}>
        {visible.map((product) => (
          <Card key={product.id} className="product-card" onClick={() => openProduct(product)}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="hint">{product.artisan}</p>
            <p className="price">{currency(product.price)}</p>
            <Button
              variant="accent"
              onClick={(event) => {
                event.stopPropagation();
                void addToCart(product);
              }}
            >
              Add to cart
            </Button>
          </Card>
        ))}
      </div>
      <Modal
        open={Boolean(selectedProduct)}
        title={selectedProduct?.name || 'Piece'}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct ? (
          <div className="detail">
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <p>{selectedProduct.description}</p>
            {flags.artisanNotes ? <p className="hint">Made by {selectedProduct.artisan} · {selectedProduct.stock} in the studio.</p> : null}
            <p className="price">{currency(selectedProduct.price)}</p>
            <Button onClick={() => void addToCart(selectedProduct)}>Place in cart</Button>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
