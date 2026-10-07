import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  ArrowRight,
  Box
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/initialData';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const user = {
        name: mode === 'signup' ? (name || 'New Engineer') : (email.split('@')[0]),
        email: email,
        role: selectedRole,
        avatar: (name || email)[0].toUpperCase(),
        token: 'jwt_mock_podlaunch_' + Math.random().toString(36).substring(7)
      };
      onLoginSuccess(user);
      onClose();
    }, 400);
  };

  const handleQuickLogin = (member) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: member.name,
        email: `${member.github}@podlaunch.local`,
        role: member.role,
        avatar: member.avatar,
        token: 'jwt_mock_podlaunch_' + member.github
      };
      onLoginSuccess(user);
      onClose();
    }, 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-card neo-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose}>
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-icon-box">
            <Box size={24} strokeWidth={2.5} color="#000" />
          </div>
          <h2 className="auth-title">
            {mode === 'signin' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin' 
              ? 'Access PodLaunch container telemetry & execution console' 
              : 'Join the Group-22 serverless research lab'}
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="quick-login-section">
          <div className="quick-login-label">
            <Sparkles size={13} strokeWidth={2.5} />
            <span>1-Click Log In as Team Member / Guest:</span>
          </div>
          <div className="quick-buttons-grid">
            {TEAM_MEMBERS.map((member, idx) => (
              <button 
                key={idx}
                type="button"
                className="quick-btn"
                onClick={() => handleQuickLogin(member)}
                title={member.role}
              >
                <span className="quick-avatar" style={{ background: member.color }}>{member.avatar}</span>
                <span className="quick-name">{member.name.split(' ')[0]}</span>
              </button>
            ))}
            <button 
              type="button"
              className="quick-btn guest-btn"
              onClick={() => handleQuickLogin({
                name: "Guest Evaluator",
                role: "Academic Reviewer",
                github: "guest_reviewer",
                avatar: "GR"
              })}
            >
              <span className="quick-avatar" style={{ background: 'var(--neo-cyan)' }}>GR</span>
              <span className="quick-name">Guest</span>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Linus Torvalds"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="developer@podlaunch.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-yellow auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Console' : 'Create Account'}</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="auth-footer-toggle">
          {mode === 'signin' ? (
            <p>
              Need an account?{' '}
              <button 
                type="button" 
                className="text-toggle-btn"
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Sign Up Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button" 
                className="text-toggle-btn"
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 2.25rem;
          background: #FFFFFF;
          border: var(--border-heavy);
          box-shadow: var(--shadow-xl);
          position: relative;
        }

        .auth-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: #FFFFFF;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .auth-close-btn:hover {
          background: var(--neo-coral);
          color: #FFFFFF;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .auth-icon-box {
          width: 48px;
          height: 48px;
          margin: 0 auto 0.75rem;
          background: var(--neo-yellow);
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 3px 3px 0px #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #000000;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .quick-login-section {
          background: var(--bg-page-alt);
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          margin-bottom: 1.25rem;
          box-shadow: 2px 2px 0px #000;
        }

        .quick-login-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 800;
          color: #000000;
          text-transform: uppercase;
          margin-bottom: 0.65rem;
        }

        .quick-buttons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.5rem;
          background: #FFFFFF;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
          color: #000000;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quick-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000;
        }

        .quick-avatar {
          width: 20px;
          height: 20px;
          border: 1px solid #000;
          border-radius: 2px;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 2px solid #000;
        }

        .auth-divider span {
          padding: 0 0.75rem;
        }

        .auth-submit-btn {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.85rem;
        }

        .auth-error-banner {
          background: var(--neo-coral);
          border: var(--border-thick);
          color: #FFFFFF;
          font-weight: 700;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
          margin-bottom: 1rem;
          box-shadow: 2px 2px 0px #000;
        }

        .auth-footer-toggle {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .text-toggle-btn {
          background: none;
          border: none;
          color: #000000;
          font-weight: 800;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
