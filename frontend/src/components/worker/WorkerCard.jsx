import { User, MapPin, Star, Briefcase } from 'lucide-react';

export default function WorkerCard({ worker, onHire }) {
  const { full_name, skills, daily_rate, location, rating, is_available, worker_id } = worker;
  const skillList = skills?.split(',').map(s => s.trim()).slice(0, 4) || [];

  return (
    <div className="card worker-card">
      <div className="worker-header">
        <div className="worker-avatar">
          <User size={20} color="var(--primary)" />
        </div>
        <div>
          <h3>{full_name}</h3>
          <span className={`badge ${is_available ? 'badge-low' : 'badge-high'}`}>
            {is_available ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>

      <div className="worker-meta">
        <span><MapPin size={13} /> {location || 'N/A'}</span>
        <span><Star size={13} color="var(--amber-500)" /> {parseFloat(rating || 0).toFixed(1)}</span>
        <span><Briefcase size={13} /> ₹{daily_rate}/day</span>
      </div>

      <div className="skill-chips">
        {skillList.map((s) => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
      </div>

      {onHire && is_available && (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
          onClick={() => onHire(worker)}
        >
          Request Worker
        </button>
      )}

      <style>{`
        .worker-card { display: flex; flex-direction: column; gap: 10px; }
        .worker-header { display: flex; align-items: center; gap: 10px; }
        .worker-avatar { width: 40px; height: 40px; background: var(--green-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .worker-header h3 { font-size: .95rem; font-weight: 600; margin-bottom: 2px; }
        .worker-meta { display: flex; gap: 14px; font-size: .78rem; color: var(--text-muted); flex-wrap: wrap; }
        .worker-meta span { display: flex; align-items: center; gap: 4px; }
        .skill-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-chip { background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-200); border-radius: 999px; padding: 2px 10px; font-size: .72rem; font-weight: 500; }
      `}</style>
    </div>
  );
}
