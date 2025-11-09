import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MerchantAuth.css';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // registration succeeded — redirect to login with a success message
        navigate('/merchant/login');
      } else {
        setMessage(data.error || data || 'Error en el registro');
      }
    } catch (err) {
      console.error('Register error', err);
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-auth-root">
      <div className="merchant-auth-card">
        <div className="merchant-auth-header">
          <h2>Crear cuenta de tienda</h2>
          <p className="muted">Registra tu tienda y empieza a vender</p>
        </div>

        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nombre</span>
            <input name="name" placeholder="Nombre de la tienda" value={form.name} onChange={handleChange} required />
          </label>

          <label className="field">
            <span className="field-label">Correo</span>
            <input name="email" type="email" placeholder="tu@correo.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          </label>

          <button className="btn btn-primary full" type="submit" disabled={loading}>{loading ? 'Registrando…' : 'Crear cuenta'}</button>
          {message && <div className="auth-message">{message}</div>}
        </form>

        <div className="merchant-auth-foot">
          <small>¿Ya tienes cuenta? <Link to="/merchant/login">Entrar</Link></small>
        </div>
      </div>
    </div>
  );
}

export default Register;
