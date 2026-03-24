import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, NavLink } from 'react-router-dom';

import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPredictions from '../components/admin/AdminPredictions';
import AdminPesticides from '../components/admin/AdminPesticides';
import AdminCropPredictions from '../components/admin/AdminCropPredictions';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCredit from '../components/admin/AdminCredit';
import AdminJobs from '../components/admin/AdminJobs';
import AdminFeedback from '../components/admin/AdminFeedback';
import AdminModelPerformance from '../components/admin/AdminModelPerformance';

import {
  LayoutDashboard, Users, HeartPulse, ShieldAlert, CloudRain,
  ShoppingBag, Truck, CreditCard, Briefcase, MessageSquare,
  LineChart, Settings, LogOut, ArrowLeft, Menu, X
} from 'lucide-react';

const MENU_GROUPS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Data Management',
    items: [
      { name: 'Users', icon: Users },
      { name: 'Products', icon: ShoppingBag },
      { name: 'Orders', icon: Truck },
      { name: 'Credit System', icon: CreditCard },
      { name: 'Jobs', icon: Briefcase },
    ]
  },
  {
    label: 'Agriculture AI',
    items: [
      { name: 'Predictions', icon: HeartPulse },
      { name: 'Pesticides', icon: ShieldAlert },
      { name: 'Crop Predictions', icon: CloudRain },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Feedback', icon: MessageSquare },
      { name: 'Model Performance', icon: LineChart },
    ]
  },
];

function renderContent(activeTab) {
  switch (activeTab) {
    case 'Dashboard': return <AdminDashboard />;
    case 'Users': return <AdminUsers />;
    case 'Predictions': return <AdminPredictions />;
    case 'Pesticides': return <AdminPesticides />;
    case 'Crop Predictions': return <AdminCropPredictions />;
    case 'Products': return <AdminProducts />;
    case 'Orders': return <AdminOrders />;
    case 'Credit System': return <AdminCredit />;
    case 'Jobs': return <AdminJobs />;
    case 'Feedback': return <AdminFeedback />;
    case 'Model Performance': return <AdminModelPerformance />;
    default: return <AdminDashboard />;
  }
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f8fafc' }}>

      {/* Mobile Overlay  */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 248,
        minWidth: 248,
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
        color: '#94a3b8',
        height: '100vh',
        position: sidebarOpen ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>FarmFi Admin</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 1, fontWeight: 500 }}>Control Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {MENU_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#334155', padding: '8px 10px 4px', margin: 0 }}>
                {group.label}
              </p>
              {group.items.map(({ name, icon: Icon }) => {
                const isActive = activeTab === name;
                return (
                  <button
                    key={name}
                    onClick={() => { setActiveTab(name); setSidebarOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? '#1e293b' : 'transparent',
                      color: isActive ? '#f1f5f9' : '#64748b',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13.5,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#cbd5e1'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                  >
                    <Icon size={16} style={{ color: isActive ? '#22c55e' : '#4b5563', flexShrink: 0 }} />
                    {name}
                    {isActive && (
                      <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/*  Admin info + Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
              <div style={{ color: '#475569', fontSize: 11, fontWeight: 500 }}>Administrator</div>
            </div>
          </div>
          <NavLink
            to="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: '#64748b', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#cbd5e1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ArrowLeft size={15} />
            Back to App
          </NavLink>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', color: '#f87171', background: 'transparent', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#450a0a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger  */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'none', padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: 6 }}
              className="admin-mobile-menu"
            >
              <Menu size={20} />
            </button>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              <span>Admin</span>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#1e293b', fontWeight: 700 }}>{activeTab}</span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px #dcfce7' }}></span>
              System Online
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f8fafc' }}>
          {renderContent(activeTab)}
        </main>
      </div>
    </div>
  );
}
