import { Sprout, AlertTriangle } from 'lucide-react';

export default function CropCard({ crop }) {
  const { crop: name, suitability_pct, risk_warning } = crop;

  return (
    <div className="crop-card card">
      <div className="crop-header">
        <Sprout size={20} color="var(--primary)" />
        <h3>{name}</h3>
      </div>
      <div className="crop-bar-wrap">
        <div
          className="crop-bar"
          style={{
            width: `${suitability_pct}%`,
            background: suitability_pct >= 75
              ? 'var(--green-500)'
              : suitability_pct >= 50
              ? 'var(--amber-500)'
              : 'var(--red-400)',
          }}
        />
      </div>
      <p className="crop-pct">{suitability_pct}% suitability</p>
      {risk_warning && (
        <div className="crop-warning">
          <AlertTriangle size={14} color="var(--warning)" />
          <span>{risk_warning}</span>
        </div>
      )}

      <style>{`
        .crop-card { display: flex; flex-direction: column; gap: 8px; }
        .crop-header { display: flex; align-items: center; gap: 8px; }
        .crop-header h3 { font-size: 1rem; font-weight: 600; }
        .crop-bar-wrap { background: var(--gray-100); border-radius: 999px; height: 8px; }
        .crop-bar { height: 8px; border-radius: 999px; transition: width .5s; }
        .crop-pct { font-size: .8rem; color: var(--text-muted); }
        .crop-warning { display: flex; align-items: center; gap: 6px; font-size: .78rem; color: #92400e; background: #fef9c3; padding: 6px 8px; border-radius: var(--radius-sm); }
      `}</style>
    </div>
  );
}
