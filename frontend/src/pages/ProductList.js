import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductList.css';

export default function ProductList() {
  const params = useParams();
  const { storeId: paramStoreId } = params || {};
  const storeId = paramStoreId || localStorage.getItem('storeId');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        if (!storeId) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/product/list/${storeId}`);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Failed to fetch products', res.status, text);
          setProducts([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        // Helpful debug info when nothing is displayed
        console.debug('Products fetched for store', storeId, 'count:', Array.isArray(data) ? data.length : typeof data, data && data[0]);

        // Normalize product fields from different casings or shapes
        const normalized = (data || []).map(p => ({
          id: p.id || p.Id || p._id,
          name: p.name || p.Name || '',
          description: p.description || p.Description || '',
          price: p.price ?? p.Price ?? 0,
          stock: p.stock ?? p.Stock ?? 0,
          images: p.images || p.Images || [],
          cover: p.cover || p.Cover || (p.images || p.Images || [])[p.coverIndex || p.CoverIndex || 0]
        }));

        setProducts(normalized);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [storeId]);

  if (loading) return <div>Loading...</div>;

  const formatPrice = (value) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    } catch (e) {
      return `$${value}`;
    }
  };

  return (
    <div className="product-grid">
      {products.map(product => (
        <div className="product-card" key={product.id || Math.random()}>
          <div className="product-image">
            {product.cover ? (
              <img src={getImageUrl(product.cover)} alt={product.name} />
            ) : (
              <div style={{ padding: 18, color: '#bbb' }}>No image</div>
            )}
          </div>
          <div className="product-info">
            <h3 className="product-title">{product.name}</h3>
            <div className="product-desc">{product.description ? (product.description.length > 120 ? product.description.slice(0, 120) + '...' : product.description) : ''}</div>
            <div className="product-price-row">
              <div className="product-price">{formatPrice(product.price)}</div>
              <div className="product-badge">{product.stock > 0 ? `${product.stock} in stock` : 'Agotado'}</div>
            </div>
            <div className="product-actions">
              <button
                className="btn btn-primary"
                disabled={product.stock <= 0}
                onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  cover: product.cover,
                  stock: product.stock || 1,
                  storeId: storeId
                })}
              >
                Agregar
              </button>
              <button className="btn btn-secondary">Ver</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
