import React from 'react';
import { 
  Terminal, 
  Layers, 
  BarChart3, 
  User, 
  LogOut, 
  Zap,
  Sparkles,
  Box
} from 'lucide-react';
import { STRATEGIES_INFO } from '../data/initialData';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  activeStrategy
}) {
  const currentStrategyInfo = STRATEGIES_INFO[activeStrategy] || STRATEGIES_INFO.predictive;

  return (
    <header className="navbar-container">
      <div className="max-w-7xl navbar-inner">
        {/* Brand Logo - Geometric Neo-Brutalist */}
        <div 
          className="brand-logo" 
          onClick={() => setCurrentView('landing')}
          style={{ cursor: 'pointer' }}
        >
          <div className="logo-box">
            <Box size={22} strokeWidth={2.5} color="#000" />
          </div>
          <div className="brand-text">
            <span className="brand-title">POD<span className="brand-title-accent">LAUNCH</span></span>
            <span className="neo-tag tag-green brand-sub-tag">RESEARCH LAB</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => setCurrentView('landing')}
          >
            Overview
          </button>
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <BarChart3 size={16} strokeWidth={2.5} />
            Console & Dashboard
          </button>
          <a 
            href="#strategies" 
            className="nav-btn"
            onClick={(e) => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
              }
            }}
          >
            4 Strategies
          </a>
          <a 
            href="#team" 
            className="nav-btn"
            onClick={(e) => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
              }
            }}
          >
            Group-22 Team
          </a>
        </nav>

        {/* Right Action Bar */}
        <div className="nav-actions">
          {/* Active Strategy Badge */}
          <div 
            className="strategy-pill"
            style={{ backgroundColor: currentStrategyInfo.cardBg }}
            onClick={() => setCurrentView('dashboard')}
            title="Click to view pooling telemetry"
          >
            <Zap size={14} strokeWidth={2.5} color="#000" />
            <span className="strat-lbl">STRATEGY:</span>
            <span className="strat-name">{currentStrategyInfo.name.split(' ')[0]}</span>
          </div>

          {/* User Auth or Launch Console */}
          {currentUser ? (
            <div className="user-menu-wrap">
              <div 
                className="user-pill"
                onClick={() => setCurrentView('dashboard')}
              >
                <div className="user-avatar-icon">{currentUser.avatar || 'U'}</div>
                <span className="user-text-name">{currentUser.name.split(' ')[0]}</span>
              </div>
              <button 
                className="btn btn-white btn-sm"
                onClick={onLogout}
                title="Sign Out"
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={15} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <button 
                className="btn btn-white btn-sm"
                onClick={() => onOpenAuth('signin')}
              >
                Sign In
              </button>
              <button 
                className="btn btn-yellow btn-sm"
                onClick={() => onOpenAuth('signup')}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #FFFFFF;
          border-bottom: var(--border-thick);
          box-shadow: 0 4px 0px #000000;
          padding: 0.75rem 0;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          user-select: none;
        }

        .logo-box {
          width: 40px;
          height: 40px;
          background: var(--neo-yellow);
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-bounce);
        }

        .brand-logo:hover .logo-box {
          transform: rotate(-4deg) scale(1.05);
        }

        .brand-text {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #000000;
        }

        .brand-title-accent {
          background: var(--neo-cyan);
          padding: 0 0.25rem;
          border: 1.5px solid #000;
          box-shadow: 1.5px 1.5px 0px #000;
          margin-left: 0.15rem;
        }

        .brand-sub-tag {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-btn {
          background: transparent;
          border: 2px solid transparent;
          color: #000000;
          font-family: var(--font-display);
          font-size: 0.925rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all var(--transition-fast);
        }

        .nav-btn:hover {
          background: var(--bg-page-alt);
          border-color: #000000;
          box-shadow: var(--shadow-sm);
          transform: translate(-1px, -1px);
        }

        .nav-btn.active {
          background: var(--neo-yellow);
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .strategy-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all var(--transition-bounce);
        }

        .strategy-pill:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
        }

        .strat-lbl {
          color: #475569;
        }

        .strat-name {
          color: #000000;
          text-decoration: underline;
        }

        .user-menu-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: var(--border-thick);
          box-shadow: var(--shadow-sm);
          padding: 0.25rem 0.75rem 0.25rem 0.35rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 800;
          font-size: 0.85rem;
          transition: all var(--transition-fast);
        }

        .user-pill:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
        }

        .user-avatar-icon {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-xs);
          background: var(--neo-purple);
          border: 1.5px solid #000;
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        @media (max-width: 860px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
