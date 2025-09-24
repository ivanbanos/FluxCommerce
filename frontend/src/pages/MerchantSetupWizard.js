import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MerchantSetupWizard() {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUrl('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/merchant/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ storeName })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess('¡Tienda configurada exitosamente!');
        setUrl(data.url);
      } else {
        setError('No se pudo configurar la tienda.');
      }
    } catch {
      setError('Error de red.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h2>Configura tu tienda</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label>
          Nombre de la tienda:
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            required
            style={{ marginLeft: 8, padding: 6, width: 260 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ marginLeft: 12 }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 16 }}>{success}</div>}
      {url && (
        <div>
          <b>URL de tu tienda:</b> <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </div>
      )}
    </div>
  );
}

export default MerchantSetupWizard;
