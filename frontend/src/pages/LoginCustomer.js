import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MerchantAuth.css';

const LoginCustomer = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de login');
      localStorage.setItem('customerToken', data.token);
      navigate('/customer/menu');
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merchant-auth-root">
      <div className="merchant-auth-card" role="main">
        <div className="merchant-auth-header">
          <h2>Iniciar sesión</h2>
          <p className="muted">Accede para comprar en FluxCommerce</p>
        </div>

        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Correo</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className="field">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span className="field-label">Contraseña</span>
              <button type="button" className="small-link" onClick={() => setShowPassword(s => !s)} style={{background:'none',border:'none',color:'#0d47a1',cursor:'pointer'}}> {showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required />
          </label>

          <button className="btn btn-primary full" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          {error && <div className="auth-message">{error}</div>}
        </form>

        <div className="merchant-auth-foot">
          <small>¿No tienes cuenta? <Link to="/customer/register">Regístrate</Link></small>
        </div>
      </div>
    </div>
  );
};

export default LoginCustomer;
