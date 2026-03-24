import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCropPredictions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/crop-predictions')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to fetch crop predictions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Crop Prediction Records</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{data.length} predictions logged</p>
      </div>
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'User ID', 'Location', 'Recommended Crops', 'Suitability', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map(row => (
                <tr key={row.prediction_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{row.prediction_id}</td>
                  <td style={{ padding: '12px 20px', color: '#475569' }}>{row.user_id}</td>
                  <td style={{ padding: '12px 20px', color: '#475569' }}>{row.location || '—'}</td>
                  <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof row.recommended_crops === 'string' ? row.recommended_crops : JSON.stringify(row.recommended_crops)}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{row.suitability_score}%</span>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{new Date(row.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No crop predictions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
