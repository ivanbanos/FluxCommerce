// Utilidad para hacer peticiones a la API
export async function createOrder(order) {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error('Error al crear el pedido');
  return res.json();
}
