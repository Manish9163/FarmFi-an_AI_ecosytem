import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Pill, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import MarketplaceRecommendations from './MarketplaceRecommendations';
import toast from 'react-hot-toast';

// classes
const DISEASE_CLASSES = [
  'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
  'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot', 'Peach___healthy',
  'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
  'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch', 'Strawberry___healthy',
  'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
  'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy',
];

const SEVERITY_CONFIG = {
  Low:    { cls: 'badge-low',    icon: CheckCircle,   color: 'var(--green-600)' },
  Medium: { cls: 'badge-medium', icon: AlertTriangle, color: '#d97706' },
  High:   { cls: 'badge-high',   icon: AlertTriangle, color: 'var(--danger)' },
};

const formatClass = (name) => name.replace(/___/g, ' › ').replace(/_/g, ' ');

export default function DiseaseResult({ result, solution, predictionId }) {
  // 'idle' | 'incorrect-form' | 'submitted'
  const [feedbackState, setFeedbackState] = useState('idle');
  const [actualDisease, setActualDisease] = useState('');
  const [comment,       setComment]       = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  if (!result) return null;

  const { disease_name, confidence, severity_level } = result;
  const config = SEVERITY_CONFIG[severity_level] || SEVERITY_CONFIG.Medium;
  const SeverityIcon = config.icon;
  const isHealthy = disease_name.toLowerCase().includes('healthy');
  const isLowConfidence = confidence < 60;

  const submitFeedback = async (feedbackType) => {
    if (feedbackType === 'Incorrect' && !actualDisease) {
      toast.error('Please select the correct disease before submitting');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.submit({
        prediction_id:  predictionId,
        feedback_type:  feedbackType,
        actual_disease: feedbackType === 'Incorrect' ? actualDisease : '',
        comment,
      });
      setFeedbackState('submitted');
      toast.success('Thank you! Your feedback helps improve the model.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card result-card">
      {/* Header  */}
      <div className="result-header">
        <SeverityIcon size={22} color={config.color} />
        <h2>Detection Result</h2>
        <span className={`badge ${config.cls}`}>{severity_level} Risk</span>
      </div>

      {/* Disease name + confidence bar  */}
      <div className="result-disease">
        <p className="disease-label">Detected Disease</p>
        <p className="disease-name">{formatClass(disease_name)}</p>
        <div className="confidence-bar-wrap">
          <div className="confidence-bar" style={{ width: `${confidence}%`, background: isLowConfidence ? '#ef4444' : config.color }} />
        </div>
        <p className="confidence-text" style={{ color: isLowConfidence ? '#ef4444' : 'var(--text-muted)' }}>
          {confidence.toFixed(1)}% confidence {isLowConfidence && '(Low)'}
        </p>
      </div>

      {/* Low Confidence Warning */}
      {isLowConfidence && (
        <div className="alert alert-warning" style={{ background: 'var(--surface-low)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <AlertTriangle size={20} color="var(--amber-500, #ea580c)" />
          <span style={{ fontSize: '0.9rem' }}>
            <strong>Low Confidence:</strong> The model is unsure about this detection. Please consult an agricultural expert or a plant doctor for a proper diagnosis.
          </span>
        </div>
      )}

      {/* Pesticide treatment  */}
      {!isHealthy && solution && (
        <div className="solution-box">
          <div className="solution-header">
            <Pill size={16} color="var(--primary)" />
            <strong>Recommended Treatment</strong>
          </div>
          <div className="solution-grid">
            <div>
              <p className="sol-label">Pesticide</p>
              <p>{solution.recommended_pesticide}</p>
            </div>
            <div>
              <p className="sol-label">Dosage</p>
              <p>{solution.dosage}</p>
            </div>
            <div>
              <p className="sol-label">Safety</p>
              <p>{solution.safety_precautions}</p>
            </div>
            {solution.organic_alternative && (
              <div>
                <p className="sol-label">Organic Option</p>
                <p>{solution.organic_alternative}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isHealthy && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Plant appears healthy — no treatment required.</span>
        </div>
      )}

      {/* Marketplace Link */}
      {!isHealthy && solution && (
        <MarketplaceRecommendations 
          diseaseName={solution.disease_name} 
          predictedClass={result.class} 
        />
      )}

      {/* Feedback section */}
      {predictionId && (
        <div className="feedback-section">
          <div className="feedback-divider" />

          {/* SUBMITTED  */}
          {feedbackState === 'submitted' && (
            <div className="feedback-thanks">
              <CheckCircle size={16} color="var(--green-600)" />
              <span>Feedback recorded — your correction is stored for model retraining.</span>
            </div>
          )}

          {feedbackState === 'idle' && (
            <div className="feedback-question">
              <Info size={14} color="var(--text-muted)" />
              <span className="feedback-label">Was this prediction correct?</span>
              <button
                className="btn btn-sm feedback-btn-yes"
                onClick={() => submitFeedback('Correct')}
                disabled={submitting}
                title="Mark as correct"
              >
                <ThumbsUp size={13} /> Yes
              </button>
              <button
                className="btn btn-sm feedback-btn-no"
                onClick={() => setFeedbackState('incorrect-form')}
                disabled={submitting}
                title="Provide correction"
              >
                <ThumbsDown size={13} /> No
              </button>
            </div>
          )}

          {/* INCORRECT FORM state  */}
          {feedbackState === 'incorrect-form' && (
            <div className="feedback-form">
              <div className="feedback-form-header">
                <MessageSquare size={15} color="var(--warning)" />
                <strong>What is the correct disease?</strong>
                <button
                  className="feedback-cancel"
                  onClick={() => setFeedbackState('idle')}
                  aria-label="Cancel feedback"
                >✕</button>
              </div>

<label className="fb-field-label">Correct classification *</label>
              <select
                value={actualDisease}
                onChange={e => setActualDisease(e.target.value)}
                className="fb-select"
              >
                <option value="">— Select the correct option —</option>
                <option value="Not a leaf" style={{ fontWeight: 'bold' }}>❌ Image is not a leaf / Invalid</option>
                <optgroup label="Plant Diseases">
                  {DISEASE_CLASSES.map(d => (
                    <option key={d} value={d}>{formatClass(d)}</option>
                  ))}
                </optgroup>
              </select>

              <label className="fb-field-label" style={{ marginTop: 10 }}>
                Additional comment <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                placeholder="e.g. The leaf had mosaic pattern typical of TMV…"
                className="fb-textarea"
              />

              <div className="feedback-form-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setFeedbackState('idle')}
                  disabled={submitting}
                >Cancel</button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => submitFeedback('Incorrect')}
                  disabled={submitting || !actualDisease}
                >
                  {submitting ? 'Submitting…' : 'Submit Correction'}
                </button>
              </div>

              <p className="feedback-note">
                This correction will be stored in our dataset and used to retrain the model
                in future training cycles.
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        /* Result card layout */
        .result-card { margin-top: 20px; }
        .result-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .result-header h2 { font-size: 1.1rem; font-weight: 600; flex: 1; color: var(--text); }

        /* Disease name + bar */
        .disease-label { font-size: .75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
        .disease-name  { font-size: 1.15rem; font-weight: 700; color: var(--text); margin-bottom: 10px; }
        .confidence-bar-wrap { background: var(--surface-low); border-radius: 999px; height: 8px; margin-bottom: 4px; }
        .confidence-bar { height: 8px; border-radius: 999px; transition: width .6s ease; }
        .confidence-text { font-size: .8rem; color: var(--text-muted); }

        /* Solution box */
        .solution-box { background: var(--surface-low); border: 1px solid var(--border); border-radius: var(--radius-sm, 6px); padding: 14px; margin-top: 16px; }
        .solution-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: .9rem; color: var(--text); }
        .solution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: .875rem; color: var(--text); }
        .sol-label { font-size: .72rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px; }

        /* Feedback section */
        .feedback-section { margin-top: 16px; }
        .feedback-divider { border: none; border-top: 1px solid var(--border); margin-bottom: 12px; }

        .feedback-question {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          font-size: .82rem; color: var(--text-muted);
        }
        .feedback-label { font-weight: 500; color: var(--text-secondary); }

        .feedback-btn-yes {
          display: inline-flex; align-items: center; gap: 4px;
          border: 1px solid var(--primary);
          color: var(--primary);
          background: var(--surface-low);
        }
        .feedback-btn-yes:hover { background: var(--surface); }

        .feedback-btn-no {
          display: inline-flex; align-items: center; gap: 4px;
          border: 1px solid var(--danger, #ef4444);
          color: var(--danger, #ef4444);
          background: var(--surface-low);
        }
        .feedback-btn-no:hover { background: var(--surface); }

        .feedback-thanks {
          display: flex; align-items: center; gap: 8px;
          font-size: .82rem; color: var(--primary);
          background: var(--surface-low);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm, 6px);
          padding: 8px 12px;
        }

        /* Incorrect form */
        .feedback-form {
          background: var(--surface-low);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm, 6px);
          padding: 14px;
        }
        .feedback-form-header {
          display: flex; align-items: center; gap: 8px;
          font-size: .875rem; margin-bottom: 12px; color: var(--text);
        }
        .feedback-form-header strong { flex: 1; }
        .feedback-cancel {
          background: none; border: none; cursor: pointer;
          font-size: 1rem; color: var(--text-muted); line-height: 1;
          padding: 2px 4px;
        }
        .feedback-cancel:hover { color: var(--danger); }

        .fb-field-label { display: block; font-size: .78rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }

        .fb-select {
          width: 100%; padding: 8px 10px;
          border: 1px solid var(--border); border-radius: var(--radius-sm, 6px);
          font-size: .875rem; background: var(--surface); color: var(--text); cursor: pointer;
        }
        .fb-select:focus { outline: 2px solid var(--primary); outline-offset: 1px; }

        .fb-textarea {
          width: 100%; padding: 8px 10px;
          border: 1px solid var(--border); border-radius: var(--radius-sm, 6px);
          font-size: .875rem; resize: vertical; font-family: inherit;
          background: var(--surface); color: var(--text);
        }
        .fb-textarea:focus { outline: 2px solid var(--primary); outline-offset: 1px; }

        .feedback-form-actions {
          display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;
        }

        .feedback-note {
          font-size: .72rem; color: var(--text-muted);
          margin-top: 8px; line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
