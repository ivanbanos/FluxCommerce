
import React from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';


export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQty } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem('customerToken');

  if (cart.length === 0) return (
    <div className="cart-root">
      <div className="empty-cart">
        <h3>Tu carrito está vacío</h3>
        <p>Parece que aún no has agregado productos. Explora la tienda y añade lo que necesites.</p>
        <div style={{ marginTop: 12 }}>
          <button className="btn-primary" onClick={() => navigate('/store')}>Ir a comprar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-root">
      <h2 className="cart-title">Carrito de compras</h2>

      <div className="cart-grid">
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img className="cart-item-img" src={getImageUrl(item.cover)} alt={item.name} />
              <div style={{ flex: 1 }}>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-meta">Precio: ${item.price.toFixed(2)}</div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>-</button>
                    <input className="qty-input" type="number" min={1} value={item.qty} onChange={e => updateQty(item.id, Number(e.target.value))} />
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button className="btn-secondary" onClick={clearCart}>Vaciar carrito</button>
            <button className="btn-primary" onClick={() => { if (isLogged) { navigate('/shipping'); } else { navigate('/customer/login'); } }} disabled={!isLogged} style={{ opacity: isLogged ? 1 : 0.7 }}>
              Seleccionar dirección y contacto
            </button>
          </div>
        </div>

        <aside className="cart-summary">
          <div className="summary-row"><div>Subtotal</div><div>${total.toFixed(2)}</div></div>
          <div className="summary-row"><div>Envío</div><div>Calculado en el siguiente paso</div></div>
          <div style={{ height: 1, background: 'rgba(11,99,184,0.06)', margin: '12px 0' }} />
          <div className="summary-row summary-total"><div>Total</div><div>${total.toFixed(2)}</div></div>
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={() => { if (isLogged) { navigate('/shipping'); } else { navigate('/customer/login'); } }} disabled={!isLogged}>Ir al pago</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
