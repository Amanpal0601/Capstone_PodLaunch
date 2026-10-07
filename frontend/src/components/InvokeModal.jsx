import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Box
} from 'lucide-react';
import { STRATEGIES_INFO } from '../data/initialData';

export default function InvokeModal({ 
  isOpen, 
  onClose, 
  targetFunction, 
  activeStrategy, 
  onInvocationExecuted 
}) {
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify({ data: "Testing PodLaunch invocation payload", count: 5 }, null, 2)
  );
  const [invoking, setInvoking] = useState(false);
  const [responseEnvelope, setResponseEnvelope] = useState(null);
  const [parseError, setParseError] = useState('');

  if (!isOpen || !targetFunction) return null;

  const strategyConfig = STRATEGIES_INFO[activeStrategy] || STRATEGIES_INFO.predictive;

  const handleInvoke = () => {
    setParseError('');
    let parsedInput = {};
    try {
      parsedInput = JSON.parse(payloadJson);
    } catch (e) {
      setParseError('Invalid JSON format. Please check syntax.');
      return;
    }

    setInvoking(true);
    setResponseEnvelope(null);

    const isCold = activeStrategy === 'naive' 
      ? true 
      : activeStrategy === 'keep_alive'
      ? Math.random() < 0.42
      : activeStrategy === 'fixed_pre_warm'
      ? Math.random() < 0.18
      : Math.random() < 0.05;

    const startupMs = isCold ? (280 + Math.random() * 220) : 0.0;
    const execMs = Math.round((12 + Math.random() * 20) * 10) / 10;
    const queueWaitMs = Math.round((0.5 + Math.random() * 1.5) * 10) / 10;
    const totalDurationMs = Math.round((startupMs + execMs + queueWaitMs) * 10) / 10;

    const correlationId = 'req-' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const containerId = isCold ? `c-cold-${Date.now().toString().slice(-4)}` : `c-warm-00${Math.floor(Math.random()*5)+1}`;

    setTimeout(() => {
      setInvoking(false);

      const envelope = {
        status: "SUCCESS",
        result: {
          message: "Function processed payload successfully inside Docker container sandbox",
          input_echo: parsedInput,
          function: targetFunction.name,
          version: targetFunction.version,
          processed_at: new Date().toISOString()
        },
        duration_ms: totalDurationMs,
        cold_start: isCold,
        meta: {
          request_id: correlationId,
          container_id: containerId,
          strategy: strategyConfig.name,
          startup_ms: Math.round(startupMs * 10) / 10,
          execution_ms: execMs,
          queue_wait_ms: queueWaitMs,
          error_type: "NONE"
        }
      };

      setResponseEnvelope(envelope);

      if (onInvocationExecuted) {
        onInvocationExecuted({
          requestId: correlationId,
          functionName: targetFunction.name,
          version: targetFunction.version,
          strategy: activeStrategy.toUpperCase(),
          coldStart: isCold,
          durationMs: totalDurationMs,
          startupMs: Math.round(startupMs * 10) / 10,
          executionMs: execMs,
          queueWaitMs: queueWaitMs,
          status: "SUCCESS",
          errorType: "NONE",
          containerId: containerId,
          timestamp: "Just now"
        });
      }
    }, isCold ? 400 : 150);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invoke-card neo-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="invoke-header">
          <div className="invoke-title-wrap">
            <div className="invoke-icon-box">
              <Zap size={20} strokeWidth={2.5} color="#000" />
            </div>
            <div>
              <div className="invoke-tags-row">
                <span className="neo-tag tag-yellow">{targetFunction.runtime}</span>
                <span className="neo-tag tag-purple">{targetFunction.version}</span>
                <span className={`neo-tag ${strategyConfig.badgeColor}`}>
                  {strategyConfig.name.split(' ')[0]}
                </span>
              </div>
              <h2 className="invoke-endpoint-title">POST /invoke/{targetFunction.name}</h2>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* JSON Payload Input */}
        <div className="form-group">
          <label className="form-label">JSON Request Body</label>
          <textarea 
            className="form-textarea payload-box"
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            rows={5}
            spellCheck="false"
          />
        </div>

        {parseError && (
          <div className="auth-error-banner">
            <AlertTriangle size={15} />
            <span>{parseError}</span>
          </div>
        )}

        <div className="invoke-action-row">
          <button 
            type="button"
            className="btn btn-yellow btn-lg"
            onClick={handleInvoke}
            disabled={invoking}
          >
            {invoking ? (
              <span>Executing in Container Sandbox...</span>
            ) : (
              <>
                <Play size={17} strokeWidth={2.5} />
                <span>Execute Function</span>
              </>
            )}
          </button>
        </div>

        {/* Result Envelope */}
        {responseEnvelope && (
          <div className="result-envelope-card neo-card">
            <div className="envelope-top-bar">
              <div className="envelope-status">
                <CheckCircle2 size={16} strokeWidth={2.5} color="#16A34A" />
                <strong>200 OK — Response Envelope</strong>
              </div>
              <div className="envelope-badges">
                <span className={`neo-tag ${responseEnvelope.cold_start ? 'tag-coral' : 'tag-green'}`}>
                  {responseEnvelope.cold_start ? 'COLD START' : 'WARM START (Single-Digit)'}
                </span>
                <span className="neo-tag tag-yellow">
                  {responseEnvelope.duration_ms} ms Total
                </span>
              </div>
            </div>

            {/* Timings */}
            <div className="timings-boxes-grid">
              <div className="t-box" style={{ background: 'var(--neo-yellow)' }}>
                <span className="t-lbl">Startup/Prep</span>
                <span className="t-val">{responseEnvelope.meta.startup_ms} ms</span>
              </div>
              <div className="t-box" style={{ background: 'var(--neo-mint)' }}>
                <span className="t-lbl">Execution</span>
                <span className="t-val">{responseEnvelope.meta.execution_ms} ms</span>
              </div>
              <div className="t-box" style={{ background: 'var(--neo-purple)' }}>
                <span className="t-lbl">Queue Wait</span>
                <span className="t-val">{responseEnvelope.meta.queue_wait_ms} ms</span>
              </div>
              <div className="t-box" style={{ background: '#FFFFFF' }}>
                <span className="t-lbl">Container ID</span>
                <span className="t-val" style={{ fontSize: '0.75rem' }}>{responseEnvelope.meta.container_id}</span>
              </div>
            </div>

            {/* JSON Output */}
            <div className="json-box">
              <pre>
                <code>{JSON.stringify(responseEnvelope, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .invoke-card {
          width: 100%;
          max-width: 740px;
          padding: 2rem;
          background: #FFFFFF;
          border: var(--border-heavy);
          box-shadow: var(--shadow-xl);
        }

        .invoke-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: var(--border-thick);
        }

        .invoke-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .invoke-icon-box {
          width: 40px;
          height: 40px;
          background: var(--neo-yellow);
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.2rem;
        }

        .invoke-tags-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.35rem;
        }

        .invoke-endpoint-title {
          font-family: var(--font-mono);
          font-size: 1.15rem;
          font-weight: 800;
          color: #000000;
        }

        .payload-box {
          background: #0F172A;
          color: #38BDF8;
        }

        .invoke-action-row {
          display: flex;
          justify-content: flex-end;
          margin: 1.25rem 0;
        }

        .result-envelope-card {
          padding: 1.25rem;
          background: #FFFFFF;
        }

        .envelope-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
          padding-bottom: 0.65rem;
          border-bottom: var(--border-thick);
        }

        .envelope-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.9rem;
        }

        .envelope-badges {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .timings-boxes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .t-box {
          padding: 0.65rem;
          border: var(--border-thick);
          box-shadow: 2px 2px 0px #000;
          border-radius: var(--radius-xs);
          display: flex;
          flex-direction: column;
        }

        .t-lbl {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .t-val {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 900;
          margin-top: 0.15rem;
        }

        .json-box {
          background: #0F172A;
          padding: 0.85rem;
          border: var(--border-thick);
          border-radius: var(--radius-xs);
          max-height: 200px;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #38BDF8;
        }
      `}</style>
    </div>
  );
}
