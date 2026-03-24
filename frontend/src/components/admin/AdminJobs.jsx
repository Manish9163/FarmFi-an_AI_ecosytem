import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Accepted:  { bg: '#dbeafe', color: '#1e40af' },
  Completed: { bg: '#dcfce7', color: '#166534' },
  Rejected:  { bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/jobs')
      .then(res => setJobs(res.data))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Job Request Monitoring</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{jobs.length} job requests</p>
      </div>
      {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Job ID', 'Farmer ID', 'Worker ID', 'Description', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => {
                const sc = STATUS_COLORS[j.job_status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={j.job_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{j.job_id}</td>
                    <td style={{ padding: '12px 20px', color: '#475569' }}>{j.farmer_id}</td>
                    <td style={{ padding: '12px 20px', color: '#475569' }}>{j.worker_id || '—'}</td>
                    <td style={{ padding: '12px 20px', color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_description}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{j.job_status}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{new Date(j.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {jobs.length === 0 && <tr><td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No jobs found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
