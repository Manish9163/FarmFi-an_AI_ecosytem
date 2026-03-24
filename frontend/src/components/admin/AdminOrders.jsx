import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: { bg: '#fef9c3', color: '#854d0e' },
  Processing: { bg: '#dbeafe', color: '#1e40af' },
  Shipped: { bg: '#ede9fe', color: '#6d28d9' },
  Delivered: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to fetch orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Order Management</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{orders.length} total orders</p>
      </div>
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Order ID', 'Farmer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const sc = STATUS_COLORS[o.status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>#{o.id}</td>
                    <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 500 }}>{o.farmer_name}</td>
                    <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 600 }}>₹{parseFloat(o.total_amount).toFixed(2)}</td>
                    <td style={{ padding: '12px 20px', color: '#475569' }}>{o.payment_method}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#94a3b8', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <select
                        onChange={e => { if (e.target.value) updateStatus(o.id, e.target.value); }}
                        defaultValue=""
                        style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#475569', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="" disabled>Change status</option>
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
