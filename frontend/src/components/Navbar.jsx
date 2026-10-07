import React from 'react';
import { 
  BarChart3, 
  User, 
  LogOut, 
  Zap,
  Box,
  LogIn
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

  const isImageUrl = (avatar) => {
    return typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'));
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    if (typeof user.avatar === 'string' && !isImageUrl(user.avatar)) {
      return user.avatar.slice(0, 2).toUpperCase();
    }
    const nameStr = user.name || user.email || 'User';
    return nameStr.charAt(0).toUpperCase();
  };

  const getDisplayName = (user) => {
    if (!user) return '';
    const nameStr = user.name || user.email?.split('@')[0] || 'Developer';
    return nameStr.split(' ')[0];
  };

  return (
    <header className="navbar-container">
      <div className="max-w-7xl navbar-inner">
        {/* Brand Logo */}
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
            <span className="neo-tag tag-green brand-sub-tag">LAB</span>
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
            Team
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

          {/* User Profile or Sign In CTA */}
          {currentUser ? (
            <div className="user-menu-wrap">
              <div 
                className="user-pill"
                onClick={() => setCurrentView('dashboard')}
                title="Go to Console"
              >
                <div className="user-avatar-icon">
                  {isImageUrl(currentUser.avatar) ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="User Avatar" 
                      className="user-avatar-img" 
                    />
                  ) : (
                    <span>{getInitials(currentUser)}</span>
                  )}
                </div>
                <span className="user-text-name">{getDisplayName(currentUser)}</span>
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
                <LogIn size={14} strokeWidth={2.5} />
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
          padding: 0.75rem 1.25rem;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 auto;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          user-select: none;
          flex-shrink: 0;
        }

        .logo-box {
          width: 36px;
          height: 36px;
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
          gap: 0.5rem;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #000000;
        }

        .brand-title-accent {
          background: var(--neo-cyan);
          padding: 0 0.2rem;
          border: 1.5px solid #000;
          box-shadow: 1.5px 1.5px 0px #000;
          margin-left: 0.15rem;
        }

        .brand-sub-tag {
          font-size: 0.65rem;
          padding: 0.15rem 0.45rem;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-btn {
          background: transparent;
          border: 2px solid transparent;
          color: #000000;
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
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
        }

        .nav-btn.active {
          background: var(--neo-yellow);
          border: var(--border-thick);
          box-shadow: var(--shadow-sm);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .strategy-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
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
          padding: 0.25rem 0.65rem 0.25rem 0.35rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 800;
          font-size: 0.85rem;
          transition: all var(--transition-fast);
          max-width: 140px;
        }

        .user-pill:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
        }

        .user-avatar-icon {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: var(--radius-xs);
          background: var(--neo-purple);
          border: 1.5px solid #000;
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-text-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
