import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export default function CreditPanel({ account }) {
  if (!account) return null;

  const { credit_limit, used_credit, remaining_credit, due_amount, due_date } = account;
  const usedPct = (parseFloat(used_credit) / parseFloat(credit_limit)) * 100;

  return (
    <div className="card credit-panel">
      <div className="card-header">
        <CreditCard size={20} color="var(--primary)" />
        <h2>Credit Account</h2>
      </div>

      <div className="credit-limit-bar">
        <div className="bar-track">
          <div
            className="bar-fill"
            style={{
              width: `${Math.min(usedPct, 100)}%`,
              background: usedPct > 80 ? 'var(--danger)' : usedPct > 50 ? 'var(--warning)' : 'var(--primary)',
            }}
          />
        </div>
        <p className="bar-label">{usedPct.toFixed(0)}% of limit used</p>
      </div>

      <div className="credit-stats">
        <div className="cstat">
          <p className="cstat-val">₹{parseFloat(credit_limit).toLocaleString()}</p>
          <p className="cstat-label">Credit Limit</p>
        </div>
        <div className="cstat">
          <p className="cstat-val" style={{ color: 'var(--green-600)' }}>₹{parseFloat(remaining_credit ?? credit_limit - used_credit).toLocaleString()}</p>
          <p className="cstat-label">Available</p>
        </div>
        <div className="cstat">
          <p className="cstat-val" style={{ color: 'var(--danger)' }}>₹{parseFloat(due_amount).toLocaleString()}</p>
          <p className="cstat-label">Due Amount</p>
        </div>
      </div>

      {due_date && parseFloat(due_amount) > 0 && (
        <div className="alert alert-warning" style={{ marginTop: 12 }}>
          <AlertCircle size={16} />
          <span>Payment due by {new Date(due_date).toLocaleDateString()}</span>
        </div>
      )}

      <style>{`
        .credit-panel {}
        .credit-limit-bar { margin-bottom: 20px; }
        .bar-track { background: var(--surface-low); border-radius: 999px; height: 8px; margin-bottom: 6px; overflow: hidden; }
        .bar-fill { height: 8px; border-radius: 999px; transition: width .6s cubic-bezier(0.16, 1, 0.3, 1); }
        .bar-label { font-size: .72rem; color: var(--text-muted); font-weight: 500; }
        .credit-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; }
        .cstat-val { font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
        .cstat-label { font-size: .68rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }
      `}</style>
    </div>
  );
}
