import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Terminal, 
  Play, 
  Sparkles,
  FileCode,
  CheckCircle2,
  Loader2,
  Box
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CODE_TEMPLATES = {
  "python3.11": `import json
import time

def handler(event, context):
    """PodLaunch Serverless Python Function"""
    start_time = time.time()
    payload = event.get("data", "Hello PodLaunch!")
    
    # Process computation
    result = {
        "echo": payload,
        "length": len(payload),
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "cold_start_optimized": True
    }
    
    return {
        "status": "SUCCESS",
        "output": result,
        "exec_time_ms": round((time.time() - start_time) * 1000, 2)
    }`,
  "node18": `exports.handler = async (event, context) => {
  const startTime = Date.now();
  const payload = event.data || "Hello PodLaunch Node.js!";
  
  return {
    status: "SUCCESS",
    output: {
      echo: payload,
      runtime: "Node 18.x",
      timestamp: new Date().toISOString()
    },
    exec_time_ms: Date.now() - startTime
  };
};`
};

export default function DeployModal({ isOpen, onClose, onDeploySuccess }) {
  const [functionName, setFunctionName] = useState('');
  const [runtime, setRuntime] = useState('python3.11');
  const [entryPoint, setEntryPoint] = useState('handler.handler');
  const [memoryLimitMb, setMemoryLimitMb] = useState(128);
  const [timeoutSeconds, setTimeoutSeconds] = useState(5.0);
  const [code, setCode] = useState(CODE_TEMPLATES['python3.11']);
  
  // State Machine: 'idle' | 'pending' | 'building' | 'ready'
  const [buildStep, setBuildStep] = useState('idle');
  const [buildLogs, setBuildLogs] = useState([]);
  const [generatedHash, setGeneratedHash] = useState('');

  if (!isOpen) return null;

  const handleRuntimeChange = (newRuntime) => {
    setRuntime(newRuntime);
    setCode(CODE_TEMPLATES[newRuntime]);
    setEntryPoint(newRuntime.startsWith('python') ? 'handler.handler' : 'index.handler');
  };

  const handleStartDeploy = (e) => {
    e.preventDefault();
    if (!functionName) return;

    setBuildStep('pending');
    setBuildLogs(['[1/4] Validating function entry point and configuration bounds...']);

    const simulatedHash = 'sha256_' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setGeneratedHash(simulatedHash);

    setTimeout(() => {
      setBuildStep('building');
      setBuildLogs(prev => [
        ...prev,
        `[2/4] Generated Content SHA-256: ${simulatedHash.substring(0, 18)}...`,
        `[3/4] Packaging multi-stage Dockerfile: runtime=${runtime}, memory=${memoryLimitMb}MB...`,
        `[3/4] Caching dependency layer separate from code layer for rapid rebuilds...`
      ]);

      setTimeout(() => {
        setBuildStep('ready');
        setBuildLogs(prev => [
          ...prev,
          `[4/4] Image built successfully: podlaunch/${functionName}:latest`,
          `[4/4] Saved in PostgreSQL function_versions metadata table. Build Status: READY.`
        ]);

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (err) {}

        const newFunction = {
          id: `fn-${Date.now().toString().slice(-4)}`,
          name: functionName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          version: "v1.0.0",
          versionHash: simulatedHash.substring(0, 16),
          runtime: runtime,
          entryPoint: entryPoint,
          memoryLimitMb: Number(memoryLimitMb),
          timeoutSeconds: Number(timeoutSeconds),
          status: "Ready",
          invocationsCount: 0,
          avgDurationMs: 0,
          code: code
        };

        setTimeout(() => {
          onDeploySuccess(newFunction);
          onClose();
          setBuildStep('idle');
          setFunctionName('');
          setBuildLogs([]);
        }, 1400);

      }, 1000);
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="deploy-card neo-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="deploy-header">
          <div className="deploy-title-wrap">
            <div className="deploy-icon-box">
              <FileCode size={20} strokeWidth={2.5} color="#000" />
            </div>
            <div>
              <h2 className="deploy-title">DEPLOY SERVERLESS FUNCTION</h2>
              <p className="deploy-subtitle">Function Registry & Multi-Stage Docker Packaging</p>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {buildStep !== 'idle' ? (
          /* Live Build State Machine View */
          <div className="build-progress-view">
            <div className="build-state-pills">
              <div className={`state-box ${buildStep === 'pending' ? 'box-active' : 'box-done'}`}>
                <span>1. PENDING</span>
              </div>
              <div className={`state-box ${buildStep === 'building' ? 'box-active' : buildStep === 'ready' ? 'box-done' : ''}`}>
                <span>2. BUILDING</span>
              </div>
              <div className={`state-box ${buildStep === 'ready' ? 'box-done-ready' : ''}`}>
                <span>3. READY</span>
              </div>
            </div>

            <div className="build-terminal-box">
              <div className="terminal-header-bar">
                <Terminal size={14} />
                <span>docker-py Build Output & Version Registrar</span>
              </div>
              <div className="terminal-body">
                {buildLogs.map((log, i) => (
                  <div key={i} className="t-line">{log}</div>
                ))}
                {buildStep === 'building' && (
                  <div className="t-line t-pulse">
                    <Loader2 size={13} className="inline-spin" /> Packaging Docker layers into container image...
                  </div>
                )}
                {buildStep === 'ready' && (
                  <div className="t-line t-success">
                    <CheckCircle2 size={14} className="inline-icon" /> Function is deployed and ready in registry!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Deployment Form */
          <form onSubmit={handleStartDeploy} className="deploy-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Function Name (Slug)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. data-transformer-py"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Runtime Environment</label>
                <select 
                  className="form-select"
                  value={runtime}
                  onChange={(e) => handleRuntimeChange(e.target.value)}
                >
                  <option value="python3.11">Python 3.11 (Debian Slim)</option>
                  <option value="node18">Node.js 18 (Alpine LTS)</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Entry Point</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={entryPoint}
                  onChange={(e) => setEntryPoint(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Memory Limit ({memoryLimitMb} MB)</label>
                <input 
                  type="range" 
                  min="64" 
                  max="512" 
                  step="64"
                  className="form-range"
                  value={memoryLimitMb}
                  onChange={(e) => setMemoryLimitMb(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Timeout ({timeoutSeconds}s)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="1"
                  className="form-range"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(e.target.value)}
                />
              </div>
            </div>

            {/* Code Editor */}
            <div className="form-group">
              <div className="editor-top-bar">
                <span className="neo-tag tag-yellow">
                  <Code2 size={13} strokeWidth={2.5} /> {runtime}
                </span>
                <span className="editor-notes">Non-privileged container sandbox</span>
              </div>
              <textarea 
                className="form-textarea code-input-area"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={9}
                spellCheck="false"
              />
            </div>

            <div className="deploy-btn-row">
              <button 
                type="button" 
                className="btn btn-white" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-yellow"
              >
                <Sparkles size={16} strokeWidth={2.5} />
                Build & Register Image
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .deploy-card {
          width: 100%;
          max-width: 760px;
          padding: 2rem;
          background: #FFFFFF;
          border: var(--border-heavy);
          box-shadow: var(--shadow-xl);
        }

        .deploy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: var(--border-thick);
        }

        .deploy-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .deploy-icon-box {
          width: 40px;
          height: 40px;
          background: var(--neo-yellow);
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deploy-title {
          font-size: 1.3rem;
          font-weight: 900;
        }

        .deploy-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .form-range {
          width: 100%;
          accent-color: #000000;
          cursor: pointer;
        }

        .editor-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-page-alt);
          border: var(--border-thick);
          border-bottom: none;
          padding: 0.5rem 0.85rem;
          border-top-left-radius: var(--radius-sm);
          border-top-right-radius: var(--radius-sm);
        }

        .editor-notes {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .code-input-area {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          background: #0F172A;
          color: #38BDF8;
          line-height: 1.5;
        }

        .deploy-btn-row {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.25rem;
        }

        /* Build state machine visual */
        .build-progress-view {
          padding: 1rem 0;
        }

        .build-state-pills {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .state-box {
          padding: 0.75rem;
          text-align: center;
          background: #FFFFFF;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .state-box.box-active {
          background: var(--neo-yellow);
          color: #000000;
          box-shadow: 4px 4px 0px #000;
        }

        .state-box.box-done {
          background: var(--neo-mint);
          color: #000000;
        }

        .state-box.box-done-ready {
          background: var(--neo-green);
          color: #000000;
          box-shadow: 4px 4px 0px #000;
        }

        .build-terminal-box {
          background: #0F172A;
          border: var(--border-thick);
          box-shadow: 4px 4px 0px #000;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .terminal-header-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #1E293B;
          border-bottom: 1px solid #334155;
          padding: 0.45rem 0.85rem;
          color: #F8FAFC;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .terminal-body {
          padding: 1rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          min-height: 180px;
        }

        .t-line { color: #94A3B8; }
        .t-pulse { color: var(--neo-yellow); }
        .t-success { color: var(--neo-green); font-weight: 800; }

        .inline-spin {
          display: inline;
          animation: spin 1s linear infinite;
          vertical-align: middle;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
