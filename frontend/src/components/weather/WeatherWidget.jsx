import { useState } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WeatherWidget({ data, loading, onSearch, onGeolocate, initialCity = '', dashboardMode = false }) {
  const [input, setInput] = useState(initialCity);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const city = input.trim();
    if (city && onSearch) onSearch(city);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (onGeolocate) {
          onGeolocate(latitude, longitude);
        } else if (onSearch) {
          // Fallback: use lat,lon as a city search query (WeatherAPI supports this)
          onSearch(`${latitude},${longitude}`);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Helper to get the weather icon URL from WeatherAPI icon path
  const getIconUrl = (iconPath) => {
    if (!iconPath) return null;
    // WeatherAPI returns paths like "//cdn.weatherapi.com/..." — ensure https
    if (iconPath.startsWith('//')) return `https:${iconPath}`;
    if (iconPath.startsWith('http')) return iconPath;
    return `https://cdn.weatherapi.com/weather/64x64${iconPath}`;
  };

  return (
    <div className="card weather-widget">
      {/* City search bar */}
      <form onSubmit={handleSubmit} className="weather-search-form">
        <input
          className="weather-search-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter city (e.g. New Delhi, Mumbai)…"
        />
        <button type="submit" className="weather-search-btn" title="Get weather">
          <Search size={15} />
        </button>
        <button
          type="button"
          className="weather-search-btn weather-geo-btn"
          title="Use my location"
          onClick={handleGeolocate}
          disabled={geoLoading}
        >
          <MapPin size={15} className={geoLoading ? 'spin' : ''} />
        </button>
      </form>

      {loading && <div className="spinner" style={{ margin: '20px auto' }} />}

      {!loading && !data && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', textAlign: 'center', marginTop: 8 }}>Search a city above or use 📍 for your location</p>}

      {!loading && data && <>
      <div className="weather-location">
        {data.icon ? (
          <img src={getIconUrl(data.icon)} alt={data.description} width={28} height={28} />
        ) : (
          <Cloud size={20} color="var(--blue-500)" />
        )}
        <span>{data.full_location || data.location}</span>
      </div>
      {data.localtime && (
        <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          Local time: {data.localtime}
        </div>
      )}
      <div className="weather-main">
        <Thermometer size={36} color="var(--amber-500)" />
        <span className="weather-temp">{data.temperature}°C</span>
      </div>
      <p className="weather-desc">{data.description}</p>
      <div className="weather-stats">
        <div className="wstat">
          <Droplets size={16} color="var(--blue-400)" />
          <span>{data.humidity}%</span>
          <small>Humidity</small>
        </div>
        <div className="wstat">
          <Cloud size={16} color="var(--blue-400)" />
          <span>{data.rainfall} mm</span>
          <small>Rainfall</small>
        </div>
        <div className="wstat">
          <Wind size={16} color="var(--gray-500)" />
          <span>{data.wind_speed} km/h</span>
          <small>Wind</small>
        </div>
        <div className="wstat">
          <Wind size={16} color={data.aqi_index > 3 ? "var(--red-500)" : data.aqi_index > 1 ? "var(--amber-500)" : "var(--green-500)"} />
          <span>{data.air_quality && data.air_quality.pm2_5 ? parseFloat(data.air_quality.pm2_5).toFixed(1) : (data.aqi_index || 'N/A')}</span>
          <small>AQI (PM2.5)</small>
        </div>
      </div>

      {/* 7-Day Forecast & Alerts */}
      {!dashboardMode ? (
        <>
          {data.forecast && data.forecast.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>7-Day Forecast</h4>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
                {data.forecast.map((day, idx) => (
                  <div key={idx} style={{ minWidth: '100px', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text)' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {day.icon ? (
                      <img
                        src={getIconUrl(day.icon)}
                        alt={day.condition || ''}
                        width={40} height={40}
                        style={{ margin: '0 auto 4px', display: 'block' }}
                      />
                    ) : (
                      <Cloud size={24} color='var(--blue-400)' style={{ margin: '0 auto 8px' }} />
                    )}
                    {day.condition && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.2 }}>
                        {day.condition}
                      </div>
                    )}
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
                      {Math.round(day.max_temp)}°
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {Math.round(day.min_temp)}°
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--blue-500)', marginTop: '6px', fontWeight: '600' }}>
                      {day.chance_of_rain}% Rain
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: 24, textAlign: 'left', padding: 16, background: 'var(--surface-low)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--amber-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={18} /> Smart Alerts
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const alerts = [];
                const temp = parseFloat(data.temperature);
                const rain = parseFloat(data.rainfall);
                const wind = parseFloat(data.wind_speed);
                const aqi = data.aqi_index;

                if (temp > 35) alerts.push('Current High Temp: Ensure crops are well irrigated.');
                if (temp < 10) alerts.push('Current Cold: Protect sensitive crops from frost.');
                if (rain > 15) alerts.push('Heavy Rain Now: Delay applying fertilizers or pesticides.');
                else if (rain > 0) alerts.push('Light Rain Now: Good time for natural irrigation.');
                if (wind > 35) alerts.push('High Winds Now: Avoid spraying chemicals.');
                if (aqi > 3) alerts.push('Poor Air Quality: Consider wearing masks during outdoor farm labor.');

                if (data.forecast) {
                  const rainyDays = data.forecast.filter(day => day.chance_of_rain > 50);
                  const hotDays = data.forecast.filter(day => day.max_temp > 35);
                  const coldDays = data.forecast.filter(day => day.min_temp < 10);

                  if (rainyDays.length > 0) {
                    const days = rainyDays.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })).join(', ');
                    alerts.push(`Upcoming Rain (>50%): Plan indoor work or avoid spraying on ${days}.`);
                  }
                  if (hotDays.length > 0) {
                    const days = hotDays.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })).join(', ');
                    alerts.push(`Upcoming Heat (>35°C): Prepare extra watering for ${days}.`);
                  }
                  if (coldDays.length > 0) {
                    const days = coldDays.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })).join(', ');
                    alerts.push(`Upcoming Cold (<10°C): Protect crops on ${days}.`);
                  }
                }

                if (alerts.length === 0) {
                  return <li>Conditions are generally favorable. Good week for farm activities!</li>;
                }

                return alerts.map((alert, i) => <li key={i}>{alert}</li>);
              })()}
            </ul>
          </div>
        </>
      ) : (
        <Link to="/weather" className="btn btn-outline" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          Upcoming weather prediction
        </Link>
      )}
      </>
      }

      <style>{`
        .weather-widget { text-align: center; }
        .weather-search-form { display: flex; gap: 8px; margin-bottom: 18px; }
        .weather-search-input {
          flex: 1; padding: 10px 16px;
          border: 1.5px solid var(--surface-mid, #e4e4e7);
          border-radius: var(--radius, 12px);
          font-size: .88rem; font-family: 'Inter', sans-serif;
          background: var(--surface, #fff);
          color: var(--text, #18181b);
          outline: none;
          transition: all 0.2s ease;
        }
        .weather-search-input:focus {
          border-color: var(--primary, #10b981);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .weather-search-btn {
          padding: 10px 14px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff; border: none;
          border-radius: var(--radius, 12px);
          cursor: pointer; display: flex; align-items: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
        }
        .weather-search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35); }
        .weather-geo-btn { background: linear-gradient(135deg, #2563eb, #3b82f6); box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25); }
        .weather-geo-btn:hover { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35); }
        .weather-geo-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .weather-location {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: var(--text-secondary, #3f3f46);
          font-size: .88rem; font-weight: 500; margin-bottom: 4px;
        }
        .weather-location img { object-fit: contain; }
        .weather-main { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 8px 0 4px; }
        .weather-temp {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3rem; font-weight: 700;
          color: var(--text, #18181b);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .weather-desc { color: var(--text-muted, #71717a); font-size: .88rem; margin: 4px 0 18px; font-weight: 500; }
        .weather-stats {
          display: flex; justify-content: space-around;
          background: var(--surface-low, #f4f4f5);
          border-radius: var(--radius, 12px);
          padding: 14px 8px;
        }
        .wstat {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: var(--radius-sm, 8px);
          transition: all 0.2s ease;
        }
        .wstat:hover { background: rgba(16, 185, 129, 0.06); transform: translateY(-2px); }
        .wstat span { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: .9rem; color: var(--text, #18181b); }
        .wstat small { font-size: .68rem; color: var(--text-muted, #71717a); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
