// Utilidad para obtener el merchantId del token JWT
export function getMerchantIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.merchantId || null;
  } catch {
    return null;
  }
}
