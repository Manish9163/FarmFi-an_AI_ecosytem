import { useState } from 'react';
import {
  Leaf, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Sprout, Droplets, Bug, HeartPulse, Eye, Clock
} from 'lucide-react';

/**
 * FarmerResultCard — Farmer-friendly disease result display.
 * Shows ZERO technical terms. No CNN, no confidence score, no heatmap.
 * Everything is plain-language, actionable advice.
 */
export default function FarmerResultCard({ explanation, imageUrl }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showOrganic, setShowOrganic] = useState(false);

  if (!explanation) return null;
  const info = explanation.farmer_view;
  if (!info) return null;

  const isHealthy = info.is_healthy;
  const risk = info.risk || {};
  const riskColor = risk.color || '#10b981';

  return (
    <div className="card" style={{ marginTop: 20, overflow: 'hidden' }}>
      {/* ── Header with risk badge ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          background: isHealthy ? 'rgba(16,185,129,0.1)' : `${riskColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {isHealthy
            ? <CheckCircle size={22} color="var(--green-500)" />
            : <Shield size={22} color={riskColor} />}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {info.disease_name}
          </h2>
          <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {info.certainty_label}
          </p>
        </div>
        <span style={{
          padding: '5px 12px', borderRadius: 999,
          fontSize: '.78rem', fontWeight: 700,
          background: `${riskColor}18`, color: riskColor,
          border: `1.5px solid ${riskColor}30`,
          whiteSpace: 'nowrap'
        }}>
          {risk.emoji} {risk.label}
        </span>
      </div>

      {/* ── Expert review banner for low certainty ── */}
      {info.needs_expert_review && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-low)', border: '1px solid var(--border)',
          marginBottom: 16, fontSize: '.85rem', color: 'var(--text-secondary)'
        }}>
          <Eye size={18} color="var(--amber-500)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Tip:</strong> We recommend showing this leaf to a local agriculture expert
            or your nearest plant doctor for a more accurate check.
          </span>
        </div>
      )}

      {/* ── Problem Area ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Bug size={16} color={riskColor} />
          <span style={{ fontSize: '.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)' }}>
            📍 Problem Area
          </span>
        </div>
        <p style={{ fontSize: '.92rem', color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
          {info.problem_area}
        </p>
      </div>

      {/* ── What it means ── */}
      <div style={{
        padding: 16, borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-low)', border: '1px solid var(--border)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <HeartPulse size={16} color="var(--blue-500)" />
          <span style={{ fontSize: '.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)' }}>
            What This Means
          </span>
        </div>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
          {info.what_it_means}
        </p>
      </div>

      {/* ── Risk Warning ── */}
      {!isHealthy && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          background: `${riskColor}08`, border: `1px solid ${riskColor}20`,
          marginBottom: 20
        }}>
          <AlertTriangle size={18} color={riskColor} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '.88rem', color: riskColor, marginBottom: 4 }}>
              🚨 Risk: {risk.message}
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {info.risk?.level === 'High' ? info.risk_description || risk.message : info.risk_description}
            </div>
          </div>
        </div>
      )}

      {/* ── Action Steps (What To Do) ── */}
      {!isHealthy && info.action_steps && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sprout size={16} color="var(--primary)" />
            <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>
              💊 What You Should Do
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.action_steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-low)', border: '1px solid var(--border)'
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.72rem', fontWeight: 700
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Healthy plant celebration ── */}
      {isHealthy && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: 16, borderRadius: 'var(--radius-sm)',
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
          marginBottom: 20
        }}>
          <CheckCircle size={22} color="var(--green-500)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--green-600)' }}>
              ✅ Your plant looks healthy!
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
              No treatment required. Keep up the great work! 🌱
            </div>
          </div>
        </div>
      )}

      {/* ── Organic Alternative toggle ── */}
      {!isHealthy && info.organic_option && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowOrganic(!showOrganic)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-low)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          >
            <Leaf size={16} color="var(--green-500)" />
            🌿 Organic / Natural Option
            <span style={{ marginLeft: 'auto' }}>
              {showOrganic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          {showOrganic && (
            <div style={{
              padding: '12px 14px', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              background: 'var(--surface-low)', borderTop: 'none',
              border: '1px solid var(--border)', borderTopColor: 'transparent',
              fontSize: '.88rem', color: 'var(--text-secondary)', lineHeight: 1.6
            }}>
              {info.organic_option}
            </div>
          )}
        </div>
      )}

      {/* ── When to worry + spread conditions toggle ── */}
      {!isHealthy && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-low)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, color: 'var(--text)',
            fontFamily: 'inherit', marginBottom: showDetails ? 0 : 0,
          }}
        >
          <Clock size={16} color="var(--text-muted)" />
          ⏰ When to Worry & Spread Conditions
          <span style={{ marginLeft: 'auto' }}>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>
      )}
      {showDetails && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--surface-low)', border: '1px solid var(--border)',
          borderTop: 'none', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
          fontSize: '.86rem', color: 'var(--text-secondary)', lineHeight: 1.7
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong>⚠ When to worry:</strong> {info.when_to_worry}
          </div>
          <div>
            <Droplets size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} color="var(--blue-400)" />
            <strong>Spreads in:</strong> {info.spread_condition}
          </div>
        </div>
      )}
    </div>
  );
}
