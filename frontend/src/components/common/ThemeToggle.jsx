import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="toggle-track">
          <div className={`toggle-thumb ${isDark ? 'dark' : 'light'}`}>
            {isDark ? <Moon size={14} /> : <Sun size={14} />}
          </div>
          <span className="toggle-icon sun-icon"><Sun size={12} /></span>
          <span className="toggle-icon moon-icon"><Moon size={12} /></span>
        </div>
      </button>

      <style>{`
        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .toggle-track {
          width: 52px;
          height: 28px;
          border-radius: 999px;
          background: var(--surface-mid);
          position: relative;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2;
        }

        .toggle-thumb.light {
          left: 3px;
          background: #fff;
          color: #f59e0b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .toggle-thumb.dark {
          left: 27px;
          background: #27272a;
          color: #a78bfa;
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.3);
        }

        .toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          opacity: 0.4;
          transition: opacity 0.2s ease;
        }

        .sun-icon { color: #f59e0b; }
        .moon-icon { color: #a78bfa; }
      `}</style>
    </>
  );
}
