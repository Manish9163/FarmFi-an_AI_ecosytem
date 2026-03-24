import { useState } from 'react';
import { cropService } from '../services/cropService';
import CropCard from '../components/crops/CropCard';
import toast from 'react-hot-toast';

export default function CropRecommendation() {
  const [form,    setForm]    = useState({ soil_type: 'Loam', season: 'Summer', avg_temperature: '', rainfall: '', humidity: '', area: 1 });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handle  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await cropService.predict(form);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getYieldEstimate = (cropName, area) => {
    // ton/hectare 
    const standardYields = {
      Rice: 4.5, Wheat: 3.8, Maize: 4.0, Cotton: 3.5, Sugarcane: 2.2, Potato: 70.0, Default: 3.0
    };
    const rate = standardYields[cropName] || standardYields.Default;
    const totalYield = rate * area;
    return `Est. ${totalYield.toFixed(1)} Tons`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>🌾 Crop Suitability & Yield Estimator</h1>
        <p>Get AI-powered crop recommendations and expected yield based on your farm area</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h2>Enter Your Farm Conditions</h2></div>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Farm Area (Hectares)</label>
              <input name="area" type="number" step="0.1" min="0.1" value={form.area} onChange={handle} required placeholder="1" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Soil Type</label>
                <select name="soil_type" value={form.soil_type} onChange={handle}>
                  {['Clay','Loam','Sandy','Silt'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Season</label>
                <select name="season" value={form.season} onChange={handle}>
                  {['Summer','Winter','Monsoon'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Avg Temperature (°C)</label>
                <input name="avg_temperature" type="number" step="0.1" value={form.avg_temperature} onChange={handle} required placeholder="30" />
              </div>
              <div className="form-group">
                <label>Rainfall (mm/month)</label>
                <input name="rainfall" type="number" step="0.1" value={form.rainfall} onChange={handle} required placeholder="120" />
              </div>
            </div>
            <div className="form-group">
              <label>Humidity (%)</label>
              <input name="humidity" type="number" step="0.1" value={form.humidity} onChange={handle} required placeholder="70" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <>
              <h2 style={{ marginBottom: 16, fontWeight: 700 }}>Top Crop Recommendations</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.top_crops.map((crop, i) => (
                  <div key={crop.crop} style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 14, right: 14, fontSize: '.75rem', fontWeight: 700, color: i === 0 ? 'var(--amber-500)' : 'var(--text-muted)' }}>
                      {i === 0 ? '🏆 Best Match' : `#${i + 1}`} - {getYieldEstimate(crop.crop, parseFloat(form.area))}
                    </span>
                    <CropCard crop={crop} />
                  </div>
                ))}
              </div>
            </>
          )}
          {!result && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌱</div>
              <p>Fill in your farm conditions and get personalized crop recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}