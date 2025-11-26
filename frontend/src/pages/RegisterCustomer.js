import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MerchantAuth.css';

const RegisterCustomer = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // registration succeeded — redirect to customer login
        navigate('/customer/login');
      } else {
        setError(data.error || 'Error en el registro');
      }
    } catch (err) {
      console.error('Register customer error', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-auth-root">
      <div className="merchant-auth-card">
        <div className="merchant-auth-header">
          <h2>Crear cuenta</h2>
          <p className="muted">Regístrate para comprar en la tienda</p>
        </div>

        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nombre</span>
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>
          <label className="field">
            <span className="field-label">Correo</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="field">
            <span className="field-label">Contraseña</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          <button className="btn btn-primary full" type="submit" disabled={loading}>{loading ? 'Registrando…' : 'Registrarme'}</button>
          {error && <div className="auth-message">{error}</div>}
        </form>

        <div className="merchant-auth-foot">
          <small>¿Ya tienes cuenta? <Link to="/customer/login">Entrar</Link></small>
        </div>
      </div>
    </div>
  );
};

export default RegisterCustomer;
