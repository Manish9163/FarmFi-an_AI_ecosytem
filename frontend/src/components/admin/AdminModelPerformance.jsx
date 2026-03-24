
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadCloud, AlertTriangle } from 'lucide-react';

export default function AdminModelPerformance() {
  const [stats, setStats] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const [resStats, resErrors] = await Promise.all([
          api.get('/admin/feedback/stats'),
          api.get('/admin/feedback/errors')
        ]);
        setStats(resStats.data);
        setErrors(resErrors.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPerf();
  }, []);

  const handleExport = () => {
    const token = localStorage.getItem('farmfi_token');
    window.location.href = `http://127.0.0.1:5000/api/v1/admin/feedback/export?format=csv&token=${token}`;
  };

  if (!stats) return <div className="p-6 text-slate-500 text-sm">Loading AI metrics...</div>;

  const chartData = [
    { name: 'Correct', value: stats.correct_predictions },
    { name: 'Mismatch', value: stats.incorrect_predictions },
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Learning Hub</h2>
            <p className="text-sm text-slate-500">Monitor model drift and retrain data streams.</p>
        </div>
        <button onClick={handleExport} className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
          <DownloadCloud size={16} />
          <span>Export Dataset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-slate-500 text-sm font-medium">Volunteered Data</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight mt-1">{stats.total_feedback_submitted}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-slate-500 text-sm font-medium">True Positives</p>
          <h3 className="text-3xl font-bold text-emerald-600 tracking-tight mt-1">{stats.correct_predictions}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-slate-500 text-sm font-medium">Reported Errors</p>
          <h3 className="text-3xl font-bold text-rose-600 tracking-tight mt-1">{stats.incorrect_predictions}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-slate-500 text-sm font-medium">Confidence Interval</p>
          <h3 className="text-3xl font-bold text-blue-600 tracking-tight mt-1">{stats.accuracy_percentage}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 className="text-base font-bold text-slate-800 tracking-tight mb-6">Feedback Distribution</h3>
          <div className="flex justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                   {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} className="outline-none" />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
               </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="text-amber-500" size={18}/>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Drift Indicators (Top Typos)</h3>
          </div>
          <ul className="space-y-4">
            {stats.most_misclassified.map((item, i) => (
              <li key={i} className="flex flex-col">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-slate-800">{item.predicted_disease}</span>
                  <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-xs font-bold border border-rose-100">{item.count} alerts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                   <div className="bg-rose-400 h-1.5 rounded-full" style={{ width: `${Math.min((item.count / Math.max(stats.incorrect_predictions, 1)) * 100 * 3, 100)}%` }}></div>
                </div>
              </li>
            ))}
            {stats.most_misclassified.length === 0 && <li className="text-slate-400 text-sm italic">Model performing cleanly. No drift detected.</li>}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Error Traces Log (Last 100)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Classified As</th>
                <th className="px-6 py-4">Expected</th>
                <th className="px-6 py-4">Log</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {errors.slice(0, 50).map(e => (
                <tr key={e.feedback_id} className="hover:bg-slate-50/80 transition-colors text-sm">
                  <td className="px-6 py-3 font-mono text-slate-400">#{e.prediction_id}</td>
                  <td className="px-6 py-3 text-rose-600 font-semibold">{e.predicted_disease}</td>
                  <td className="px-6 py-3 text-emerald-600 font-semibold">{e.actual_disease || 'None Provided'}</td>
                  <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{e.comment || '—'}</td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
