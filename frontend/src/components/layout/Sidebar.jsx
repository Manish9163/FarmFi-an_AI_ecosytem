import { useLayoutEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { gsap } from 'gsap';
import {
  LayoutDashboard, Leaf, Cloud, BarChart2,
  Sprout, ShoppingBag, CreditCard, Users, ShieldCheck, LogOut, Calendar
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, roles: ['Farmer','Worker','Admin'] },
  { to: '/disease',       label: 'Scan a Leaf',    icon: Leaf,            roles: ['Farmer', 'Worker'] },
  { to: '/weather',       label: 'Weather',        icon: Cloud,           roles: ['Farmer'] },
  { to: '/risk',          label: 'Risk Prediction',icon: BarChart2,       roles: ['Farmer'] },
  { to: '/crop',          label: 'Crop Advisor',   icon: Sprout,          roles: ['Farmer', 'Worker'] },
  { to: '/calendar',      label: 'Planting Calendar', icon: Calendar,     roles: ['Farmer'] },
  { to: '/marketplace',   label: 'Marketplace',    icon: ShoppingBag,     roles: ['Farmer'] },
  { to: '/credit',        label: 'Credit',         icon: CreditCard,      roles: ['Farmer'] },
  { to: '/workers',       label: 'Workers',        icon: Users,           roles: ['Farmer','Worker'] },
  { to: '/admin',         label: 'Admin Panel',    icon: ShieldCheck,     roles: ['Admin'] },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const ctx = gsap.context(() => {
      const headerItems = Array.from(sidebar.querySelectorAll('.sidebar-brand, .sidebar-user'));
      const navItems = Array.from(sidebar.querySelectorAll('.nav-item'));
      const logoutButton = sidebar.querySelector('.sidebar-logout');

      if (headerItems.length > 0) {
        gsap.fromTo(headerItems,
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.1 }
        );
      }

      if (navItems.length > 0) {
        gsap.fromTo(navItems,
          { x: -16, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.055, delay: 0.2 }
        );
      }

      if (logoutButton) {
        gsap.fromTo(logoutButton,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, delay: 0.6 }
        );
      }
    }, sidebar);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <aside ref={sidebarRef} className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🌿</span>
          <span className="brand-name">FarmFi</span>
        </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="user-name">{user?.full_name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink 
            key={to} 
            to={to} 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={() => { setIsOpen(false); logout(); navigate('/login'); }}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
    </>
  );
}
