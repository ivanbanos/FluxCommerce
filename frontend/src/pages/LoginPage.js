import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MerchantAuth.css';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await fetch('/api/merchant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('merchantName', data.name);
        localStorage.setItem('merchantEmail', data.email);
        navigate('/select-store');
      } else {
        setMessage(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Login error', err);
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-auth-root">
      <div className="merchant-auth-card" role="main">
        <div className="merchant-auth-header">
          <h2>FluxCommerce — Tienda</h2>
          <p className="muted">Accede a tu panel de vendedor</p>
        </div>

        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Correo</span>
            <input name="email" type="email" placeholder="tu@correo.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          </label>

          <button className="btn btn-primary full" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          {message && <div className="auth-message">{message}</div>}
        </form>

        <div className="merchant-auth-foot">
          <small>¿No tienes cuenta? <a href="/merchant/register">Regístrate</a></small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
