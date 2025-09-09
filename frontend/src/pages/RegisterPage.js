import React, { useState } from 'react';

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    // Validación simple en frontend
    if (!form.email.includes('@')) {
      setMessage('Correo inválido');
      return;
    }
    if (!form.phone || form.phone.length < 7) {
      setMessage('Teléfono inválido');
      return;
    }
    try {
      const res = await fetch('/api/merchant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone
        })
      });
      const data = await res.json();
      if (res.ok) setMessage('Registro exitoso');
      else setMessage(data.error || 'Error en el registro');
    } catch (err) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Registro de comerciante</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input name="email" type="email" placeholder="Correo" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Registrarse</button>
      </form>
      {message && <p style={{ marginTop: 16, color: message === 'Registro exitoso' ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default RegisterPage;
