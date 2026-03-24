import { useState, useEffect } from 'react';
import { creditService } from '../services/marketService';
import { paymentService } from '../services/paymentService';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuth } from '../hooks/useAuth';
import CreditPanel from '../components/credit/CreditPanel';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_ONLINE_TXN_INR = 5000;

export default function Credit() {
  const { user } = useAuth();
  const { openPayment } = useRazorpay();
  const [account,      setAccount]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount,       setAmount]       = useState('');
  const [repayMethod,  setRepayMethod]  = useState('Online');
  const [repaying,     setRepaying]     = useState(false);
  const [loading,      setLoading]      = useState(true);

  const load = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        creditService.getAccount(),
        creditService.getTransactions(),
      ]);
      setAccount(accRes.data);
      setTransactions(txRes.data);
    } catch {
      toast.error('Failed to load credit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRepay = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }

    if (repayMethod === 'Online' && amt > MAX_ONLINE_TXN_INR) {
      toast.error(`Online repayment limit is ₹${MAX_ONLINE_TXN_INR}. Please split into smaller payments.`);
      return;
    }

    setRepaying(true);

    if (repayMethod === 'Online') {
      // Razorpay secure repayment flow 
      try {
        const { data: rpOrder } = await paymentService.createOrder({ amount: amt });

        openPayment({
          keyId:       rpOrder.key_id,
          orderId:     rpOrder.order_id,
          amount:      rpOrder.amount,
          description: `FarmFi Credit Repayment ₹${amt.toFixed(2)}`,
          prefill:     { name: user?.full_name || '', email: user?.email || '' },
          onSuccess: async (rpResp) => {
            try {
              // Verify signature
              const { data: vData } = await paymentService.verify({
                razorpay_order_id:   rpResp.razorpay_order_id,
                razorpay_payment_id: rpResp.razorpay_payment_id,
                razorpay_signature:  rpResp.razorpay_signature,
              });
              if (!vData.verified) throw new Error('Payment verification failed');

              // Record repayment
              await creditService.repay({ amount: amt, payment_id: rpResp.razorpay_payment_id });
              toast.success(`₹${amt.toFixed(2)} repaid successfully via Razorpay`);
              setAmount('');
              load();
            } catch (err) {
              toast.error(err.response?.data?.error || err.message || 'Repayment recording failed');
            } finally {
              setRepaying(false);
            }
          },
          onFailure: (msg) => {
            if (msg !== 'cancelled') toast.error(msg || 'Payment failed');
            setRepaying(false);
          },
        });
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not initiate payment');
        setRepaying(false);
      }
    } else {
      // Cash / offline repayment 
      try {
        await creditService.repay({ amount: amt });
        toast.success(`₹${amt.toFixed(2)} repaid successfully`);
        setAmount('');
        load();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Repayment failed');
      } finally {
        setRepaying(false);
      }
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div>
      <div className="page-header">
        <h1>💳 Credit Account</h1>
        <p>Manage your farm credit — buy now, pay at harvest</p>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        <div>
          {account && <CreditPanel account={account} />}
        </div>

        {/* Repayment Form */}
        <div className="card">
          <div className="card-header"><h2>Make a Repayment</h2></div>
          <form onSubmit={handleRepay}>
            {/* Payment Method */}
            <div className="form-group">
              <label style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'Online', label: 'Card / UPI', icon: '💳', desc: 'Razorpay' },
                  { value: 'Cash',   label: 'Cash',       icon: '💵', desc: 'Offline' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', border: `2px solid ${repayMethod === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: repayMethod === opt.value ? 'var(--green-50)' : '#fff',
                      transition: 'all .15s', userSelect: 'none',
                    }}
                  >
                    <input type="radio" name="repayMethod" value={opt.value}
                      checked={repayMethod === opt.value}
                      onChange={() => setRepayMethod(opt.value)} hidden />
                    <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {repayMethod === 'Online' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: '.75rem', color: '#072654', fontWeight: 600 }}>
                  <ShieldCheck size={13} /> Secured by Razorpay — 100+ payment modes
                </div>
              )}
              {repayMethod === 'Online' && parseFloat(amount || 0) > MAX_ONLINE_TXN_INR && (
                <div style={{ marginTop: 6, fontSize: '.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                  Limit exceeded: max online payment is ₹{MAX_ONLINE_TXN_INR}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Repayment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 500.00"
              />
            </div>
            {account && (
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Outstanding balance: <strong>₹{parseFloat(account.due_amount || 0).toFixed(2)}</strong>
              </p>
            )}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={repaying || (repayMethod === 'Online' && parseFloat(amount || 0) > MAX_ONLINE_TXN_INR)}
              style={{ width: '100%' }}
            >
              {repaying
                ? 'Processing…'
                : repayMethod === 'Online'
                  ? `Pay Securely ₹${parseFloat(amount || 0).toFixed(2)}`
                  : 'Repay Now'
              }
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><h2>Transaction History</h2></div>
        {transactions.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>No transactions yet.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${tx.transaction_type === 'Charge' ? 'badge-danger' : 'badge-success'}`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {tx.transaction_type === 'Charge' ? '-' : '+'}₹{parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{tx.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
