import { useState } from 'react';
import { Lock, BarChart3, Eye, EyeOff, Activity } from 'lucide-react';

/**
 * AdminResultPanel — Technical details for admins/experts ONLY.
 * Shows: confidence score, raw class name, severity metrics.
 * This panel should NEVER be shown to regular farmers.
 */
export default function AdminResultPanel({ explanation, result }) {
  const [unlocked, setUnlocked] = useState(false);

  if (!explanation || !result) return null;
  const admin = explanation.admin_view;
  if (!admin) return null;

  if (!unlocked) {
    return (
      <div style={{
        marginTop: 16, padding: 16, borderRadius: 'var(--radius)',
        background: 'var(--surface-low)', border: '1px dashed var(--border)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Lock size={18} color="var(--text-muted)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Expert / Admin Mode</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Technical model details are hidden from farmers</div>
        </div>
        <button
          onClick={() => setUnlocked(true)}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
          onMouseOut={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
        >
          <Eye size={14} /> Show Details
        </button>
      </div>
    );
  }

  const confidence = admin.confidence_score;
  const barColor = confidence >= 85 ? 'var(--green-500)' :
                   confidence >= 60 ? 'var(--amber-500)' : 'var(--red-500)';

  return (
    <div style={{
      marginTop: 16, borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'var(--surface-low)', borderBottom: '1px solid var(--border)'
      }}>
        <BarChart3 size={16} color="var(--purple-400)" />
        <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>
          🔬 Expert / Admin Panel
        </span>
        <button
          onClick={() => setUnlocked(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '.75rem', color: 'var(--text-muted)', fontFamily: 'inherit'
          }}
        >
          <EyeOff size={13} /> Hide
        </button>
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 14 }}>
        {/* Raw Model Class */}
        <div>
          <div style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
            Raw Model Class
          </div>
          <code style={{
            fontSize: '.82rem', padding: '4px 8px', borderRadius: 'var(--radius-xs)',
            background: 'var(--surface-low)', color: 'var(--text-secondary)',
            fontFamily: '"Space Grotesk", monospace'
          }}>
            {admin.raw_class}
          </code>
        </div>

        {/* Confidence Score with bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Confidence Score
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>
              {confidence}%
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--surface-mid)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${confidence}%`, borderRadius: 999,
              background: barColor,
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {confidence >= 85 ? '✅ High confidence — reliable prediction' :
             confidence >= 60 ? '⚠ Moderate — consider secondary verification' :
             '🔴 Low confidence — needs expert review'}
          </div>
        </div>

        {/* Severity + Certainty grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-low)', border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Severity Level
            </div>
            <div style={{ 
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem',
              color: admin.severity_level === 'High' ? 'var(--red-500)' :
                     admin.severity_level === 'Medium' ? 'var(--amber-500)' : 'var(--green-500)'
            }}>
              {admin.severity_level}
            </div>
          </div>
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-low)', border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Model Certainty
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
              {admin.model_certainty}
            </div>
          </div>
        </div>

        {/* Model info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-low)', fontSize: '.75rem', color: 'var(--text-muted)'
        }}>
          <Activity size={14} />
          Model: PlantVillage CNN (38 classes) · Input: 240×240px · Architecture: Deep Convolutional Neural Network
        </div>
      </div>
    </div>
  );
}
