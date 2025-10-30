
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/orderApi';

const ShippingPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    // Usar storeId seleccionado en localStorage; si no existe, intentar tomar del primer producto
    const storeId = localStorage.getItem('storeId') || cart[0].storeId || cart[0].store || '';
    const order = {
      buyerName: form.name,
      buyerEmail: form.email,
      storeId,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      products: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      total: cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    };
    try {
      const res = await createOrder(order);
      clearCart();
      navigate('/payment-success', { state: { orderId: res.id } });
    } catch (err) {
      alert('Error al crear el pedido.');
    }
  };

  return (
    <div className="shipping-page">
      <h2>Información de contacto y envío</h2>
      <form onSubmit={handleSubmit} className="shipping-form">
        <label>Nombre completo
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>Dirección
          <input type="text" name="address" value={form.address} onChange={handleChange} required />
        </label>
        <label>Ciudad
          <input type="text" name="city" value={form.city} onChange={handleChange} required />
        </label>
        <label>Código postal
          <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} required />
        </label>
        <label>País
          <input type="text" name="country" value={form.country} onChange={handleChange} required />
        </label>
        <button type="submit">Proceder al pago</button>
      </form>
    </div>
  );
};

export default ShippingPage;
