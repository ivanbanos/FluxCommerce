import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerMenu = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    navigate('/');
  };
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Obtener direcciones del backend
    const token = localStorage.getItem('customerToken');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;
    fetch(`/api/customer/by-email/${email}`)
      .then(res => res.json())
      .then(data => {
        setAddresses(data.addresses || []);
      });
  }, [success]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('customerToken');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;
    try {
      const res = await fetch('/api/customer/add-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address })
      });
      if (!res.ok) throw new Error('No se pudo agregar la dirección');
      setSuccess(true);
      setAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Menú de Cliente</h2>
      <button style={{ width: '100%', marginBottom: 16, padding: 12, fontSize: 18 }} onClick={() => navigate('/customer/orders')}>Ver mis pedidos</button>
      <form onSubmit={handleAddAddress} style={{ marginBottom: 16 }}>
        <label>Agregar dirección de envío</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 18 }}>Agregar dirección</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 8 }}>¡Dirección agregada!</div>}
      </form>
      <div style={{ marginBottom: 16 }}>
        <label>Direcciones guardadas:</label>
        <ul>
          {addresses.map((addr, idx) => (
            <li key={idx}>{addr}</li>
          ))}
        </ul>
      </div>
      <button style={{ width: '100%', padding: 12, fontSize: 18, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4 }} onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default CustomerMenu;
