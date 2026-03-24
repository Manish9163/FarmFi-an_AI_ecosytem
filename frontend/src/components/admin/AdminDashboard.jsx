import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { Users, Activity, ShoppingCart, Percent, TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

// Stat card component
function StatCard({ title, value, icon, accent, badge }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
      padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: 10, background: accent + '15', borderRadius: 12 }}>
          {icon}
        </div>
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: accent + '15', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={10} /> {badge}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginTop: 4 }}>{title}</div>
      </div>
    </div>
  );
}

// Chart wrapper 
function ChartCard({ title, height = 280, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 20 }}>{title}</div>
      <div style={{ width: '100%', height }}>
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]               = useState(null);
  const [userGrowth, setUserGrowth]     = useState([]);
  const [diseaseDist, setDiseaseDist]   = useState([]);
  const [modelAcc, setModelAcc]         = useState([]);
  const [cropRec, setCropRec]           = useState([]);
  const [sales, setSales]               = useState([]);
  const [feedbackTrend, setFeedbackTrend] = useState([]);
  const [error, setError]               = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchWithFallback = async (p, name) => {
          try {
            const res = await api.get(p);
            return res.data;
          } catch (e) {
            console.error(`Failed to fetch ${name}:`, e);
            return null;
          }
        };

        const [
          dataStats, dataUserGrowth, dataDiseaseDist, dataModelAcc,
          dataCropRec, dataSales, dataFeedbackTrend
        ] = await Promise.all([
          fetchWithFallback('/admin/dashboard', 'stats'),
          fetchWithFallback('/admin/analytics/user-growth', 'userGrowth'),
          fetchWithFallback('/admin/analytics/disease-distribution', 'diseaseDist'),
          fetchWithFallback('/admin/feedback/stats', 'modelAcc'),
          fetchWithFallback('/admin/analytics/crop-recommendations', 'cropRec'),
          fetchWithFallback('/admin/analytics/product-sales', 'sales'),
          fetchWithFallback('/admin/analytics/feedback-trend', 'feedbackTrend'),
        ]);

        if (dataStats) setStats(dataStats);
        else {
          setError(true);
        }

        setUserGrowth(dataUserGrowth || []);
        setDiseaseDist(dataDiseaseDist || []);
        
        if (dataModelAcc) {
          setModelAcc([
            { name: 'Correct',   value: dataModelAcc.correct_predictions   || 0 },
            { name: 'Incorrect', value: dataModelAcc.incorrect_predictions || 0 },
          ]);
        }
        
        setCropRec(dataCropRec || []);
        setSales(dataSales || []);
        setFeedbackTrend(dataFeedbackTrend || []);
      } catch (err) {
        console.error('Dashboard fatal fetch error:', err);
        setError(true);
      }
    };
    fetchData();
  }, []);

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
      <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4 }}>Connection or Access Error</div>
      <div style={{ fontSize: 13, marginBottom: 12 }}>Could not load admin data.</div>
      <button onClick={() => window.location.reload()} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12 }}>Retry Loading</button>
    </div>
  );

  if (!stats) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#94a3b8' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Loading dashboard…</span>
      </div>
    </div>
  );

  const totalAcc = modelAcc.reduce((s, c) => s + c.value, 0);
  const accPct = totalAcc > 0 ? ((modelAcc[0].value / totalAcc) * 100).toFixed(1) : '—';

  const tooltipStyle = { borderRadius: 10, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', fontSize: 13 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* STAT CARDS  */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard title="Total Users"       value={stats.total_users}       icon={<Users size={20} color="#10b981"/>}     accent="#10b981" badge="+12%" />
        <StatCard title="AI Predictions"    value={stats.total_predictions} icon={<Activity size={20} color="#3b82f6"/>}  accent="#3b82f6" badge="+5%"  />
        <StatCard title="Marketplace Orders" value={stats.total_orders}     icon={<ShoppingCart size={20} color="#f59e0b"/>} accent="#f59e0b" />
        <StatCard title="AI Accuracy"        value={`${accPct}%`}           icon={<Percent size={20} color="#8b5cf6"/>}   accent="#8b5cf6" />
      </div>

      {/*  User Growth  */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <ChartCard title="User Acquisition Over Time" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="new_users" stroke="#10b981" strokeWidth={3} dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Prediction Accuracy" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={modelAcc} cx="50%" cy="50%"
                innerRadius="50%" outerRadius="75%"
                paddingAngle={3} dataKey="value" stroke="none">
                {modelAcc.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/*  Disease Distribution  + sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Top Diagnosed Diseases" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diseaseDist} layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="disease_name" type="category" axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }} width={130} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                {diseaseDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Marketplace Product Sales" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="product_name" axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total_orders" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/*  Feedback Trend + Crop Recs  */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <ChartCard title="Feedback Trend (Correct vs Incorrect)" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feedbackTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="correct_predictions"   stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="incorrect_predictions" stroke="#f43f5e" strokeWidth={2.5} dot={false} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Crop Recommendations" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cropRec} layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="crop_name" type="category" axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="recommendation_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                {cropRec.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
