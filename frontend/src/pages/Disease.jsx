import { useState, useEffect, useContext } from 'react';
import { diseaseService } from '../services/diseaseService';
import { feedbackService } from '../services/feedbackService';
import { AuthContext } from '../context/AuthContext';
import ImageUpload from '../components/disease/ImageUpload';
import VoiceScanner from '../components/disease/VoiceScanner';
import DiseaseResult from '../components/disease/DiseaseResult';
import FarmerResultCard from '../components/disease/FarmerResultCard';
import AdminResultPanel from '../components/disease/AdminResultPanel';
import AnnotatedLeafImage from '../components/disease/AnnotatedLeafImage';
import toast from 'react-hot-toast';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
const SEVERITIES = ['All', 'Low', 'Medium', 'High'];

const formatClass = (name = '') => name.replace(/___/g, ' › ').replace(/_/g, ' ');

export default function Disease() {
  const { user } = useContext(AuthContext) || {};
  const isAdmin = user?.role === 'Admin';
  const [result,       setResult]       = useState(null);
  const [solution,     setSolution]     = useState(null);
  const [explanation,  setExplanation]  = useState(null);
  const [imageUrl,     setImageUrl]     = useState(null);
  const [annotatedUrl, setAnnotatedUrl]  = useState(null);
  const [spotCount,    setSpotCount]    = useState(0);
  const [predictionId, setPredictionId] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [history,      setHistory]      = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [view,         setView]         = useState('scan');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [query, setQuery] = useState('');

  const [selectedScan, setSelectedScan] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [fbType, setFbType] = useState('Correct');
  const [fbActual, setFbActual] = useState('');
  const [fbComment, setFbComment] = useState('');
  const [submittingFb, setSubmittingFb] = useState(false);

  const resolveImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
    return url;
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await diseaseService.history();
      setHistory(data || []);
    } catch {
      toast.error('Could not load scan history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    feedbackService.getDiseases().then(r => setDiseases(r.data?.diseases || [])).catch(() => {});
  }, []);

  const loadFeedbackHistory = async (predictionId) => {
    setFeedbackLoading(true);
    try {
      const { data } = await feedbackService.getHistory(predictionId);
      const list = data?.history || [];
      setFeedbackHistory(list);
      if (list.length > 0) {
        setFbType(list[0].feedback_type || 'Correct');
        setFbActual(list[0].actual_disease || '');
        setFbComment(list[0].comment || '');
      } else {
        setFbType('Correct');
        setFbActual('');
        setFbComment('');
      }
    } catch {
      setFeedbackHistory([]);
      toast.error('Could not load feedback history');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const openScanDetail = (scan) => {
    setSelectedScan(scan);
    loadFeedbackHistory(scan.id);
  };

  const closeScanDetail = () => {
    setSelectedScan(null);
    setFeedbackHistory([]);
    setFeedbackLoading(false);
    setFbType('Correct');
    setFbActual('');
    setFbComment('');
  };

  const submitFeedbackEdit = async () => {
    if (!selectedScan) return;
    if (fbType === 'Incorrect' && !fbActual) {
      toast.error('Please choose the correct disease');
      return;
    }
    setSubmittingFb(true);
    try {
      await feedbackService.submit({
        prediction_id: selectedScan.id,
        feedback_type: fbType,
        actual_disease: fbType === 'Incorrect' ? fbActual : '',
        comment: fbComment,
      });
      toast.success('Feedback updated');
      await loadFeedbackHistory(selectedScan.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save feedback');
    } finally {
      setSubmittingFb(false);
    }
  };

  const handlePredict = async (formData) => {
    setLoading(true);
    setResult(null);
    setExplanation(null);
    setImageUrl(null);
    setAnnotatedUrl(null);
    setSpotCount(0);
    try {
      const { data } = await diseaseService.predict(formData);
      setResult(data.result);
      setSolution(data.solution);
      setExplanation(data.explanation || null);
      setImageUrl(data.image_url || null);
      setAnnotatedUrl(data.annotated_image_url || null);
      setSpotCount(data.spot_count || 0);
      setPredictionId(data.prediction_id);
      loadHistory();
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const when = new Date(item.created_at);
    const okSeverity = severityFilter === 'All' || item.severity_level === severityFilter;
    const okFrom = !dateFrom || when >= new Date(`${dateFrom}T00:00:00`);
    const okTo = !dateTo || when <= new Date(`${dateTo}T23:59:59`);
    const q = query.trim().toLowerCase();
    const okQuery = !q || item.predicted_disease?.toLowerCase().includes(q);
    return okSeverity && okFrom && okTo && okQuery;
  });

  return (
    <div>
      <div className="page-header">
        <h1>🌿 FarmFi : AI Plant Disease Detection</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['scan', 'voice', 'history'].map(v => (
          <button
            key={v}
            className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView(v)}
          >
            {v === 'scan' ? 'Image Scan' : v === 'voice' ? 'Voice Check' : 'Scan History'}
          </button>
        ))}
      </div>

      {view === 'voice' && (
        <div className="grid-2">
          <VoiceScanner />
        </div>
      )}

      {view === 'scan' && (
        <>
          <div className="grid-2">
            <ImageUpload onSubmit={handlePredict} loading={loading} />
            <div>
              {/* Annotated leaf image with highlighted disease regions */}
              <AnnotatedLeafImage
                imageUrl={imageUrl}
                annotatedImageUrl={annotatedUrl}
                spotCount={spotCount}
                isHealthy={result?.disease_name?.toLowerCase().includes('healthy')}
              />

              {/* Farmer-friendly result card (always shown) */}
              <FarmerResultCard explanation={explanation} />

              {/* Traditional technical result (kept for feedback flow) */}
              <DiseaseResult
                result={result}
                solution={solution}
                predictionId={predictionId}
              />

              {/* Admin-only technical panel */}
              {isAdmin && (
                <AdminResultPanel explanation={explanation} result={result} />
              )}
            </div>
          </div>
        </>
      )}

      {view === 'history' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>My Scan History</h2>
            <button className="btn btn-sm btn-outline" onClick={loadHistory}>Refresh</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            <input placeholder="Search disease..." value={query} onChange={e => setQuery(e.target.value)} />
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>

          {historyLoading ? (
            <div className="spinner" style={{ margin: '25px auto' }} />
          ) : filteredHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No scans match your filters.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredHistory.map(item => (
                <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 12, alignItems: 'center' }}>
                    <div>
                      {item.image_url
                        ? <img src={resolveImage(item.image_url)} alt={item.predicted_disease} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8 }} />
                        : <div style={{ width: 90, height: 70, background: 'var(--gray-100)', borderRadius: 8 }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.predicted_disease}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                        Confidence: {parseFloat(item.confidence_score || 0).toFixed(1)}% · Severity: {item.severity_level}
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${item.severity_level === 'High' ? 'badge-danger' : item.severity_level === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                        {item.severity_level}
                      </span>
                    </div>
                  </div>
                  {item.recommended_pesticide && (
                    <div style={{ marginTop: 8, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                      Recommended: <strong style={{ color: 'var(--text)' }}>{item.recommended_pesticide}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openScanDetail(item)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedScan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,.55)', display: 'flex', justifyContent: 'flex-end' }} onClick={closeScanDetail}>
          <div className="card" style={{ width: 'min(560px, 100%)', height: '100vh', overflow: 'auto', borderRadius: 0 }} onClick={e => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Scan Detail #{selectedScan.id}</h2>
              <button className="btn btn-sm btn-outline" onClick={closeScanDetail}>Close</button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                {selectedScan.image_url
                  ? <img src={resolveImage(selectedScan.image_url)} alt={selectedScan.predicted_disease} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                  : <div style={{ width: 120, height: 90, borderRadius: 8, background: 'var(--gray-100)' }} />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{formatClass(selectedScan.predicted_disease)}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Confidence: {parseFloat(selectedScan.confidence_score || 0).toFixed(1)}%</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Severity: {selectedScan.severity_level}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{new Date(selectedScan.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <h3 style={{ marginBottom: 8, fontSize: '.95rem' }}>Edit Feedback</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <select value={fbType} onChange={e => setFbType(e.target.value)}>
                    <option value="Correct">Correct</option>
                    <option value="Incorrect">Incorrect</option>
                  </select>
                  {fbType === 'Incorrect' && (
                    <select value={fbActual} onChange={e => setFbActual(e.target.value)}>
                      <option value="">Select actual disease</option>
                      {diseases.map(d => <option key={d} value={d}>{formatClass(d)}</option>)}
                    </select>
                  )}
                  <textarea rows={2} placeholder="Comment (optional)" value={fbComment} onChange={e => setFbComment(e.target.value)} />
                  <button className="btn btn-primary" onClick={submitFeedbackEdit} disabled={submittingFb}>
                    {submittingFb ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <h3 style={{ marginBottom: 8, fontSize: '.95rem' }}>Feedback Edit History</h3>
                {feedbackLoading ? (
                  <div className="spinner" style={{ margin: '15px auto' }} />
                ) : feedbackHistory.length === 0 ? (
                  <p style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>No feedback edits yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {feedbackHistory.map(fb => (
                      <div key={fb.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${fb.feedback_type === 'Correct' ? 'badge-success' : 'badge-warning'}`}>{fb.feedback_type}</span>
                          <span style={{ fontSize: '.74rem', color: 'var(--text-muted)' }}>{new Date(fb.edited_at).toLocaleString()}</span>
                        </div>
                        {fb.actual_disease && (
                          <div style={{ fontSize: '.8rem', marginTop: 6 }}>
                            Actual: <strong>{formatClass(fb.actual_disease)}</strong>
                          </div>
                        )}
                        {fb.comment && (
                          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{fb.comment}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
