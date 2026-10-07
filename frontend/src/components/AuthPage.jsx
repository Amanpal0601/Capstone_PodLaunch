import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Box, 
  Terminal, 
  Zap, 
  Layers 
} from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { TEAM_MEMBERS } from '../data/initialData';

// Neo-Brutalist appearance customization for Clerk components
const clerkNeoBrutalistAppearance = {
  elements: {
    rootBox: {
      width: '100%',
    },
    card: {
      background: '#FFFFFF',
      border: '3px solid #000000',
      borderRadius: '10px',
      boxShadow: '6px 6px 0px #000000',
      padding: '2rem',
    },
    headerTitle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '900',
      fontSize: '1.6rem',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: '-0.03em',
    },
    headerSubtitle: {
      color: '#475569',
      fontSize: '0.9rem',
    },
    socialButtonsBlockButton: {
      border: '2.5px solid #000000',
      borderRadius: '6px',
      boxShadow: '3px 3px 0px #000000',
      fontWeight: '800',
      fontFamily: 'Outfit, sans-serif',
      transition: 'all 0.1s ease',
      '&:hover': {
        background: '#F8FAFC',
        transform: 'translate(-2px, -2px)',
        boxShadow: '5px 5px 0px #000000',
      }
    },
    formButtonPrimary: {
      background: '#FFE600',
      color: '#000000',
      border: '2.5px solid #000000',
      borderRadius: '6px',
      boxShadow: '3px 3px 0px #000000',
      fontWeight: '900',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.95rem',
      textTransform: 'uppercase',
      transition: 'all 0.1s ease',
      '&:hover': {
        background: '#FFD700',
        transform: 'translate(-2px, -2px)',
        boxShadow: '5px 5px 0px #000000',
      }
    },
    formFieldInput: {
      border: '2px solid #000000',
      borderRadius: '6px',
      boxShadow: '2px 2px 0px #000000',
      fontWeight: '600',
      '&:focus': {
        background: '#FFFDF0',
        borderColor: '#000000',
        boxShadow: '4px 4px 0px #000000',
      }
    },
    footerActionLink: {
      color: '#000000',
      fontWeight: '800',
      textDecoration: 'underline',
    }
  }
};

export default function AuthPage({ 
  onLoginSuccess, 
  onBack, 
  initialMode = 'signin',
  isClerkEnabled = false,
  clerkUser = null,
  onClerkSignOut = null
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  const handleQuickLogin = (member) => {
    const user = {
      name: member.name,
      email: `${member.github}@podlaunch.local`,
      role: member.role,
      avatar: member.avatar,
      token: 'jwt_mock_podlaunch_' + member.github
    };
    onLoginSuccess(user);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Breadcrumb & Return Button */}
      <div className="auth-page-top max-w-7xl">
        <button className="auth-back-btn" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back to Console</span>
        </button>
        <div className="auth-status-tags">
          <span className="neo-tag tag-yellow">CONTROL PLANE ACCESS</span>
          <span className="neo-tag tag-green">CLERK AUTH: ACTIVE</span>
        </div>
      </div>

      <div className="auth-page-container max-w-7xl">
        {/* Left Column: Platform & Capstone Highlights */}
        <div className="auth-info-column">
          <div className="auth-info-card neo-card">
            <div className="auth-badge-header">
              <span className="neo-tag tag-cyan">GROUP-22 CAPSTONE</span>
              <span className="neo-tag tag-purple">VIT BHOPAL</span>
            </div>

            <h1 className="auth-hero-title">
              Authenticate into <br />
              <span className="text-highlight">PodLaunch Platform</span>
            </h1>

            <p className="auth-hero-desc">
              Deploy standalone functions, trigger synthetic Poisson workloads, inspect sub-millisecond 
              warm starts, and evaluate four cold-start optimization policies in real-time.
            </p>

            <div className="auth-features-list">
              <div className="auth-feat-item">
                <div className="auth-feat-icon icon-yellow">
                  <Zap size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="auth-feat-title">Sub-Millisecond Cold Starts</h4>
                  <p className="auth-feat-sub">Predictive pre-warming reduces cold start latency by up to 95%.</p>
                </div>
              </div>

              <div className="auth-feat-item">
                <div className="auth-feat-icon icon-mint">
                  <ShieldCheck size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="auth-feat-title">Isolated Docker Sandboxes</h4>
                  <p className="auth-feat-sub">Strict cgroup limits: 128MB RAM, 0.5 CPU, zero network egress.</p>
                </div>
              </div>

              <div className="auth-feat-item">
                <div className="auth-feat-icon icon-cyan">
                  <Terminal size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="auth-feat-title">Zero Hot-Path Telemetry</h4>
                  <p className="auth-feat-sub">Non-blocking async telemetry logging to PostgreSQL.</p>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Login Preset Buttons */}
            <div className="auth-quick-section" style={{ marginTop: '1.5rem', paddingTop: '1.25rem' }}>
              <div className="quick-login-label">
                <Sparkles size={14} strokeWidth={2.5} />
                <span>1-Click Team Member Bypass:</span>
              </div>
              <div className="quick-profiles-grid">
                {TEAM_MEMBERS.map((member, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className="quick-profile-btn"
                    onClick={() => handleQuickLogin(member)}
                  >
                    <span className="qp-avatar" style={{ backgroundColor: member.color }}>
                      {member.avatar}
                    </span>
                    <div className="qp-info">
                      <span className="qp-name">{member.name}</span>
                      <span className="qp-role">{member.role.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clerk Neo-Brutalist Authentication Component */}
        <div className="auth-form-column">
          {isClerkEnabled ? (
            <div className="clerk-container-wrapper">
              {mode === 'signin' ? (
                <SignIn 
                  routing="hash"
                  appearance={clerkNeoBrutalistAppearance}
                  signUpUrl="#signup"
                  afterSignInUrl="/"
                />
              ) : (
                <SignUp 
                  routing="hash"
                  appearance={clerkNeoBrutalistAppearance}
                  signInUrl="#signin"
                  afterSignUpUrl="/"
                />
              )}
            </div>
          ) : (
            <div className="auth-form-card neo-card">
              <h2 className="auth-hero-title" style={{ fontSize: '1.6rem' }}>Connect Clerk Auth</h2>
              <p className="auth-hero-desc">
                Paste your Clerk Publishable Key in <code>frontend/.env</code> to activate live authentication.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
