import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileCode, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Plus, 
  Play, 
  Zap, 
  Clock, 
  Cpu, 
  Gauge, 
  Flame, 
  CheckCircle2, 
  Search, 
  Server,
  Box
} from 'lucide-react';
import { STRATEGIES_INFO } from '../data/initialData';
import DeployModal from './DeployModal';
import InvokeModal from './InvokeModal';

export default function Dashboard({ 
  functions, 
  setFunctions, 
  containers, 
  setContainers, 
  logs, 
  setLogs,
  activeStrategy, 
  setActiveStrategy 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'functions' | 'pool' | 'logs' | 'contracts'
  
  // Modals
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isInvokeOpen, setIsInvokeOpen] = useState(false);
  const [selectedFunctionForInvoke, setSelectedFunctionForInvoke] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  // Container TTL countdown ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prevContainers => 
        prevContainers.map(c => {
          if (c.state === 'WARM_IDLE') {
            const nextTTL = c.ttlRemainingSec > 1 ? c.ttlRemainingSec - 1 : 30;
            return { ...c, ttlRemainingSec: nextTTL };
          }
          return c;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenInvoke = (fn) => {
    setSelectedFunctionForInvoke(fn);
    setIsInvokeOpen(true);
  };

  const handleDeploySuccess = (newFn) => {
    setFunctions(prev => [newFn, ...prev]);
    setContainers(prev => [
      {
        id: `c-warm-${Date.now().toString().slice(-4)}`,
        functionName: newFn.name,
        version: newFn.version,
        state: "WARM_IDLE",
        memoryMb: newFn.memoryLimitMb,
        createdAt: "Just now",
        ttlRemainingSec: 30,
        invocationsServed: 0,
        ipAddress: `172.18.0.${Math.floor(Math.random()*20)+10}`
      },
      ...prev
    ]);
  };

  const handleInvocationExecuted = (newLog) => {
    setLogs(prev => [newLog, ...prev]);
    setFunctions(prev => 
      prev.map(f => {
        if (f.name === newLog.functionName) {
          return {
            ...f,
            invocationsCount: f.invocationsCount + 1,
            avgDurationMs: Math.round(((f.avgDurationMs * f.invocationsCount + newLog.durationMs) / (f.invocationsCount + 1)) * 10) / 10
          };
        }
        return f;
      })
    );
  };

  const handleReapContainers = () => {
    setContainers(prev => prev.filter(c => c.state === 'ACTIVE_RUNNING' || c.ttlRemainingSec > 5));
  };

  const handlePreWarmOne = () => {
    if (functions.length === 0) return;
    const targetFn = functions[0];
    const newContainer = {
      id: `c-prewarm-${Date.now().toString().slice(-4)}`,
      functionName: targetFn.name,
      version: targetFn.version,
      state: "WARM_IDLE",
      memoryMb: targetFn.memoryLimitMb,
      createdAt: "Just now",
      ttlRemainingSec: 30,
      invocationsServed: 0,
      ipAddress: `172.18.0.${Math.floor(Math.random()*30)+20}`
    };
    setContainers(prev => [newContainer, ...prev]);
  };

  const activeStrategyInfo = STRATEGIES_INFO[activeStrategy] || STRATEGIES_INFO.predictive;
  const filteredFunctions = functions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLogs = logs.filter(l => {
    if (logFilter === 'COLD') return l.coldStart;
    if (logFilter === 'WARM') return !l.coldStart;
    return true;
  });

  const totalInvocations = functions.reduce((acc, fn) => acc + fn.invocationsCount, 0) + logs.length;
  const totalIdleMemory = containers.filter(c => c.state === 'WARM_IDLE').reduce((acc, c) => acc + c.memoryMb, 0);

  return (
    <div className="dashboard-wrapper max-w-7xl">
      {/* Top Header */}
      <div className="dash-header-block">
        <div>
          <div className="dash-badge-row">
            <span className="neo-tag tag-yellow">CONTROL PLANE</span>
            <span className="neo-tag tag-green">LOCAL DOCKER ENGINE</span>
          </div>
          <h1 className="dash-main-title">Telemetry & Execution Console</h1>
        </div>

        {/* Strategy Switcher */}
        <div className="dash-header-actions">
          <div className="strat-switch-box">
            <span className="strat-switch-label">ACTIVE STRATEGY:</span>
            <select 
              className="strat-native-select"
              value={activeStrategy}
              onChange={(e) => setActiveStrategy(e.target.value)}
            >
              {Object.values(STRATEGIES_INFO).map((strat) => (
                <option key={strat.id} value={strat.id}>
                  {strat.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-yellow"
            onClick={() => setIsDeployOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            Deploy Function
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dash-tabs-row">
        <button 
          className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} strokeWidth={2.5} />
          Telemetry & Live Overview
        </button>
        <button 
          className={`dash-tab-btn ${activeTab === 'functions' ? 'active' : ''}`}
          onClick={() => setActiveTab('functions')}
        >
          <FileCode size={16} strokeWidth={2.5} />
          Functions ({functions.length})
        </button>
        <button 
          className={`dash-tab-btn ${activeTab === 'pool' ? 'active' : ''}`}
          onClick={() => setActiveTab('pool')}
        >
          <Layers size={16} strokeWidth={2.5} />
          Container Fleet ({containers.length})
        </button>
        <button 
          className={`dash-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={16} strokeWidth={2.5} />
          Invocations Log ({logs.length})
        </button>
        <button 
          className={`dash-tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <ShieldCheck size={16} strokeWidth={2.5} />
          Shared Contracts
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-body">
          <div className="grid-4">
            <div className="neo-card stat-metric-box" style={{ background: 'var(--neo-yellow)' }}>
              <span className="stat-card-title">COLD-START RATE</span>
              <div className="stat-card-number">{activeStrategyInfo.coldStartRate}</div>
              <span className="stat-card-sub">
                {activeStrategy === 'predictive' ? '-95.8% vs Naive' : 'Current Strategy Rate'}
              </span>
            </div>

            <div className="neo-card stat-metric-box" style={{ background: 'var(--neo-mint)' }}>
              <span className="stat-card-title">p99 TAIL LATENCY</span>
              <div className="stat-card-number">{activeStrategyInfo.p99Latency}</div>
              <span className="stat-card-sub">Warm Invocations</span>
            </div>

            <div className="neo-card stat-metric-box" style={{ background: 'var(--neo-purple)' }}>
              <span className="stat-card-title">IDLE MEMORY RAM</span>
              <div className="stat-card-number">{totalIdleMemory} MB</div>
              <span className="stat-card-sub">{containers.filter(c => c.state === 'WARM_IDLE').length} Warm Containers</span>
            </div>

            <div className="neo-card stat-metric-box" style={{ background: '#FFFFFF' }}>
              <span className="stat-card-title">TOTAL INVOCATIONS</span>
              <div className="stat-card-number">{totalInvocations.toLocaleString()}</div>
              <span className="stat-card-sub text-green">100% Zero-OOM Success</span>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            {/* Active Strategy Card */}
            <div className="neo-card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div className="panel-header-row">
                <h3 className="panel-headline">Active Pooling Policy: {activeStrategyInfo.name}</h3>
                <span className={`neo-tag ${activeStrategyInfo.badgeColor}`}>ACTIVE</span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {activeStrategyInfo.description}
              </p>

              <div className="telemetry-item-list">
                <div className="telemetry-line">
                  <span>Replenishment Strategy:</span>
                  <strong>
                    {activeStrategy === 'predictive' ? 'Time-Bucket Moving Average' : activeStrategy === 'fixed_pre_warm' ? 'Watermark (N=2)' : activeStrategy === 'keep_alive' ? 'TTL Window (30s)' : 'None (Cold Spawn)'}
                  </strong>
                </div>
                <div className="telemetry-line">
                  <span>Concurrency Lock:</span>
                  <strong>asyncio.Lock (Zero Double Handout)</strong>
                </div>
                <div className="telemetry-line">
                  <span>Docker Constraints:</span>
                  <strong>128MB RAM, 0.5 CPU, no-network</strong>
                </div>
              </div>
            </div>

            {/* Quick Invocation Hub */}
            <div className="neo-card" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <div className="panel-header-row">
                <h3 className="panel-headline">Instant Function Invocation Tester</h3>
                <span className="neo-tag tag-yellow">INTERACTIVE</span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Trigger immediate test requests to observe container pool resolution.
              </p>

              <div className="quick-functions-list">
                {functions.map(fn => (
                  <div key={fn.id} className="quick-fn-row">
                    <div>
                      <strong className="q-fn-title">{fn.name}</strong>
                      <div className="q-fn-meta">{fn.runtime} • {fn.memoryLimitMb}MB • {fn.avgDurationMs}ms avg</div>
                    </div>
                    <button 
                      className="btn btn-yellow btn-sm"
                      onClick={() => handleOpenInvoke(fn)}
                    >
                      <Play size={13} strokeWidth={2.5} />
                      Invoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUNCTIONS */}
      {activeTab === 'functions' && (
        <div className="tab-body">
          <div className="functions-action-bar">
            <div className="search-wrap">
              <Search size={16} strokeWidth={2.5} className="s-icon" />
              <input 
                type="text" 
                className="form-input search-input-field"
                placeholder="Search functions by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-yellow"
              onClick={() => setIsDeployOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Deploy Function
            </button>
          </div>

          <div className="grid-2">
            {filteredFunctions.map((fn) => (
              <div key={fn.id} className="neo-card fn-catalog-card">
                <div className="fn-card-top">
                  <div>
                    <div className="fn-badge-cluster">
                      <span className="neo-tag tag-yellow">{fn.runtime}</span>
                      <span className="neo-tag tag-purple">{fn.version}</span>
                      <span className="neo-tag tag-green">Ready</span>
                    </div>
                    <h3 className="fn-card-name">{fn.name}</h3>
                  </div>
                  <button 
                    className="btn btn-yellow btn-sm"
                    onClick={() => handleOpenInvoke(fn)}
                  >
                    <Play size={14} strokeWidth={2.5} />
                    Invoke
                  </button>
                </div>

                <div className="fn-specs-grid">
                  <div className="fn-spec-col">
                    <span>Entry Point:</span>
                    <strong>{fn.entryPoint}</strong>
                  </div>
                  <div className="fn-spec-col">
                    <span>Memory Limit:</span>
                    <strong>{fn.memoryLimitMb} MB</strong>
                  </div>
                  <div className="fn-spec-col">
                    <span>Timeout:</span>
                    <strong>{fn.timeoutSeconds}s</strong>
                  </div>
                  <div className="fn-spec-col">
                    <span>SHA-256 Hash:</span>
                    <strong className="font-mono">{fn.versionHash}</strong>
                  </div>
                </div>

                <div className="fn-code-box">
                  <pre>
                    <code>{fn.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTAINER POOL FLEET */}
      {activeTab === 'pool' && (
        <div className="tab-body">
          <div className="neo-card fleet-summary-bar">
            <div className="fleet-stats-cluster">
              <div className="fleet-stat-col">
                <span className="f-lbl">Active Strategy</span>
                <span className="f-val">{activeStrategyInfo.name}</span>
              </div>
              <div className="fleet-stat-col">
                <span className="f-lbl">Warm Idle</span>
                <span className="f-val">{containers.filter(c => c.state === 'WARM_IDLE').length}</span>
              </div>
              <div className="fleet-stat-col">
                <span className="f-lbl">Active Running</span>
                <span className="f-val">{containers.filter(c => c.state === 'ACTIVE_RUNNING').length}</span>
              </div>
              <div className="fleet-stat-col">
                <span className="f-lbl">Allocated Idle RAM</span>
                <span className="f-val">{totalIdleMemory} MB</span>
              </div>
            </div>

            <div className="fleet-btn-actions">
              <button className="btn btn-white btn-sm" onClick={handlePreWarmOne}>
                <Plus size={14} strokeWidth={2.5} />
                Force Pre-Warm Container
              </button>
              <button className="btn btn-yellow btn-sm" onClick={handleReapContainers}>
                <Flame size={14} strokeWidth={2.5} />
                Trigger TTL Reaper
              </button>
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: '1.5rem' }}>
            {containers.map((c) => (
              <div key={c.id} className="neo-card container-card">
                <div className="c-top-bar">
                  <div className="c-title-cluster">
                    <Server size={18} strokeWidth={2.5} />
                    <span className="c-id-name">{c.id}</span>
                  </div>
                  <span className={`neo-tag ${c.state === 'ACTIVE_RUNNING' ? 'tag-purple' : 'tag-green'}`}>
                    {c.state === 'ACTIVE_RUNNING' ? 'RUNNING' : 'WARM IDLE'}
                  </span>
                </div>

                <div className="c-spec-lines">
                  <div className="c-spec-row">
                    <span>Function:</span>
                    <strong>{c.functionName}</strong>
                  </div>
                  <div className="c-spec-row">
                    <span>Version:</span>
                    <strong>{c.version}</strong>
                  </div>
                  <div className="c-spec-row">
                    <span>Memory:</span>
                    <strong>{c.memoryMb} MB</strong>
                  </div>
                  <div className="c-spec-row">
                    <span>IP Address:</span>
                    <strong className="font-mono">{c.ipAddress}</strong>
                  </div>
                  <div className="c-spec-row">
                    <span>Invocations:</span>
                    <strong>{c.invocationsServed}</strong>
                  </div>
                  <div className="c-spec-row">
                    <span>TTL Countdown:</span>
                    <strong className="font-mono" style={{ color: '#D97706' }}>
                      {c.state === 'WARM_IDLE' ? `${c.ttlRemainingSec}s` : 'Active'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVOCATIONS LOG */}
      {activeTab === 'logs' && (
        <div className="tab-body">
          <div className="log-filter-row">
            <button 
              className={`btn btn-sm ${logFilter === 'ALL' ? 'btn-yellow' : 'btn-white'}`}
              onClick={() => setLogFilter('ALL')}
            >
              All Logs ({logs.length})
            </button>
            <button 
              className={`btn btn-sm ${logFilter === 'COLD' ? 'btn-coral' : 'btn-white'}`}
              onClick={() => setLogFilter('COLD')}
            >
              Cold Starts Only
            </button>
            <button 
              className={`btn btn-sm ${logFilter === 'WARM' ? 'btn-mint' : 'btn-white'}`}
              onClick={() => setLogFilter('WARM')}
            >
              Warm Starts Only
            </button>
          </div>

          <div className="neo-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Request Correlation ID</th>
                  <th>Function</th>
                  <th>Classification</th>
                  <th>Strategy</th>
                  <th>Startup</th>
                  <th>Execution</th>
                  <th>Total Time</th>
                  <th>Container ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="font-mono" style={{ fontSize: '0.75rem' }}>
                      {log.requestId.substring(0, 16)}...
                    </td>
                    <td><strong>{log.functionName}</strong></td>
                    <td>
                      <span className={`neo-tag ${log.coldStart ? 'tag-coral' : 'tag-green'}`}>
                        {log.coldStart ? 'COLD' : 'WARM'}
                      </span>
                    </td>
                    <td>{log.strategy}</td>
                    <td className="font-mono">{log.startupMs} ms</td>
                    <td className="font-mono">{log.executionMs} ms</td>
                    <td className="font-mono font-bold">{log.durationMs} ms</td>
                    <td className="font-mono" style={{ fontSize: '0.75rem' }}>{log.containerId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SHARED CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="tab-body">
          <div className="grid-2">
            <div className="neo-card contract-box">
              <h4 className="contract-box-title">Contract 1: acquire / release (Scheduler &lt;-&gt; Pool)</h4>
              <p className="contract-box-desc">Two-method lifecycle interface behind all 4 pooling strategies.</p>
              <pre className="contract-code-block">
{`async def acquire(self, function_name: str, version: str = None) -> ContainerAcquisition:
    # Pops warm container from idle pool or calls Sandbox.create()
    ...

async def release(self, container_id: str, function_name: str, has_error: bool = False) -> None:
    # Returns to warm idle pool or destroys based on strategy
    ...`}
              </pre>
            </div>

            <div className="neo-card contract-box">
              <h4 className="contract-box-title">Contract 2: Sandbox Lifecycle (Pool &lt;-&gt; Sandbox)</h4>
              <p className="contract-box-desc">Strict Docker Engine isolation boundary.</p>
              <pre className="contract-code-block">
{`async def create(self, image_tag: str, memory_limit_mb: int = 128, cpu_quota: float = 0.5) -> str:
    ...

async def execute(self, container_id: str, input_data: dict, timeout_seconds: float = 5.0) -> ExecutionResult:
    ...

async def destroy(self, container_id: str) -> None:
    ...`}
              </pre>
            </div>

            <div className="neo-card contract-box">
              <h4 className="contract-box-title">Contract 4: HTTP Response Envelope</h4>
              <p className="contract-box-desc">Predictable response shape across all invocations.</p>
              <pre className="contract-code-block">
{`{
  "status": "SUCCESS",
  "result": { ... },
  "error": null,
  "duration_ms": 12.45,
  "cold_start": false
}`}
              </pre>
            </div>

            <div className="neo-card contract-box">
              <h4 className="contract-box-title">Contract 5: Zero-Hot-Path Metrics Telemetry</h4>
              <p className="contract-box-desc">Asynchronous event recording off the request path.</p>
              <pre className="contract-code-block">
{`class MetricRecord(BaseModel):
    request_id: UUID4
    function_id: str
    cold_start: bool
    strategy: StrategyEnum
    startup_ms: float
    execution_ms: float
    total_time_ms: float
    queue_wait_time_ms: float
    idle_memory_mb: float
    timestamp: datetime`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DeployModal 
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onDeploySuccess={handleDeploySuccess}
      />

      <InvokeModal 
        isOpen={isInvokeOpen}
        onClose={() => setIsInvokeOpen(false)}
        targetFunction={selectedFunctionForInvoke}
        activeStrategy={activeStrategy}
        onInvocationExecuted={handleInvocationExecuted}
      />

      <style>{`
        .dashboard-wrapper {
          padding: 3rem 1.5rem 5rem;
        }

        .dash-header-block {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .dash-badge-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .dash-main-title {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .dash-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .strat-switch-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: var(--border-thick);
          box-shadow: var(--shadow-sm);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
        }

        .strat-switch-label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 900;
        }

        .strat-native-select {
          border: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
        }

        .dash-tabs-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          border-bottom: var(--border-heavy);
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.65rem;
        }

        .dash-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.1rem;
          background: #FFFFFF;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 800;
          cursor: pointer;
          transition: all var(--transition-bounce);
          white-space: nowrap;
        }

        .dash-tab-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #000;
        }

        .dash-tab-btn.active {
          background: var(--neo-yellow);
          box-shadow: 4px 4px 0px #000;
          transform: translate(-1px, -1px);
        }

        .stat-metric-box {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .stat-card-title {
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .stat-card-number {
          font-family: var(--font-display);
          font-size: 2.35rem;
          font-weight: 900;
          margin: 0.35rem 0;
        }

        .stat-card-sub {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .panel-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .panel-headline {
          font-size: 1.15rem;
          font-weight: 900;
        }

        .telemetry-item-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .telemetry-line {
          display: flex;
          justify-content: space-between;
          background: var(--bg-page-alt);
          padding: 0.65rem 0.85rem;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-xs);
          font-size: 0.825rem;
        }

        .quick-functions-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .quick-fn-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-page-alt);
          padding: 0.75rem 0.85rem;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-xs);
        }

        .q-fn-title {
          font-size: 0.9rem;
          font-weight: 800;
        }

        .q-fn-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .functions-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .search-wrap {
          position: relative;
          width: 320px;
        }

        .s-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #000;
        }

        .search-input-field {
          padding-left: 2.5rem;
        }

        .fn-catalog-card {
          padding: 1.5rem;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
        }

        .fn-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .fn-badge-cluster {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.35rem;
        }

        .fn-card-name {
          font-size: 1.25rem;
          font-weight: 900;
        }

        .fn-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          background: var(--bg-page-alt);
          padding: 0.75rem;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-xs);
          margin-bottom: 1rem;
        }

        .fn-spec-col {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
        }

        .fn-code-box {
          background: #0F172A;
          padding: 0.75rem;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          max-height: 120px;
          overflow: hidden;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #38BDF8;
        }

        .fleet-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: #FFFFFF;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .fleet-stats-cluster {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .fleet-stat-col {
          display: flex;
          flex-direction: column;
        }

        .f-lbl {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .f-val {
          font-size: 1.25rem;
          font-weight: 900;
        }

        .fleet-btn-actions {
          display: flex;
          gap: 0.65rem;
        }

        .container-card {
          padding: 1.25rem;
          background: #FFFFFF;
        }

        .c-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }

        .c-title-cluster {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .c-id-name {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.95rem;
        }

        .c-spec-lines {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.8rem;
        }

        .c-spec-row {
          display: flex;
          justify-content: space-between;
        }

        .log-filter-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .neo-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .neo-table th {
          background: var(--bg-page-alt);
          padding: 0.85rem 1rem;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          border-bottom: var(--border-thick);
        }

        .neo-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #000;
          font-size: 0.85rem;
        }

        .neo-table tr:hover {
          background: #FFFDF0;
        }

        .contract-box {
          padding: 1.5rem;
          background: #FFFFFF;
          margin-bottom: 1.5rem;
        }

        .contract-box-title {
          font-size: 1.05rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .contract-box-desc {
          font-size: 0.825rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .contract-code-block {
          background: #0F172A;
          padding: 1rem;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #38BDF8;
          overflow-x: auto;
        }

        @media (max-width: 900px) {
          .fleet-stats-cluster {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
