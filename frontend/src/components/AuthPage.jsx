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
import { TEAM_MEMBERS } from '../data/initialData';

export default function AuthPage({ 
  onLoginSuccess, 
  onBack, 
  initialMode = 'signin',
  isClerkEnabled = false,
  clerkUser = null,
  onClerkSignOut = null
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  // Handle direct custom submit (or Clerk integration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      // If Clerk is enabled and window.Clerk is initialized
      if (isClerkEnabled && window?.Clerk) {
        if (mode === 'signin') {
          const result = await window.Clerk.client.signIn.create({
            identifier: email,
            password: password,
          });
          if (result.status === 'complete') {
            await window.Clerk.setActive({ session: result.createdSessionId });
            onLoginSuccess({
              name: result.identifier || email.split('@')[0],
              email: email,
              role: selectedRole,
              avatar: email[0].toUpperCase(),
              token: result.createdSessionId
            });
            return;
          }
        } else {
          const result = await window.Clerk.client.signUp.create({
            emailAddress: email,
            password: password,
            firstName: name || email.split('@')[0],
          });
          
          await window.Clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setPendingVerification(true);
          setLoading(false);
          return;
        }
      }

      // Simulation / Direct Authentication Fallback
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
      }, 400);
    } catch (err) {
      setLoading(false);
      setError(err?.errors?.[0]?.message || err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) return;
    setLoading(true);
    setError('');

    try {
      if (isClerkEnabled && window?.Clerk) {
        const completeSignUp = await window.Clerk.client.signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });
        if (completeSignUp.status === 'complete') {
          await window.Clerk.setActive({ session: completeSignUp.createdSessionId });
          onLoginSuccess({
            name: name || email.split('@')[0],
            email: email,
            role: selectedRole,
            avatar: (name || email)[0].toUpperCase(),
            token: completeSignUp.createdSessionId
          });
          return;
        }
      }
      
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({
          name: name || email.split('@')[0],
          email: email,
          role: selectedRole,
          avatar: (name || email)[0].toUpperCase(),
          token: 'jwt_clerk_verified_' + Date.now()
        });
      }, 400);
    } catch (err) {
      setLoading(false);
      setError(err?.errors?.[0]?.message || err.message || 'Invalid verification code.');
    }
  };

  const handleOAuthLogin = async (strategy) => {
    setLoading(true);
    setError('');
    try {
      if (isClerkEnabled && window?.Clerk) {
        await window.Clerk.client.signIn.authenticateWithRedirect({
          strategy: strategy,
          redirectUrl: window.location.href,
          redirectUrlComplete: window.location.href
        });
        return;
      }
      // Demo OAuth simulation
      setTimeout(() => {
        setLoading(false);
        const providerName = strategy.includes('google') ? 'Google User' : 'GitHub Engineer';
        onLoginSuccess({
          name: providerName,
          email: `user@${strategy.includes('google') ? 'gmail.com' : 'github.com'}`,
          role: 'Cloud Engineer',
          avatar: providerName[0],
          token: `oauth_${strategy}_` + Math.random().toString(36).substring(7)
        });
      }, 400);
    } catch (err) {
      setLoading(false);
      setError(err?.errors?.[0]?.message || err.message || 'OAuth authentication failed.');
    }
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
    }, 300);
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
          <span className={`neo-tag ${isClerkEnabled ? 'tag-green' : 'tag-coral'}`}>
            {isClerkEnabled ? 'CLERK AUTH: CONNECTED' : 'CLERK AUTH: STANDBY'}
          </span>
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
              Secure Access to <br />
              <span className="text-highlight">PodLaunch Lab</span>
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
                  <p className="auth-feat-sub">Predictive pre-warming reduces cold latency by up to 95%.</p>
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

            {/* Clerk Setup Assistant Banner */}
            {!isClerkEnabled && (
              <div className="auth-clerk-notice">
                <div className="clerk-notice-head">
                  <Key size={15} strokeWidth={2.5} color="#000" />
                  <span>Clerk API Setup Ready</span>
                </div>
                <p className="clerk-notice-text">
                  Provide your Clerk Publishable Key in <code>frontend/.env</code> as:
                  <br />
                  <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Neo-Brutalist Authentication Card */}
        <div className="auth-form-column">
          <div className="auth-form-card neo-card">
            {/* Mode Switcher Tabs */}
            <div className="auth-mode-switch">
              <button 
                type="button"
                className={`auth-mode-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => { setMode('signin'); setPendingVerification(false); setError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`auth-mode-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setPendingVerification(false); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={16} strokeWidth={2.5} />
                <span>{error}</span>
              </div>
            )}

            {!pendingVerification ? (
              <>
                {/* Social OAuth Providers */}
                <div className="oauth-buttons-grid">
                  <button 
                    type="button"
                    className="oauth-btn"
                    onClick={() => handleOAuthLogin('oauth_google')}
                    disabled={loading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button 
                    type="button"
                    className="oauth-btn"
                    onClick={() => handleOAuthLogin('oauth_github')}
                    disabled={loading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                <div className="auth-divider">
                  <span>OR WITH EMAIL</span>
                </div>

                {/* Main Auth Form */}
                <form onSubmit={handleSubmit} className="auth-form-body">
                  {mode === 'signup' && (
                    <div className="input-group">
                      <label className="input-label">FULL NAME</label>
                      <div className="input-with-icon">
                        <User size={16} className="input-icon" />
                        <input 
                          type="text" 
                          className="neo-input" 
                          placeholder="e.g. Aman Pal"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={mode === 'signup'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label className="input-label">EMAIL ADDRESS</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input 
                        type="email" 
                        className="neo-input" 
                        placeholder="engineer@podlaunch.local"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">PASSWORD</label>
                    <div className="input-with-icon">
                      <Lock size={16} className="input-icon" />
                      <input 
                        type="password" 
                        className="neo-input" 
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div className="input-group">
                      <label className="input-label">RESEARCH ROLE</label>
                      <select 
                        className="neo-input"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        <option value="Function Registry Lead">Function Registry Lead</option>
                        <option value="Scheduler & Queue Engineer">Scheduler & Queue Engineer</option>
                        <option value="Pool Manager Researcher">Pool Manager Researcher</option>
                        <option value="Sandbox & Docker Engineer">Sandbox & Docker Engineer</option>
                        <option value="Telemetry & Benchmarking Lead">Telemetry & Benchmarking Lead</option>
                        <option value="Guest Researcher">Guest Researcher / Reviewer</option>
                      </select>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-yellow auth-submit-btn"
                    disabled={loading}
                  >
                    <span>{loading ? 'Authenticating...' : (mode === 'signin' ? 'Sign In to Console' : 'Complete Registration')}</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                </form>
              </>
            ) : (
              /* Clerk OTP Verification Step */
              <form onSubmit={handleVerifyCode} className="auth-form-body">
                <div className="verification-box">
                  <Mail size={24} strokeWidth={2} color="#000" />
                  <h3>Verify Your Email</h3>
                  <p>A verification code was sent to <strong>{email}</strong>.</p>
                </div>

                <div className="input-group">
                  <label className="input-label">6-DIGIT VERIFICATION CODE</label>
                  <input 
                    type="text" 
                    className="neo-input text-center font-mono" 
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-green auth-submit-btn"
                  disabled={loading}
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Console'}</span>
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Login Preset Buttons */}
            <div className="auth-quick-section">
              <div className="quick-login-label">
                <Sparkles size={14} strokeWidth={2.5} />
                <span>1-Click Team Member Profiles:</span>
              </div>
              <div className="quick-profiles-grid">
                {TEAM_MEMBERS.map((member, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className="quick-profile-btn"
                    onClick={() => handleQuickLogin(member)}
                    disabled={loading}
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
      </div>
    </div>
  );
}
