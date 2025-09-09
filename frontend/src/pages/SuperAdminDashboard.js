import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('adminName');
  const email = localStorage.getItem('adminEmail');
  const token = localStorage.getItem('adminToken');
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState('');
  const [search, setSearch] = useState('');
  const filteredMerchants = merchants.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetch('/api/merchant/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMerchants(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar comerciantes');
        setLoading(false);
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    navigate('/admin-login');
  };

  const handleValidate = async (id) => {
    setValidating(id);
    setError('');
    try {
      const res = await fetch('/api/merchant/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ merchantId: id })
      });
      if (res.ok) {
        setMerchants(merchants => merchants.map(m => m.id === id ? { ...m, state: 'active' } : m));
      } else {
        setError('No se pudo validar');
      }
    } catch {
      setError('Error de red');
    }
    setValidating('');
  };

  if (!token) return null;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Superadmin Dashboard</h2>
      <p>Bienvenido, <b>{name}</b> ({email})</p>
      <button onClick={handleLogout} style={{ marginBottom: 24, padding: 10, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4 }}>Cerrar sesión</button>
      <h3>Comerciantes</h3>
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 300, padding: 8, marginBottom: 16 }}
      />
      {loading ? <p>Cargando...</p> : null}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Nombre</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Correo</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Teléfono</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredMerchants.map(m => (
            <tr key={m.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.email}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.phone}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.state}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                {m.state !== 'active' ? (
                  <button onClick={() => handleValidate(m.id)} disabled={!!validating} style={{ padding: 6, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                    {validating === m.id ? 'Validando...' : 'Validar'}
                  </button>
                ) : '✔️'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuperAdminDashboard;
