import React, { useEffect, useState } from 'react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setError('Debes iniciar sesión para ver tus pedidos.');
      setLoading(false);
      return;
    }
    // Decodificar el token para obtener el email
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;
  fetch(`/api/order/buyer/${email}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los pedidos.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Cargando pedidos...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 32 }}>
      <h2>Mis pedidos</h2>
      {orders.length === 0 ? (
        <p>No tienes pedidos realizados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>${order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerOrders;
