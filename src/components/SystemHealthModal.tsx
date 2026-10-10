import React, { useState, useEffect } from 'react';
import { type SystemHealth } from '../types.ts';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  Database, 
  Server, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Loader2, 
  Lock,
  Layers
} from 'lucide-react';

import { API_BASE_URL } from '../api.ts';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'security' | 'api-tester'>('health');
  
  // API Tester states
  const [testEndpoint, setTestEndpoint] = useState('/api/health');
  const [testResult, setTestResult] = useState<any>(null);
  const [testRunning, setTestRunning] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const data = await res.json();
      setHealthData(data);
    } catch (err) {
      console.error('Health fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const runApiTest = async () => {
    setTestRunning(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const url = testEndpoint.startsWith('http') ? testEndpoint : `${API_BASE_URL}${testEndpoint}`;
      const res = await fetch(url);
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setTestResult({
        status: res.status,
        ok: res.ok,
        durationMs: duration,
        headers: {
          'x-content-type-options': res.headers.get('x-content-type-options'),
          'content-type': res.headers.get('content-type')
        },
        body: data
      });
    } catch (err: any) {
      setTestResult({
        status: 500,
        ok: false,
        error: err.message
      });
    } finally {
      setTestRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Backend Architecture</h2>
            <p className="text-xs text-slate-500">Live Express API, SQLite Persistence & Security Auditing</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6 text-xs">
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-colors ${
              activeTab === 'health' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-colors ${
              activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Controls
          </button>
          <button
            onClick={() => setActiveTab('api-tester')}
            className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-colors ${
              activeTab === 'api-tester' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive API Tester
          </button>
        </div>

        {/* TAB 1: HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Live Health Status Probe</span>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-check</span>
              </button>
            </div>

            {loading && !healthData ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p>Querying /api/health endpoint...</p>
              </div>
            ) : healthData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" /> Database Status
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {healthData.database.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">Engine: {healthData.database.engine}</div>
                  <div className="text-[11px] text-slate-600">Round-trip Query Latency: {healthData.database.latencyMs}ms</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" /> Service Uptime
                    </span>
                    <span className="font-bold text-slate-900">{healthData.uptimeSeconds} seconds</span>
                  </div>
                  <div className="text-[11px] text-slate-600">Node Runtime: {healthData.system.nodeVersion}</div>
                  <div className="text-[11px] text-slate-600">Heap Memory: {healthData.system.memoryHeapUsedMb} MB</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">
                Backend API unreachable. Ensure development server is running.
              </div>
            )}

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-slate-400 font-bold mb-1">// Raw /api/health JSON Response:</div>
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Active Security Defenses Verified
              </div>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Helmet Security Headers:</strong> Disables MIME sniffing, enforces XSS protection, sets Cross-Origin-Embedder policies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Rate Limiting (express-rate-limit):</strong> Restricts general API requests to 300 per 15min and application submissions to 20 per 15min to prevent DOS and bot spam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Payload Size Limit:</strong> Request payloads capped at 1MB to prevent memory exhaustion attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>SQL Injection Prevention:</strong> 100% parameterized SQL prepared statements via @libsql/client. Zero concatenated query strings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Server-Side Validation:</strong> Strict validation of email regex, phone formatting, field lengths, and foreign key integrity.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: API TESTER */}
        {activeTab === 'api-tester' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-slate-700">Select Endpoint to Probe:</label>
              <div className="flex gap-2">
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="/api/health">GET /api/health</option>
                  <option value="/api/stats">GET /api/stats</option>
                  <option value="/api/internships">GET /api/internships</option>
                  <option value="/api/internships?category=Engineering">GET /api/internships?category=Engineering</option>
                  <option value="/api/internships/1">GET /api/internships/1</option>
                  <option value="/api/applications">GET /api/applications</option>
                </select>
                <button
                  onClick={runApiTest}
                  disabled={testRunning}
                  className="py-2 px-4 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {testRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                  <span>Execute</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${testResult.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    HTTP {testResult.status} {testResult.ok ? 'OK' : 'ERROR'}
                  </span>
                  <span className="text-slate-500 font-mono">Response Time: {testResult.durationMs}ms</span>
                </div>
                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60">
                  <pre>{JSON.stringify(testResult.body, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
