import React, { useState } from 'react';

function TrackOrders() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);
    setSubmitted(false);
    try {
      const res = await fetch(`/api/order/buyer/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setSubmitted(true);
      } else {
        setError('No se encontraron órdenes para este correo.');
      }
    } catch {
      setError('Error de red.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h2>Rastrea tus órdenes</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label>
          Ingresa tu correo electrónico:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginLeft: 8, padding: 6, width: 260 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ marginLeft: 12 }}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {submitted && orders.length === 0 && <div>No se encontraron órdenes para este correo.</div>}
      {orders.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Fecha</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Total</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Número de guía</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{new Date(order.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{order.status}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>${order.total?.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{order.trackingNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TrackOrders;
