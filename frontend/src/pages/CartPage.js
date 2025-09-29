
import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';


export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQty } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const navigate = useNavigate();

  if (cart.length === 0) return <div style={{ padding: 32 }}>Tu carrito está vacío.</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h2>Carrito de compras</h2>
      <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left' }}>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={(window.BASE_URL || 'http://localhost:5265') + (item.cover || '/placeholder.png')} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td>
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  disabled={item.qty <= 1}
                  style={{ padding: '2px 8px', marginRight: 4 }}
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={e => updateQty(item.id, Number(e.target.value))}
                  style={{ width: 40, textAlign: 'center' }}
                />
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  style={{ padding: '2px 8px', marginLeft: 4 }}
                >+</button>
              </td>
              <td>${item.price}</td>
              <td>${(item.price * item.qty).toFixed(2)}</td>
              <td>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 24, fontWeight: 'bold', fontSize: 20 }}>Total: ${total.toFixed(2)}</div>
      <button onClick={clearCart} style={{ marginTop: 16, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: 10, cursor: 'pointer' }}>Vaciar carrito</button>
      <button
        style={{ marginTop: 16, marginLeft: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: 10, cursor: 'pointer' }}
        onClick={() => {
          navigate('/shipping');
        }}
      >
        Seleccionar dirección y contacto
      </button>
    </div>
  );
}
