import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../hooks/useAuth';
import { diseaseService } from '../services/diseaseService';
import { weatherService, riskService } from '../services/weatherService';
import { marketService, creditService } from '../services/marketService';
import { workerService } from '../services/workerService';
import WeatherWidget from '../components/weather/WeatherWidget';
import CreditPanel from '../components/credit/CreditPanel';
import RiskAlert from '../components/common/RiskAlert';
import { Leaf, ShoppingBag, Users, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const { user } = useAuth();
  const pageRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherCity, setWeatherCity] = useState(() => localStorage.getItem('weatherCity') || 'New Delhi');
  const [credit, setCredit] = useState(null);
  const [recentPred, setRecentPred] = useState([]);
  const [latestRisk, setLatestRisk] = useState(null);
  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);

  const fetchWeather = (city) => {
    setWeatherLoading(true);
    weatherService.getByLocation(city)
      .then(r => { setWeather(r.data); setWeatherCity(city); localStorage.setItem('weatherCity', city); })
      .catch(() => { })
      .finally(() => setWeatherLoading(false));
  };

  const fetchWeatherByCoords = (lat, lon) => {
    setWeatherLoading(true);
    weatherService.getByCoords(lat, lon)
      .then(r => { setWeather(r.data); setWeatherCity(r.data.location || 'My Location'); localStorage.setItem('weatherCity', r.data.location || 'My Location'); })
      .catch(() => { })
      .finally(() => setWeatherLoading(false));
  };


  useEffect(() => {
    fetchWeather(weatherCity);
    if (user?.role === 'Farmer') {
      creditService.getAccount().then(r => setCredit(r.data)).catch(() => { });
      riskService.history().then(r => setLatestRisk(r.data[0])).catch(() => { });
      marketService.getOrders().then(r => setOrders(r.data.slice(0, 4))).catch(() => { });
    }
    if (user?.role === 'Farmer' || user?.role === 'Worker') {
      diseaseService.history().then(r => setRecentPred(r.data.slice(0, 5))).catch(() => { });
    }
    if (user?.role === 'Worker') {
      workerService.getMyJobs().then(r => setJobs(r.data || [])).catch(() => { });
    }
  }, [user]);

  // GSAP scroll-triggered 
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const ctx = gsap.context(() => {
      const gridSection = page.querySelector('.grid-3');
      const gridItems = gridSection ? Array.from(gridSection.children) : [];

      if (gridSection && gridItems.length > 0) {
        gsap.fromTo(gridItems,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.55,
            stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: gridSection, start: 'top 88%' },
            clearProps: 'all',
          }
        );
      }

      // Risk alert + recent scans 
      gsap.utils.toArray(page.querySelectorAll('[data-reveal]')).forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 18 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            clearProps: 'all',
          }
        );
      });
    }, page);
    return () => ctx.revert();
  }, [recentPred, latestRisk]);

  const statCards = [
    { label: 'Scans Done', value: recentPred.length, icon: '🔬', to: '/disease', color: 'var(--green-100)', roles: ['Farmer', 'Worker'] },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered').length, icon: '📦', to: '/marketplace', color: '#dbeafe', roles: ['Farmer'] },
    { label: 'Assigned Jobs', value: jobs.filter(j => j.status === 'Accepted' || j.status === 'Pending').length, icon: '👷', to: '/workers', color: '#ede9fe', roles: ['Worker'] },
    { label: 'Credit Remaining', value: credit ? `₹${parseFloat(credit.remaining_credit ?? (credit.credit_limit - credit.used_credit)).toFixed(0)}` : '—', icon: '💳', to: '/credit', color: '#fef9c3', roles: ['Farmer'] },
    { label: 'Risk Alerts', value: latestRisk?.risk_level || 'None', icon: '⚠️', to: '/risk', color: latestRisk?.risk_level === 'High' ? '#fee2e2' : 'var(--green-100)', roles: ['Farmer'] },
  ].filter(card => card.roles.includes(user?.role));

  return (
    <div ref={pageRef}>
      <div className="page-header">
        <h1>Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p>Here's your farm overview for today</p>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map(({ label, value, icon, to, color }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: color }}>{icon}</div>
              <div>
                <div className="stat-value">{String(value)}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <WeatherWidget data={weather} loading={weatherLoading} onSearch={fetchWeather} onGeolocate={fetchWeatherByCoords} initialCity={weatherCity} dashboardMode={true} />

        {credit && <CreditPanel account={credit} />}

        <div className="card">
          <div className="card-header">
            <BarChart2 size={18} color="var(--primary)" />
            <h2>Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/disease" className="btn btn-outline"><Leaf size={16} /> Scan a Leaf</Link>
            <Link to="/crop" className="btn btn-outline"><span>🌾</span> Crop Advisor</Link>
            {user?.role === 'Farmer' && <Link to="/marketplace" className="btn btn-outline"><ShoppingBag size={16} /> Shop Products</Link>}
            {user?.role === 'Farmer' && <Link to="/workers" className="btn btn-outline"><Users size={16} /> Hire Workers</Link>}
            {user?.role === 'Worker' && <Link to="/workers" className="btn btn-outline"><Users size={16} /> Manage Jobs</Link>}
          </div>
        </div>
      </div>

      {latestRisk && (
        <div data-reveal style={{ marginBottom: 24 }}>
          <RiskAlert risk={latestRisk} />
        </div>
      )}

      {user?.role === 'Worker' && jobs.length > 0 && (
        <div data-reveal className="card">
          <div className="card-header">
            <Users size={18} color="var(--primary)" />
            <h2>Recent Assigned Jobs</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Farmer</th><th>Description</th><th>Rate</th><th>Status</th></tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map(j => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.farmer_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{j.job_description}</td>
                    <td>₹{parseFloat(j.agreed_rate).toFixed(0)}</td>
                    <td><span className="badge badge-info">{j.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(user?.role === 'Farmer' || user?.role === 'Worker') && recentPred.length > 0 && (
        <div data-reveal className="card">
          <div className="card-header">
            <Leaf size={18} color="var(--primary)" />
            <h2>Recent Disease Scans</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Disease</th><th>Confidence</th><th>Severity</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentPred.map(p => (
                  <tr key={p.id}>
                    <td>{p.predicted_disease.replace(/___/g, ' › ').replace(/_/g, ' ')}</td>
                    <td>{p.confidence_score}%</td>
                    <td><span className={`badge badge-${p.severity_level.toLowerCase()}`}>{p.severity_level}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

