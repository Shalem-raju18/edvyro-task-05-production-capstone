import React, { useState, useEffect } from 'react';
import { type Internship, type Application } from '../types.ts';
import { 
  PlusCircle, 
  Layers, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  Trash2, 
  Building2,
  Send,
  RefreshCw
} from 'lucide-react';

import { API_BASE_URL } from '../api.ts';

interface RecruiterHubProps {
  onRoleCreated: () => void;
}

export const RecruiterHub: React.FC<RecruiterHubProps> = ({ onRoleCreated }) => {
  const [subTab, setSubTab] = useState<'applications' | 'post-role' | 'roles'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [roles, setRoles] = useState<Internship[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Internship Form state
  const [newRole, setNewRole] = useState({
    title: '',
    company: '',
    location: '',
    work_type: 'Hybrid',
    category: 'Engineering',
    stipend: '$40/hr',
    duration: '12 Weeks',
    description: '',
    requirements: 'Pursuing degree in Computer Science or related field\nExperience with modern web technologies\nStrong problem-solving mindset',
    skills: 'TypeScript, React, Node.js, SQL',
    deadline: '2026-12-15'
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postErrors, setPostErrors] = useState<string[]>([]);

  // Fetch applications
  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch roles
  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/internships?status=all`);
      const data = await res.json();
      if (res.ok) {
        setRoles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadApplications();
    loadRoles();
  }, []);

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => (a.id === appId ? { ...a, status: newStatus as any } : a))
        );
        setActionMessage({ text: `Application #${appId} status updated to "${newStatus}"`, type: 'success' });
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage({ text: data.error || 'Failed to update status', type: 'error' });
      }
    } catch (err) {
      setActionMessage({ text: 'Error connecting to database', type: 'error' });
    }
  };

  const handlePostRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    setPostErrors([]);
    try {
      const reqList = newRole.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);
      const skillsList = newRole.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE_URL}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRole,
          requirements: reqList,
          skills: skillsList
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPostErrors(data.details || [data.error || 'Failed to create internship']);
      } else {
        setActionMessage({ text: 'New internship role published to SQLite database!', type: 'success' });
        setTimeout(() => setActionMessage(null), 4000);
        onRoleCreated();
        loadRoles();
        setSubTab('roles');
        // Reset form
        setNewRole({
          title: '',
          company: '',
          location: '',
          work_type: 'Hybrid',
          category: 'Engineering',
          stipend: '$40/hr',
          duration: '12 Weeks',
          description: '',
          requirements: '',
          skills: '',
          deadline: '2026-12-15'
        });
      }
    } catch (err) {
      setPostErrors(['Network error connecting to API']);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete internship #${id}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/internships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoles(prev => prev.filter(r => r.id !== id));
        onRoleCreated();
        setActionMessage({ text: `Internship #${id} removed successfully`, type: 'success' });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      setActionMessage({ text: 'Failed to delete role', type: 'error' });
    }
  };

  const handleToggleRoleStatus = async (role: Internship) => {
    const nextStatus = role.status === 'Active' ? 'Closed' : 'Active';
    try {
      const res = await fetch(`${API_BASE_URL}/api/internships/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setRoles(prev => prev.map(r => (r.id === role.id ? { ...r, status: nextStatus } : r)));
        onRoleCreated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employer & Recruiter Hub</h1>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
              Admin CRUD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage live postings, review candidates, and record hiring pipeline status in real time.
          </p>
        </div>

        {/* Sub Navigation Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSubTab('applications')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              subTab === 'applications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review Candidates ({applications.length})
          </button>
          <button
            onClick={() => setSubTab('roles')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              subTab === 'roles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manage Roles ({roles.length})
          </button>
          <button
            onClick={() => setSubTab('post-role')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              subTab === 'post-role'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Post New Role</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* SUBTAB 1: REVIEW CANDIDATE APPLICATIONS */}
      {subTab === 'applications' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submitted Candidate Pipeline
            </span>
            <button
              onClick={loadApplications}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loadingApps ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              <p className="text-xs">Loading candidate applications from SQLite...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">No applications received yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Role & Company</th>
                      <th className="py-3 px-4">Education</th>
                      <th className="py-3 px-4">Portfolio Link</th>
                      <th className="py-3 px-4">Pipeline Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{app.full_name}</div>
                          <div className="text-[11px] text-slate-500">{app.email}</div>
                          <div className="text-[11px] text-slate-400">{app.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold text-slate-800">{app.internship_title || `#${app.internship_id}`}</div>
                          <div className="text-[11px] text-slate-500">{app.company}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{app.college}</div>
                          <div className="text-[11px] text-slate-400">Class of {app.graduation_year}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            <span>Resume</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs font-semibold rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Interview">Interview</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[11px] text-slate-400">
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: MANAGE POSTED ROLES */}
      {subTab === 'roles' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Internship Listings in Database
            </span>
            <button
              onClick={loadRoles}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Roles
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Title & Company</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Stipend</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.title}</div>
                        <div className="text-[11px] text-slate-500">{r.company} · {r.location}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.category}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.work_type}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">{r.stipend}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleRoleStatus(r)}
                          className={`text-xs px-2 py-0.5 rounded font-medium border ${
                            r.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {r.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRole(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: POST NEW ROLE */}
      {subTab === 'post-role' && (
        <div className="mt-6 max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Publish New Internship Position</h2>
          <p className="text-xs text-slate-500 mb-6">
            Creates an internship entry in the SQLite database with full validation and immediate persistence.
          </p>

          {postErrors.length > 0 && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <span className="font-semibold block">Validation Failed:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
                {postErrors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handlePostRole} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend API Engineer Intern"
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Labs"
                  value={newRole.company}
                  onChange={(e) => setNewRole({ ...newRole, company: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco / Remote"
                  value={newRole.location}
                  onChange={(e) => setNewRole({ ...newRole, location: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={newRole.category}
                  onChange={(e) => setNewRole({ ...newRole, category: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Data & AI">Data & AI</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Type *</label>
                <select
                  value={newRole.work_type}
                  onChange={(e) => setNewRole({ ...newRole, work_type: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stipend *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. $45/hr"
                  value={newRole.stipend}
                  onChange={(e) => setNewRole({ ...newRole, stipend: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 Weeks"
                  value={newRole.duration}
                  onChange={(e) => setNewRole({ ...newRole, duration: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={newRole.deadline}
                  onChange={(e) => setNewRole({ ...newRole, deadline: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Detailed summary of the role, team, and day-to-day impact..."
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Candidate Requirements (One per line)
              </label>
              <textarea
                rows={3}
                placeholder="One bullet per line..."
                value={newRole.requirements}
                onChange={(e) => setNewRole({ ...newRole, requirements: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Node.js, Express, SQLite, React, Docker"
                value={newRole.skills}
                onChange={(e) => setNewRole({ ...newRole, skills: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPosting}
                className="py-2.5 px-5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60"
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Publish Internship to Database</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
