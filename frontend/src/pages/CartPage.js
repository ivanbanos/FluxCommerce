import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
                  <img src={item.cover || '/placeholder.png'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td>{item.qty}</td>
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
      <button style={{ marginTop: 16, marginLeft: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: 10, cursor: 'pointer' }}>Proceder al pago</button>
    </div>
  );
}
