import { useState } from 'react';
import { Eye, EyeOff, ZoomIn, MapPin } from 'lucide-react';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

/**
 * AnnotatedLeafImage — Shows the uploaded leaf image with
 * highlighted disease regions. Allows toggling between 
 * original and annotated views.
 */
export default function AnnotatedLeafImage({ imageUrl, annotatedImageUrl, spotCount, isHealthy }) {
  const [showAnnotated, setShowAnnotated] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  if (!imageUrl) return null;

  const hasAnnotation = !!annotatedImageUrl;
  const displayUrl = resolveUrl(showAnnotated && hasAnnotation ? annotatedImageUrl : imageUrl);

  return (
    <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        paddingBottom: 12, borderBottom: '1px solid var(--border)'
      }}>
        <MapPin size={18} color={isHealthy ? 'var(--green-500)' : 'var(--danger, #ef4444)'} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0, flex: 1 }}>
          {isHealthy ? '📸 Your Leaf Image' : '📍 Affected Area Analysis'}
        </h3>

        {hasAnnotation && (
          <button
            onClick={() => setShowAnnotated(!showAnnotated)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              fontSize: '.78rem', fontWeight: 600,
              border: '1px solid var(--border)',
              background: showAnnotated ? 'var(--primary)' : 'var(--surface-low)',
              color: showAnnotated ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s ease'
            }}
          >
            {showAnnotated ? <Eye size={14} /> : <EyeOff size={14} />}
            {showAnnotated ? 'Showing problems' : 'Show problems'}
          </button>
        )}
      </div>

      {/* Spot count badge */}
      {hasAnnotation && showAnnotated && spotCount > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 12,
          fontSize: '.8rem', fontWeight: 600,
          background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger, #ef4444)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          🔴 {spotCount} problem area{spotCount > 1 ? 's' : ''} detected
        </div>
      )}

      {isHealthy && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 12,
          fontSize: '.8rem', fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green-500)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          ✅ No problem areas found — leaf looks healthy!
        </div>
      )}

      {/* Image container */}
      <div
        style={{
          position: 'relative', borderRadius: 'var(--radius)',
          overflow: 'hidden', cursor: zoomed ? 'zoom-out' : 'zoom-in',
          border: '1px solid var(--border)',
          maxHeight: zoomed ? 'none' : '360px'
        }}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={displayUrl}
          alt={showAnnotated ? 'Annotated leaf with problem areas marked' : 'Original leaf image'}
          style={{
            width: '100%',
            objectFit: zoomed ? 'contain' : 'cover',
            maxHeight: zoomed ? 'none' : '360px',
            display: 'block',
            transition: 'max-height 0.3s ease'
          }}
        />

        {/* Zoom hint */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: '.72rem', fontWeight: 600
        }}>
          <ZoomIn size={12} />
          {zoomed ? 'Click to shrink' : 'Click to zoom'}
        </div>

        {/* Annotation indicator */}
        {hasAnnotation && showAnnotated && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(239, 68, 68, 0.85)', color: '#fff',
            fontSize: '.72rem', fontWeight: 700
          }}>
            📍 Problem areas marked in red
          </div>
        )}
      </div>

      {/* Toggle guide */}
      {hasAnnotation && (
        <div style={{
          marginTop: 10, fontSize: '.78rem', color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          {showAnnotated
            ? 'Red circles and shading show where the infection was found on your leaf.'
            : 'Toggle "Show problems" to see where the infection is located.'}
        </div>
      )}
    </div>
  );
}
