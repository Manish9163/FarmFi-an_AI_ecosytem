import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'Seeds', price: '', stock_quantity: '', is_active: true });

  const fetchProducts = () => {
    api.get('/admin/products')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) });
      toast.success('Product created');
      setShowForm(false);
      setForm({ name: '', description: '', category: 'Seeds', price: '', stock_quantity: '', is_active: true });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={labelStyle}>Product Name</label><input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <label style={labelStyle}>Category</label>
                <select required style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Seeds', 'Fertilizer', 'Tools', 'Pesticide', 'Equipment', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Price (₹)</label><input required type="number" step="0.01" style={inputStyle} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div><label style={labelStyle}>Stock Qty</label><input required type="number" style={inputStyle} value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Create Product</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Product Catalog</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{products.length} products</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            + Add Product
          </button>
        </div>
        {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.description?.slice(0, 50)}{p.description?.length > 50 ? '…' : ''}</div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>₹{parseFloat(p.price).toFixed(2)}</td>
                    <td style={{ padding: '12px 20px', color: (p.stock_quantity <= (p.reorder_level || 10)) ? '#dc2626' : '#475569', fontWeight: 600 }}>{p.stock_quantity ?? '—'}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: p.is_active ? '#dcfce7' : '#fee2e2', color: p.is_active ? '#166534' : '#991b1b', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 13, fontWeight: 600 }}>Deactivate</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
