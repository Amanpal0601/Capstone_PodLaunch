import React from 'react';
import { Box, ShieldAlert, Cpu, Award, Terminal } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/initialData';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-container">
      <div className="max-w-7xl footer-content">
        {/* Left: Brand & Purpose */}
        <div className="footer-col brand-col">
          <div className="brand-logo">
            <div className="logo-box-sm">
              <Box size={18} strokeWidth={2.5} color="#000" />
            </div>
            <span className="brand-title-sm">PODLAUNCH</span>
            <span className="neo-tag tag-yellow">B.E. CAPSTONE</span>
          </div>
          <p className="footer-desc">
            A self-managed, lightweight serverless function execution platform focused on cold-start optimization, container pooling algorithms, and zero cloud hosting costs.
          </p>
          <div className="neo-tag tag-white" style={{ alignSelf: 'flex-start' }}>
            <span>Group-22 • VIT Bhopal University</span>
          </div>
        </div>

        {/* Center: Capstone Student Engineers */}
        <div className="footer-col team-col">
          <h4 className="footer-heading">Project Engineers (Group-22)</h4>
          <div className="team-badges-grid">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="team-footer-badge" style={{ backgroundColor: member.color }}>
                <span className="footer-avatar">{member.avatar}</span>
                <div className="footer-member-info">
                  <span className="footer-name">{member.name}</span>
                  <span className="footer-role">{member.role.split('(')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Architecture Specs & Navigation */}
        <div className="footer-col links-col">
          <h4 className="footer-heading">System Specs & Links</h4>
          <ul className="footer-links-list">
            <li>
              <a href="#strategies" className="footer-link-btn">
                <span>→ 4 Pooling Strategies</span>
              </a>
            </li>
            <li>
              <span 
                className="footer-link-btn" 
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                <span>→ Telemetry Console</span>
              </span>
            </li>
            <li>
              <span 
                className="footer-link-btn" 
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                <span>→ Six Shared Contracts</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="footer-bottom-bar">
        <div className="max-w-7xl footer-bottom-inner">
          <div className="security-notice-box">
            <ShieldAlert size={16} strokeWidth={2.5} color="#000" />
            <span>
              <strong>Defense-in-Depth Notice:</strong> PodLaunch utilizes Docker cgroups, PID limits, and disabled networking as a research boundary for benchmarking. Designed for local developer machines.
            </span>
          </div>
          <div className="copyright-text">
            © {new Date().getFullYear()} PodLaunch Team (Group-22). CSE (Cloud Computing & Automation).
          </div>
        </div>
      </div>

      <style>{`
        .footer-container {
          background: #FFFFFF;
          border-top: var(--border-heavy);
          margin-top: auto;
          position: relative;
          z-index: 10;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1.4fr 1.6fr 1fr;
          gap: 2.5rem;
          padding: 3rem 1.5rem 2.5rem;
        }

        .logo-box-sm {
          width: 30px;
          height: 30px;
          background: var(--neo-yellow);
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
        }

        .brand-title-sm {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .footer-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .footer-heading {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 1rem;
          color: #000000;
          display: inline-block;
          background: var(--neo-yellow);
          padding: 0.2rem 0.6rem;
          border: var(--border-thick);
          box-shadow: var(--shadow-sm);
        }

        .team-badges-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.65rem;
        }

        .team-footer-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.65rem;
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          box-shadow: 2px 2px 0px #000;
        }

        .footer-avatar {
          width: 22px;
          height: 22px;
          background: #000000;
          color: #FFFFFF;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 800;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-member-info {
          display: flex;
          flex-direction: column;
        }

        .footer-name {
          font-size: 0.825rem;
          font-weight: 800;
          color: #000000;
          line-height: 1.1;
        }

        .footer-role {
          font-size: 0.68rem;
          color: #334155;
          font-weight: 600;
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .footer-link-btn {
          display: inline-block;
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 800;
          color: #000000;
          padding: 0.35rem 0.65rem;
          background: var(--bg-page-alt);
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-xs);
          transition: all var(--transition-fast);
        }

        .footer-link-btn:hover {
          background: var(--neo-cyan);
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000;
        }

        .footer-bottom-bar {
          background: var(--bg-page-alt);
          border-top: var(--border-thick);
          padding: 1rem 0;
        }

        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .security-notice-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          color: #334155;
          max-width: 850px;
        }

        .copyright-text {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: #000000;
        }

        @media (max-width: 900px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
          .team-badges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
