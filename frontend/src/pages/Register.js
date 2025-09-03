import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        passwordHash: form.password
      })
    });
    const data = await res.json();
    if (res.ok) setMessage('Registro exitoso');
    else setMessage(data);
  };

  return (
    <div>
      <h2>Registro de comerciante</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Correo" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
