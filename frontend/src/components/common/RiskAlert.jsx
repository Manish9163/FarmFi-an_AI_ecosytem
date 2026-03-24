import { AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

const CONFIG = {
  Low:    { icon: ShieldCheck,   cls: 'alert-success', label: 'Low Risk — conditions are safe' },
  Medium: { icon: AlertTriangle, cls: 'alert-warning', label: 'Medium Risk — monitor closely' },
  High:   { icon: AlertOctagon,  cls: 'alert-error',   label: 'High Risk — immediate action needed' },
};

export default function RiskAlert({ risk }) {
  if (!risk) return null;
  const { risk_level, probability_score, crop_type, factors } = risk;
  const cfg = CONFIG[risk_level] || CONFIG.Medium;
  const Icon = cfg.icon;

  return (
    <div className={`alert ${cfg.cls}`} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <Icon size={18} />
        <span>{crop_type} — {cfg.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '.8rem' }}>{probability_score}%</span>
      </div>
      {factors && (
        <ul style={{ marginTop: 8, paddingLeft: 24, fontSize: '.8rem' }}>
          {factors.high_humidity    && <li>High humidity detected</li>}
          {factors.high_temperature && <li>High temperature stress</li>}
          {factors.high_rainfall    && <li>Excessive rainfall risk</li>}
        </ul>
      )}
    </div>
  );
}
