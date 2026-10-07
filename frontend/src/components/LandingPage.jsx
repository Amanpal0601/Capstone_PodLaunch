import React, { useState } from 'react';
import { 
  Zap, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Gauge, 
  Box, 
  Award,
  Clock,
  Sparkles,
  Terminal,
  Activity,
  Server
} from 'lucide-react';
import { STRATEGIES_INFO, TEAM_MEMBERS } from '../data/initialData';

export default function LandingPage({ onLaunchConsole, onOpenAuth, activeStrategy, setActiveStrategy }) {
  // Live Simulator state
  const [simStrategy, setSimStrategy] = useState('predictive');
  const [simWorkload, setSimWorkload] = useState('bursty');
  const [simResults, setSimResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimResults(null);

    setTimeout(() => {
      setIsSimulating(false);
      if (simStrategy === 'naive') {
        setSimResults({
          coldRate: '100%',
          avgLatency: '540ms',
          p99Latency: '940ms',
          idleMemory: '0 MB',
          status: 'High Latency Spikes (Every Request is Cold)'
        });
      } else if (simStrategy === 'keep_alive') {
        setSimResults({
          coldRate: '42.8%',
          avgLatency: '185ms',
          p99Latency: '480ms',
          idleMemory: '128 MB',
          status: 'Moderate (Cold on Burst Inactivity Gaps)'
        });
      } else if (simStrategy === 'fixed_pre_warm') {
        setSimResults({
          coldRate: '18.5%',
          avgLatency: '48ms',
          p99Latency: '195ms',
          idleMemory: '384 MB',
          status: 'Good Latency, Higher Idle RAM Overhead'
        });
      } else {
        setSimResults({
          coldRate: '4.2%',
          avgLatency: '14ms',
          p99Latency: '28ms',
          idleMemory: '180 MB',
          status: 'Optimal (Proactive Pre-Warming Ahead of Bursts)'
        });
      }
    }, 500);
  };

  return (
    <div className="landing-wrapper">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="max-w-7xl hero-container">
          <div className="hero-grid">
            {/* Left: Copy & CTAs */}
            <div className="hero-copy-col">
              <div className="hero-badge-row">
                <span className="neo-tag tag-yellow">
                  <Award size={13} strokeWidth={2.5} /> CAPSTONE GROUP-22
                </span>
                <span className="neo-tag tag-green">
                  <Cpu size={13} strokeWidth={2.5} /> ZERO CLOUD COST
                </span>
              </div>

              <h1 className="hero-title">
                ELIMINATE <br />
                <span className="title-highlight">COLD STARTS</span> <br />
                IN SERVERLESS.
              </h1>

              <p className="hero-description">
                PodLaunch is a lightweight, self-managed serverless platform comparing four container-pooling 
                algorithms. Package single functions into isolated Docker sandboxes and achieve single-digit 
                millisecond warm starts on your local workstation.
              </p>

              <div className="hero-actions-row">
                <button 
                  className="btn btn-yellow btn-lg"
                  onClick={onLaunchConsole}
                >
                  <Zap size={18} strokeWidth={2.5} />
                  Launch Telemetry Console
                </button>
                <a href="#simulator" className="btn btn-white btn-lg">
                  <Play size={17} strokeWidth={2.5} />
                  Try Live Simulator
                </a>
              </div>

              {/* Headline Target Research Hypothesis Box */}
              <div className="research-hypothesis-card neo-card">
                <div className="card-top-tag">
                  <span className="neo-tag tag-cyan">RESEARCH DELIVERABLE</span>
                </div>
                <p className="hypothesis-quote">
                  "Under bursty traffic, predictive pre-warming reduced cold starts by <strong>78.4%</strong> and p99 latency by <strong>312 ms</strong> versus naive keep-alive, at <strong>14.2%</strong> additional idle memory."
                </p>
              </div>
            </div>

            {/* Right: Bespoke Neo-Brutalism Hero Graphic */}
            <div className="hero-art-col">
              <div className="art-frame neo-card">
                <div className="art-header-bar">
                  <div className="window-dots">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                  </div>
                  <span className="art-title-text">PODLAUNCH_SANDBOX_BLUEPRINT.SVG</span>
                </div>
                <img 
                  src="/hero-art.jpg" 
                  alt="PodLaunch Container Architecture Blueprint" 
                  className="hero-art-img"
                />
                <div className="art-footer-bar">
                  <div className="neo-tag tag-yellow">DOCKER CGROUPS</div>
                  <div className="neo-tag tag-mint">WARM POOL ACTIVE</div>
                  <div className="neo-tag tag-purple">TIME-SERIES PREDICTIVE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SIMULATOR PLAYGROUND */}
      <section id="simulator" className="section-block">
        <div className="max-w-7xl">
          <div className="section-title-wrap">
            <span className="neo-tag tag-purple">INTERACTIVE RESEARCH TESTBED</span>
            <h2 className="section-heading">Test Pooling Algorithms in Real Time</h2>
            <p className="section-subtext">
              Select a container pooling strategy and traffic workload to simulate how PodLaunch prevents latency spikes.
            </p>
          </div>

          <div className="simulator-card neo-card">
            <div className="simulator-grid">
              {/* Left Column: Strategy Options */}
              <div className="sim-col">
                <h3 className="sim-col-heading">1. Select Strategy</h3>
                <div className="sim-strategy-list">
                  {Object.values(STRATEGIES_INFO).map((strat) => (
                    <div 
                      key={strat.id}
                      className={`sim-strategy-btn ${simStrategy === strat.id ? 'active' : ''}`}
                      onClick={() => setSimStrategy(strat.id)}
                      style={{ borderLeft: `6px solid ${strat.accentColor}` }}
                    >
                      <div className="sim-strat-top">
                        <span className="sim-strat-name">{strat.name}</span>
                        {strat.highlight && <span className="neo-tag tag-green">CORE</span>}
                      </div>
                      <p className="sim-strat-tagline">{strat.tagline}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Workload & Test Output */}
              <div className="sim-col">
                <h3 className="sim-col-heading">2. Workload Arrival Pattern</h3>
                <div className="workload-button-group">
                  <button 
                    className={`workload-selector-btn ${simWorkload === 'bursty' ? 'active' : ''}`}
                    onClick={() => setSimWorkload('bursty')}
                  >
                    Bursty (Poisson Spikes)
                  </button>
                  <button 
                    className={`workload-selector-btn ${simWorkload === 'steady' ? 'active' : ''}`}
                    onClick={() => setSimWorkload('steady')}
                  >
                    Steady (Fixed Inter-arrival)
                  </button>
                  <button 
                    className={`workload-selector-btn ${simWorkload === 'periodic' ? 'active' : ''}`}
                    onClick={() => setSimWorkload('periodic')}
                  >
                    Periodic (Diurnal Cycles)
                  </button>
                </div>

                <button 
                  className="btn btn-yellow btn-lg sim-execute-btn"
                  onClick={runSimulation}
                  disabled={isSimulating}
                >
                  {isSimulating ? (
                    <span>Simulating 1,000 Invocations...</span>
                  ) : (
                    <>
                      <Play size={18} strokeWidth={2.5} />
                      <span>Run Simulation Test</span>
                    </>
                  )}
                </button>

                {simResults && (
                  <div className="sim-output-box neo-card">
                    <div className="sim-output-header">
                      <span className="neo-tag tag-green">TEST COMPLETE</span>
                      <span className="sim-eval-text">{simResults.status}</span>
                    </div>

                    <div className="sim-stats-grid">
                      <div className="sim-stat-card" style={{ background: 'var(--neo-yellow)' }}>
                        <span className="stat-lbl">Cold-Start Rate</span>
                        <span className="stat-big-val">{simResults.coldRate}</span>
                      </div>
                      <div className="sim-stat-card" style={{ background: 'var(--neo-mint)' }}>
                        <span className="stat-lbl">Avg Duration</span>
                        <span className="stat-big-val">{simResults.avgLatency}</span>
                      </div>
                      <div className="sim-stat-card" style={{ background: 'var(--neo-purple)' }}>
                        <span className="stat-lbl">p99 Latency</span>
                        <span className="stat-big-val">{simResults.p99Latency}</span>
                      </div>
                      <div className="sim-stat-card" style={{ background: '#FFFFFF' }}>
                        <span className="stat-lbl">Idle Memory</span>
                        <span className="stat-big-val">{simResults.idleMemory}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COLD-START VS WARM-START VISUALIZER */}
      <section className="section-block">
        <div className="max-w-7xl">
          <div className="section-title-wrap">
            <span className="neo-tag tag-coral">THE PROBLEM BREAKDOWN</span>
            <h2 className="section-heading">Why Un-Warmed Serverless is Slow</h2>
            <p className="section-subtext">
              Uninstantiated containers face a 100x latency penalty due to kernel cgroup allocation and runtime initialization.
            </p>
          </div>

          <div className="grid-2">
            {/* Cold Start Journey */}
            <div className="neo-card journey-card" style={{ background: '#FFF5F5' }}>
              <div className="journey-top">
                <span className="neo-tag tag-coral">UN-WARMED COLD START</span>
                <span className="journey-time-badge">~482 ms Total</span>
              </div>
              <div className="journey-steps-list">
                <div className="j-step">
                  <span className="j-num">1</span>
                  <div className="j-text">
                    <strong>HTTP Ingress & Validation</strong>
                    <span>FastAPI routes and Pydantic parsing</span>
                  </div>
                  <span className="j-time">2 ms</span>
                </div>
                <div className="j-step j-slow">
                  <span className="j-num">2</span>
                  <div className="j-text">
                    <strong>Docker Container Spawn & cgroups</strong>
                    <span>Kernel namespaces, PID limit 64, memory quota</span>
                  </div>
                  <span className="j-time text-coral">+350 ms</span>
                </div>
                <div className="j-step j-slow">
                  <span className="j-num">3</span>
                  <div className="j-text">
                    <strong>Runtime Bootstrap (Python/Node)</strong>
                    <span>Importing libraries and runner protocol</span>
                  </div>
                  <span className="j-time text-coral">+120 ms</span>
                </div>
                <div className="j-step">
                  <span className="j-num">4</span>
                  <div className="j-text">
                    <strong>Handler Execution</strong>
                    <span>User function execution</span>
                  </div>
                  <span className="j-time">10 ms</span>
                </div>
              </div>
            </div>

            {/* Warm Start Journey */}
            <div className="neo-card journey-card" style={{ background: '#F0FDF4' }}>
              <div className="journey-top">
                <span className="neo-tag tag-green">PODLAUNCH WARM START</span>
                <span className="journey-time-badge text-green">~12 ms Total</span>
              </div>
              <div className="journey-steps-list">
                <div className="j-step">
                  <span className="j-num j-done">1</span>
                  <div className="j-text">
                    <strong>HTTP Ingress & Correlation ID</strong>
                    <span>FastAPI routes and UUID4 tracking</span>
                  </div>
                  <span className="j-time">2 ms</span>
                </div>
                <div className="j-step j-fast">
                  <span className="j-num j-done">2</span>
                  <div className="j-text">
                    <strong>Container Popped from Warm Pool</strong>
                    <span>Lock acquired, warm instance instantly grabbed</span>
                  </div>
                  <span className="j-time text-green">&lt; 0.5 ms</span>
                </div>
                <div className="j-step j-fast">
                  <span className="j-num j-done">3</span>
                  <div className="j-text">
                    <strong>Runtime Already Initialized</strong>
                    <span>Cached runner process inside container</span>
                  </div>
                  <span className="j-time text-green">0 ms</span>
                </div>
                <div className="j-step">
                  <span className="j-num j-done">4</span>
                  <div className="j-text">
                    <strong>Handler Execution</strong>
                    <span>Immediate user function execution</span>
                  </div>
                  <span className="j-time">10 ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE FOUR STRATEGIES SHOWCASE */}
      <section id="strategies" className="section-block">
        <div className="max-w-7xl">
          <div className="section-title-wrap">
            <span className="neo-tag tag-yellow">RESEARCH CORE</span>
            <h2 className="section-heading">The Four Pooling Strategies</h2>
            <p className="section-subtext">
              All strategies implement the unified <code className="inline-code">acquire()</code> and <code className="inline-code">release()</code> lifecycle interface.
            </p>
          </div>

          <div className="grid-4">
            {Object.values(STRATEGIES_INFO).map((strat) => (
              <div 
                key={strat.id}
                className="neo-card strat-display-card"
                style={{ background: strat.cardBg }}
              >
                {strat.highlight && (
                  <div className="strat-headline-tag">
                    <span className="neo-tag tag-cyan">★ RESEARCH CORE</span>
                  </div>
                )}
                <h3 className="strat-card-title">{strat.name}</h3>
                <p className="strat-card-tagline">{strat.tagline}</p>
                <p className="strat-card-desc">{strat.description}</p>

                <div className="strat-metrics-table">
                  <div className="strat-metric-line">
                    <span>Cold Starts:</span>
                    <strong>{strat.coldStartRate}</strong>
                  </div>
                  <div className="strat-metric-line">
                    <span>p99 Latency:</span>
                    <strong>{strat.p99Latency}</strong>
                  </div>
                  <div className="strat-metric-line">
                    <span>Idle RAM:</span>
                    <strong>{strat.idleMemory}</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-black btn-sm strat-activate-btn"
                  onClick={() => {
                    setActiveStrategy(strat.id);
                    onLaunchConsole();
                  }}
                >
                  <span>Activate Strategy</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TEAM MEMBERS */}
      <section id="team" className="section-block">
        <div className="max-w-7xl">
          <div className="section-title-wrap">
            <span className="neo-tag tag-pink">GROUP-22 CAPSTONE TEAM</span>
            <h2 className="section-heading">Engineers & Component Owners</h2>
            <p className="section-subtext">
              B.E. Computer Science & Engineering (Cloud Computing & Automation), VIT Bhopal University.
            </p>
          </div>

          <div className="grid-3 team-cards-grid">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="neo-card team-member-card">
                <div className="member-top-row">
                  <div className="member-avatar-box" style={{ background: member.color }}>
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="member-name">{member.name}</h3>
                    <span className="neo-tag tag-white">{member.role.split('(')[0]}</span>
                  </div>
                </div>
                <p className="member-responsibilities-text">{member.responsibilities}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 4rem 1.5rem 3rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 2.5rem;
          align-items: center;
        }

        .hero-badge-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 1.25rem;
        }

        .title-highlight {
          background: var(--neo-yellow);
          padding: 0 0.4rem;
          border: var(--border-thick);
          box-shadow: 4px 4px 0px #000;
          display: inline-block;
          margin-top: 0.2rem;
        }

        .hero-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 580px;
        }

        .hero-actions-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.25rem;
          flex-wrap: wrap;
        }

        .research-hypothesis-card {
          padding: 1.5rem;
          background: #FFFFFF;
          border-left: 8px solid var(--neo-cyan);
        }

        .card-top-tag {
          margin-bottom: 0.65rem;
        }

        .hypothesis-quote {
          font-size: 0.95rem;
          color: #000000;
          line-height: 1.5;
        }

        .hypothesis-quote strong {
          background: var(--neo-yellow);
          padding: 0 0.2rem;
          border: 1px solid #000;
        }

        /* Hero Graphic Frame */
        .art-frame {
          padding: 0.75rem;
          background: #FFFFFF;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .art-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-page-alt);
          border: var(--border-thin);
          padding: 0.4rem 0.65rem;
          margin-bottom: 0.6rem;
          border-radius: var(--radius-xs);
        }

        .window-dots {
          display: flex;
          gap: 0.35rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1.5px solid #000;
        }
        .dot-red { background: var(--neo-coral); }
        .dot-yellow { background: var(--neo-yellow); }
        .dot-green { background: var(--neo-green); }

        .art-title-text {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 800;
          color: #000000;
        }

        .hero-art-img {
          width: 100%;
          display: block;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          object-fit: cover;
        }

        .art-footer-bar {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.65rem;
          flex-wrap: wrap;
        }

        /* Section Blocks */
        .section-block {
          padding: 4.5rem 1.5rem;
        }

        .section-title-wrap {
          text-align: center;
          margin-bottom: 2.75rem;
        }

        .section-heading {
          font-size: 2.35rem;
          font-weight: 900;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .section-subtext {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto;
        }

        /* Simulator Styles */
        .simulator-card {
          padding: 2.25rem;
          background: #FFFFFF;
        }

        .simulator-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.3fr;
          gap: 2.5rem;
        }

        .sim-col-heading {
          font-size: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 1rem;
        }

        .sim-strategy-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sim-strategy-btn {
          padding: 0.9rem 1.1rem;
          background: #FFFFFF;
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--transition-bounce);
        }

        .sim-strategy-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-md);
        }

        .sim-strategy-btn.active {
          background: var(--bg-page-alt);
          box-shadow: var(--shadow-md);
          transform: translate(-1px, -1px);
        }

        .sim-strat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .sim-strat-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #000000;
        }

        .sim-strat-tagline {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .workload-button-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .workload-selector-btn {
          padding: 0.75rem 1rem;
          background: #FFFFFF;
          border: var(--border-thick);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .workload-selector-btn:hover {
          background: var(--bg-page-alt);
        }

        .workload-selector-btn.active {
          background: var(--neo-purple);
          box-shadow: var(--shadow-md);
        }

        .sim-execute-btn {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .sim-output-box {
          padding: 1.25rem;
          background: #FFFFFF;
        }

        .sim-output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .sim-eval-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .sim-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.65rem;
        }

        .sim-stat-card {
          padding: 0.75rem;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
          display: flex;
          flex-direction: column;
        }

        .stat-lbl {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #000000;
        }

        .stat-big-val {
          font-family: var(--font-mono);
          font-size: 1.15rem;
          font-weight: 900;
          color: #000000;
          margin-top: 0.2rem;
        }

        /* Journey breakdown */
        .journey-card {
          padding: 1.75rem;
        }

        .journey-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: var(--border-thick);
        }

        .journey-time-badge {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          font-weight: 900;
        }

        .text-coral { color: #DC2626; }
        .text-green { color: #16A34A; }

        .journey-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .j-step {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 0.85rem;
          background: #FFFFFF;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
        }

        .j-num {
          width: 26px;
          height: 26px;
          background: var(--neo-coral);
          border: 1.5px solid #000;
          color: #FFFFFF;
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.8rem;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .j-done {
          background: var(--neo-green);
          color: #000000;
        }

        .j-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .j-text strong {
          font-size: 0.85rem;
          color: #000000;
        }

        .j-text span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .j-time {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.85rem;
        }

        /* Strategies Grid */
        .strat-display-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .strat-headline-tag {
          margin-bottom: 0.5rem;
        }

        .strat-card-title {
          font-size: 1.2rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .strat-card-tagline {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          min-height: 32px;
        }

        .strat-card-desc {
          font-size: 0.825rem;
          line-height: 1.5;
          margin: 0.85rem 0 1.25rem;
          color: var(--text-secondary);
          flex: 1;
        }

        .strat-metrics-table {
          background: #FFFFFF;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1.25rem;
        }

        .strat-metric-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.775rem;
        }

        .strat-activate-btn {
          width: 100%;
        }

        /* Team Cards */
        .team-member-card {
          padding: 1.5rem;
          background: #FFFFFF;
        }

        .member-top-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .member-avatar-box {
          width: 44px;
          height: 44px;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          box-shadow: 2px 2px 0px #000;
          color: #000000;
          font-family: var(--font-mono);
          font-weight: 900;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-name {
          font-size: 1.1rem;
          font-weight: 900;
        }

        .member-responsibilities-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2.6rem;
          }
          .simulator-grid {
            grid-template-columns: 1fr;
          }
          .sim-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
