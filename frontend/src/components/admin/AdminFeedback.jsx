import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/feedback')
      .then(res => setFeedback(res.data))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>User Feedback Log</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{feedback.length} submissions</p>
        </div>
        <button
          onClick={() => { window.location.href = `http://127.0.0.1:5000/api/v1/admin/feedback/export?format=csv`; }}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Export CSV
        </button>
      </div>
      {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Prediction ID', 'User', 'Predicted Disease', 'Actual Disease', 'Type', 'Comment', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feedback.map(f => (
                <tr key={f.feedback_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{f.feedback_id}</td>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{f.prediction_id}</td>
                  <td style={{ padding: '12px 20px', color: '#475569' }}>{f.user_id}</td>
                  <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.predicted_disease}</td>
                  <td style={{ padding: '12px 20px', color: f.actual_disease ? '#16a34a' : '#94a3b8', fontWeight: f.actual_disease ? 600 : 400 }}>{f.actual_disease || '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      background: f.feedback_type === 'Correct' ? '#dcfce7' : '#fee2e2',
                      color: f.feedback_type === 'Correct' ? '#166534' : '#991b1b',
                      padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12
                    }}>
                      {f.feedback_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.comment || '—'}</td>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{new Date(f.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {feedback.length === 0 && <tr><td colSpan={8} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No feedback submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
