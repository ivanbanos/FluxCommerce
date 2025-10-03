import React, { useState } from 'react';

const RegisterCustomer = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    // TODO: Replace with actual backend endpoint
    try {
      // Example POST request
      // const res = await fetch('/api/customers/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form)
      // });
      // if (!res.ok) throw new Error('Error registering');
      setSuccess(true);
    } catch (err) {
      setError('No se pudo registrar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-customer">
      <h2>Registro de Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>Registrarse</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>¡Registro exitoso!</p>}
    </div>
  );
};

export default RegisterCustomer;
