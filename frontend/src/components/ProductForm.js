import React, { useState, useEffect } from 'react';

function ProductForm({ onSave, initialData, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: [],
    coverIndex: 0,
    keywords: '' // campo de palabras clave separadas por coma
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        stock: initialData.stock || '',
        images: [], // no pre-carga imágenes
        coverIndex: initialData.coverIndex || 0,
        keywords: initialData.keywords ? initialData.keywords.join(', ') : ''
      });
    } else {
      setForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: [],
        coverIndex: 0
      });
    }
  }, [initialData]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files).slice(0, 5);
    setForm(f => ({ ...f, images: files, coverIndex: 0 }));
  };

  const handleCoverChange = idx => {
    setForm(f => ({ ...f, coverIndex: idx }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || !form.stock) {
      setError('Nombre, precio y stock son obligatorios');
      return;
    }
    if (form.images.length === 0) {
      setError('Debes subir al menos una imagen');
      return;
    }
    if (form.images.length > 5) {
      setError('Máximo 5 imágenes');
      return;
    }
    // Convertir keywords a array
    const keywordsArr = form.keywords.split(',').map(k => k.trim()).filter(k => k);
    onSave({ ...form, keywords: keywordsArr });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <input name="name" placeholder="Nombre del producto" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input name="keywords" placeholder="Palabras clave (separadas por coma)" value={form.keywords} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
        <input name="price" type="number" min="0" step="0.01" placeholder="Precio" value={form.price} onChange={handleChange} required style={{ flex: 1, padding: 8 }} />
        <input name="stock" type="number" min="0" step="1" placeholder="Stock" value={form.stock} onChange={handleChange} required style={{ flex: 1, padding: 8 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Imágenes (máx 5):</label><br />
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {form.images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={URL.createObjectURL(img)} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', border: idx === form.coverIndex ? '2px solid #1976d2' : '1px solid #ccc', borderRadius: 4 }} />
              <input type="radio" name="cover" checked={form.coverIndex === idx} onChange={() => handleCoverChange(idx)} style={{ position: 'absolute', top: 2, left: 2 }} title="Portada" />
            </div>
          ))}
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ flex: 1, padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>{initialData ? 'Actualizar' : 'Guardar producto'}</button>
        {initialData && onCancel && (
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: 10, background: '#eee', color: '#333', border: 'none', borderRadius: 4 }}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default ProductForm;
