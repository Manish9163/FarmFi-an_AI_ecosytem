import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/predictions')
      .then(res => setPredictions(res.data || []))
      .catch(() => toast.error('Failed to load predictions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Disease Prediction Records</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{predictions.length} scans logged</p>
      </div>
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'User ID', 'Image', 'Disease Detected', 'Confidence', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map(p => (
                <tr key={p.prediction_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{p.prediction_id}</td>
                  <td style={{ padding: '12px 20px', color: '#475569' }}>{p.user_id}</td>
                  <td style={{ padding: '12px 20px' }}>
                    {p.image_path
                      ? <img src={p.image_path} alt="plant scan" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      : <span style={{ color: '#cbd5e1', fontSize: 12 }}>No image</span>
                    }
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                      {p.disease_name}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(p.confidence_score * 100).toFixed(0)}%`, height: '100%', background: p.confidence_score > 0.8 ? '#10b981' : p.confidence_score > 0.5 ? '#f59e0b' : '#f43f5e', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', minWidth: 38 }}>{(p.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {predictions.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No predictions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
