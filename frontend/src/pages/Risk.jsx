import { useState, useEffect } from 'react';
import { weatherService, riskService } from '../services/weatherService';
import RiskAlert from '../components/common/RiskAlert';
import toast from 'react-hot-toast';

const CROPS = ['Tomato', 'Potato', 'Corn', 'Wheat', 'Rice', 'Soybean', 'Other'];

export default function Risk() {
  const [weatherCity, setWeatherCity] = useState(() => localStorage.getItem('weatherCity') || 'Delhi');
  const [riskForm, setRiskForm] = useState({ crop_type: 'Tomato' });
  const [risk, setRisk] = useState(null);
  const [rLoading, setRLoading] = useState(false);
  const [wLoading, setWLoading] = useState(false);

  useEffect(() => {
    if (weatherCity) {
      autofillWeather(weatherCity);
    }
  }, []);

  const autofillWeather = async (city) => {
    if (!city.trim()) return;
    setWLoading(true);
    try {
      const { data } = await weatherService.getByLocation(city);
      setWeatherCity(city);
      localStorage.setItem('weatherCity', city);
      setRiskForm(prev => ({
        ...prev,
        temperature: data.temperature,
        humidity:    data.humidity,
        rainfall:    data.rainfall,
      }));
    } catch (err) {
      toast.error('Could not autofill weather for ' + city);
    } finally {
      setWLoading(false);
    }
  };

  const predictRisk = async (e) => {
    e.preventDefault();
    setRLoading(true);
    try {
      const { data } = await riskService.predict(riskForm);
      setRisk(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Risk prediction failed');
    } finally {
      setRLoading(false);
    }
  };

  const handle = (e) => setRiskForm({ ...riskForm, [e.target.name]: e.target.value });

  return (
    <div>
      <div className="page-header">
        <h1>⚠️ Disease Risk Prediction</h1>
        <p>Analyze weather conditions and predict potential disease risks for your crops</p>
      </div>

      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h2>Autofill Weather Details</h2></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Enter a city to automatically populate the weather factors based on current conditions.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-group"
                style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.9rem', margin: 0 }}
                placeholder="Enter city (e.g. Mumbai)"
                value={weatherCity}
                onChange={(e) => setWeatherCity(e.target.value)}
              />
              <button className="btn btn-secondary" disabled={wLoading} onClick={() => autofillWeather(weatherCity)}>
                {wLoading ? 'Filling…' : 'Autofill'}
              </button>
            </div>
          </div>

          {risk && <div style={{ marginTop: 16 }}><RiskAlert risk={risk} /></div>}
        </div>

        <div>
          <div className="card">
            <div className="card-header"><h2>Risk Prediction Form</h2></div>
            <form onSubmit={predictRisk}>
              <div className="form-group">
                <label>Crop Type</label>
                <select name="crop_type" value={riskForm.crop_type} onChange={handle}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input name="temperature" type="number" step="0.1" value={riskForm.temperature || ''} onChange={handle} required placeholder="28" />
                </div>
                <div className="form-group">
                  <label>Humidity (%)</label>
                  <input name="humidity" type="number" step="0.1" value={riskForm.humidity || ''} onChange={handle} required placeholder="72" />
                </div>
              </div>
              <div className="form-group">
                <label>Rainfall (mm)</label>
                <input name="rainfall" type="number" step="0.1" value={riskForm.rainfall || ''} onChange={handle} required placeholder="5.0" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={rLoading}>
                {rLoading ? 'Predicting…' : 'Predict Risk'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}