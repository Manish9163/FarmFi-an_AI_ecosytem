import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = { disease_name: '', pesticide_name: '', dosage: '', safety_precautions: '' };

const inputStyle = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, outline: 'none',
  color: '#0f172a', boxSizing: 'border-box', background: '#fff'
};
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 };

export default function AdminPesticides() {
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);

  const fetchPesticides = () => {
    setLoading(true);
    api.get('/admin/pesticides')
      .then(res => setPesticides(res.data || []))
      .catch(() => toast.error('Failed to fetch pesticides'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPesticides(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/pesticides/${editId}`, form);
        toast.success('Pesticide updated');
      } else {
        await api.post('/admin/pesticides', form);
        toast.success('Pesticide added');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchPesticides();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (p) => {
    setForm({ disease_name: p.disease_name, pesticide_name: p.pesticide_name, dosage: p.dosage, safety_precautions: p.safety_precautions });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recommendation?')) return;
    try {
      await api.delete(`/admin/pesticides/${id}`);
      toast.success('Deleted');
      fetchPesticides();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
            {editId ? 'Edit Recommendation' : 'Add Recommendation'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Disease Name *</label>
                <input required style={inputStyle} placeholder="e.g. Bacterial Leaf Blight"
                  value={form.disease_name} onChange={e => setForm({ ...form, disease_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Pesticide Name *</label>
                <input required style={inputStyle} placeholder="e.g. Streptomycin"
                  value={form.pesticide_name} onChange={e => setForm({ ...form, pesticide_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Dosage</label>
                <input style={inputStyle} placeholder="e.g. 2g/L water"
                  value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Safety Precautions</label>
                <input style={inputStyle} placeholder="e.g. Wear gloves, avoid inhalation"
                  value={form.safety_precautions} onChange={e => setForm({ ...form, safety_precautions: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {editId ? 'Save Changes' : 'Add Recommendation'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Pesticide Recommendations</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{pesticides.length} records</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null); }}
            style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            + Add New
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Disease', 'Pesticide', 'Dosage', 'Safety', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pesticides.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{p.id}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#0f172a' }}>{p.disease_name}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1px solid #bbf7d0' }}>
                        {p.pesticide_name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#475569' }}>{p.dosage || '—'}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.safety_precautions || '—'}</td>
                    <td style={{ padding: '12px 20px', display: 'flex', gap: 12 }}>
                      <button onClick={() => handleEdit(p)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 600, fontSize: 13 }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontWeight: 600, fontSize: 13 }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {pesticides.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No pesticide records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
