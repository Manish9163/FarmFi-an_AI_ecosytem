import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCredit() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = () => {
    api.get('/admin/credit')
      .then(res => setAccounts(res.data))
      .catch(() => toast.error('Failed to load credit accounts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccounts(); }, []);

  const updateCreditLimit = async (farmerId, newLimit) => {
    if (!newLimit) return;
    try {
      await api.patch(`/admin/users/${farmerId}`, { credit_limit: parseFloat(newLimit) });
      toast.success('Credit limit updated');
      fetchAccounts();
    } catch {
      toast.error('Failed to update credit limit');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Credit Account Management</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{accounts.length} farmer accounts</p>
      </div>
      {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Farmer ID', 'Credit Limit', 'Used', 'Remaining', 'Due Amount', 'Due Date', 'Update Limit'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.farmer_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{acc.farmer_id}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>₹{parseFloat(acc.credit_limit).toFixed(0)}</td>
                  <td style={{ padding: '12px 20px', color: '#dc2626', fontWeight: 600 }}>₹{parseFloat(acc.used_credit).toFixed(0)}</td>
                  <td style={{ padding: '12px 20px', color: '#16a34a', fontWeight: 600 }}>₹{parseFloat(acc.remaining_credit).toFixed(0)}</td>
                  <td style={{ padding: '12px 20px', color: acc.due_amount > 0 ? '#dc2626' : '#64748b', fontWeight: acc.due_amount > 0 ? 700 : 400 }}>₹{parseFloat(acc.due_amount).toFixed(0)}</td>
                  <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{acc.due_date || '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        placeholder={acc.credit_limit}
                        id={`limit-${acc.farmer_id}`}
                        style={{ width: 90, border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none' }}
                      />
                      <button
                        onClick={() => updateCreditLimit(acc.farmer_id, document.getElementById(`limit-${acc.farmer_id}`).value)}
                        style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                      >
                        Set
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && <tr><td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No credit accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
