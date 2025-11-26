import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerMenu.css';

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
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email;
      fetch(`/api/customer/by-email/${email}`)
        .then(res => res.json())
        .then(data => {
          setAddresses(data.addresses || []);
        })
        .catch(err => console.error(err));
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, [success]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('customerToken');
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email;
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
    <div className="customer-menu-container">
      <div className="customer-menu-card">
        <h2 className="customer-menu-title">Menú de Cliente</h2>
        
        <button 
          className="customer-menu-btn btn-secondary" 
          onClick={() => navigate('/customer/orders')}
        >
          Ver mis pedidos
        </button>

        <div className="customer-menu-section">
          <form onSubmit={handleAddAddress}>
            <label className="customer-menu-label">Agregar dirección de envío</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                className="customer-menu-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                placeholder="Calle, Número, Ciudad..."
              />
            </div>
            <button 
              type="submit" 
              className="customer-menu-btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Agregar dirección'}
            </button>
            
            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">¡Dirección agregada!</div>}
          </form>
        </div>

        {addresses.length > 0 && (
          <div className="customer-menu-section">
            <label className="customer-menu-label">Direcciones guardadas:</label>
            <ul className="address-list">
              {addresses.map((addr, idx) => (
                <li key={idx} className="address-item">{addr}</li>
              ))}
            </ul>
          </div>
        )}

        <button 
          className="customer-menu-btn btn-danger" 
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default CustomerMenu;
