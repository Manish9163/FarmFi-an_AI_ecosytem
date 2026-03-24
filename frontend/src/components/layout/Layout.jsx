import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AnimatedPage from '../common/AnimatedPage';
import ThemeToggle from '../common/ThemeToggle';
import { Languages, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="main-content">
        <header className="top-navbar">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <div className="language-selector">
              <Languages size={18} color="var(--primary)" />
              <div id="google_translate_element"></div>
            </div>
          </div>
        </header>
        <AnimatedPage key={pathname}>
          {children}
        </AnimatedPage>
      </main>
    </div>
  );
}
