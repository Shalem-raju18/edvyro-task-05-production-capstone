import React, { useState, useEffect } from 'react';
import { type Application } from '../types.ts';
import { 
  Search, 
  Send, 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  ExternalLink,
  RefreshCw,
  Inbox
} from 'lucide-react';

import { API_BASE_URL } from '../api.ts';

interface ApplicationTrackerProps {
  initialEmail?: string;
  onExploreRoles: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  initialEmail = '',
  onExploreRoles
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('edvyro_candidate_email');
    if (saved) {
      setEmail(saved);
      fetchApplications(saved);
    } else if (initialEmail) {
      setEmail(initialEmail);
      fetchApplications(initialEmail);
    }
  }, [initialEmail]);

  const fetchApplications = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setErrorMessage('Please enter your application email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/track?email=${encodeURIComponent(targetEmail.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to retrieve application status');
        setApplications([]);
      } else {
        setApplications(data.data || []);
        setSearched(true);
        localStorage.setItem('edvyro_candidate_email', targetEmail.trim().toLowerCase());
      }
    } catch (err) {
      setErrorMessage('Network error communicating with the API. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications(email);
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Accepted':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Offer Accepted / Approved',
          step: 4
        };
      case 'Interview':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Interview Phase',
          step: 3
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Under Review by Team',
          step: 2
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Not Selected',
          step: 0
        };
      case 'Submitted':
      default:
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Application Received',
          step: 1
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Candidate Application Tracker
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Check real-time application updates, recruiter reviews, and interview invitations stored securely in our SQLite database.
        </p>
      </div>

      {/* Email Search Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Registered Application Email Address
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="e.g. alex.chen@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Track</span>
            </button>
          </div>
          {errorMessage && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
            </p>
          )}
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Querying SQLite database for candidate records...</p>
        </div>
      ) : searched && applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Applications Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No submissions found under <strong className="text-slate-700">{email}</strong>. Please double-check your email or apply to active roles.
            </p>
          </div>
          <button
            onClick={onExploreRoles}
            className="py-2 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
          >
            Explore Open Roles
          </button>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Found <strong className="text-slate-800">{applications.length}</strong> application(s) for {email}
            </span>
            <button
              onClick={() => fetchApplications(email)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Status
            </button>
          </div>

          {applications.map((app) => {
            const statusInfo = getStatusBadge(app.status);

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>Ref #{app.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Submitted on {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {app.internship_title || `Internship #${app.internship_id}`}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.company || 'Host Organization'}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Applicant: {app.full_name}</span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${statusInfo.bg}`}
                    >
                      {app.status === 'Accepted' && <CheckCircle className="w-3.5 h-3.5" />}
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Visual Pipeline Progress */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Review Pipeline
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className={`p-2 rounded-lg border ${
                      statusInfo.step >= 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      1. Submitted
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      statusInfo.step >= 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      2. Under Review
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      statusInfo.step >= 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      3. Interview
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      statusInfo.step >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      4. Decision
                    </div>
                  </div>
                </div>

                {/* Resume Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>University: {app.college} (Class of {app.graduation_year})</span>
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>View Submitted Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
