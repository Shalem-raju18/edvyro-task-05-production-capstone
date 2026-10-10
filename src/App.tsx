import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { InternshipCard } from './components/InternshipCard.tsx';
import { InternshipDetailModal } from './components/InternshipDetailModal.tsx';
import { ApplicationModal } from './components/ApplicationModal.tsx';
import { ApplicationTracker } from './components/ApplicationTracker.tsx';
import { RecruiterHub } from './components/RecruiterHub.tsx';
import { SystemHealthModal } from './components/SystemHealthModal.tsx';
import { type Internship, type PlatformStats } from './types.ts';
import { 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  Building2, 
  CheckCircle, 
  RotateCcw, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Code
} from 'lucide-react';

import { API_BASE_URL } from './api.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'track' | 'recruiter' | 'health'>('browse');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');

  // Modals & Tracking
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [applyingInternship, setApplyingInternship] = useState<Internship | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [trackedEmail, setTrackedEmail] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" or "Ctrl+K" focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Internships
  const fetchInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedWorkType !== 'all') params.append('work_type', selectedWorkType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const url = `${API_BASE_URL}/api/internships${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = await res.json();
      setInternships(data.data || []);
      setServerOnline(true);
    } catch (err: any) {
      console.error('Error fetching internships:', err);
      setError('Could not connect to the Express REST API. Please verify that the backend server is running on port 3000.');
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchStats();
  }, [selectedCategory, selectedWorkType, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedWorkType('all');
    setSelectedStatus('Active');
  };

  const categories = [
    'all',
    'Engineering',
    'Data & AI',
    'Design',
    'Product',
    'Cloud & DevOps',
    'Cybersecurity'
  ];

  const workTypes = ['all', 'Remote', 'Hybrid', 'On-site'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverOnline={serverOnline}
        totalRoles={internships.length}
        openHealthModal={() => setIsHealthModalOpen(true)}
      />

      {/* Backend Offline Helpful Notice */}
      {!serverOnline && (
        <aside aria-label="Backend status notification" className="bg-amber-500/10 border-b border-amber-300 px-4 py-3 text-xs text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Backend REST API unavailable:</strong> The application could not reach <code>{API_BASE_URL || window.location.origin}/api/health</code>. Ensure the server process is listening on port 3000.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  fetchInternships();
                  fetchStats();
                }}
                className="px-2.5 py-1 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition-colors"
              >
                Retry Connection
              </button>
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="px-2.5 py-1 bg-white text-slate-800 border border-slate-300 font-semibold rounded hover:bg-slate-50 transition-colors"
              >
                Inspect Health
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'browse' && (
          <div>
            {/* Hero / Header Section */}
            <section className="bg-white border-b border-slate-200/80 pt-10 pb-8 sm:pt-14 sm:pb-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  {/* Subtle Kicker */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
                    <span>Task 05 Production Capstone</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 font-normal">Express REST API + SQLite Persistence</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Find and Apply for High-Impact Internship Opportunities
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Explore curated tech, engineering, product, and design internships. Submit verified applications with instant SQLite persistence and track your review lifecycle.
                  </p>
                </div>

                {/* Platform Metric Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Active Openings</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {stats ? stats.activeInternships : internships.length || '6'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applications Logged</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {stats ? stats.totalApplications : '12+'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Partner Companies</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {stats ? stats.totalInternships : '8'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Security Headers</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Helmet & CORS</span>
                    </div>
                  </div>
                </div>

                {/* Search & Filters Controls */}
                <div className="mt-8 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search roles by title, company, skills (e.g. React, Python, Cloud)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-20 py-2.5 text-sm bg-white border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors"
                    />
                    <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <span>Press</span>
                      <kbd className="font-mono font-semibold">/</kbd>
                    </div>
                  </div>

                  {/* Filter Row: Categories + Work Types */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Category Filters">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                            selectedCategory === cat
                              ? 'bg-slate-900 text-white font-semibold'
                              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {cat === 'all' ? 'All Domains' : cat}
                        </button>
                      ))}
                    </div>

                    {/* Work Type Segmented Control */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0">
                      {workTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedWorkType(type)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedWorkType === type
                              ? 'bg-white text-slate-900 font-semibold shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {type === 'all' ? 'Any Type' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Internships Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {/* Results Status Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900 font-bold">{internships.length}</strong> available position(s)
                  {selectedCategory !== 'all' && (
                    <span> in <strong className="text-slate-700">{selectedCategory}</strong></span>
                  )}
                  {searchQuery && (
                    <span> matching "<strong className="text-slate-700">{searchQuery}</strong>"</span>
                  )}
                </div>

                {(searchQuery || selectedCategory !== 'all' || selectedWorkType !== 'all') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              {/* Loading State Skeletons */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-12 bg-slate-100 rounded w-full"></div>
                      <div className="h-8 bg-slate-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                /* Error State */
                <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 max-w-lg mx-auto space-y-3">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">API Connection Error</h3>
                  <p className="text-xs text-slate-600">{error}</p>
                  <button
                    onClick={fetchInternships}
                    className="py-2 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : internships.length === 0 ? (
                /* Empty State */
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No matching internships found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      We couldn't find any opportunities matching your active criteria. Try broadening your keywords or removing filters.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="py-2 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Internships Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      onSelect={(item) => setSelectedInternship(item)}
                      onApply={(item) => setApplyingInternship(item)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 2: Track Applications */}
        {activeTab === 'track' && (
          <ApplicationTracker
            initialEmail={trackedEmail}
            onExploreRoles={() => setActiveTab('browse')}
          />
        )}

        {/* Tab 3: Employer & Recruiter Hub */}
        {activeTab === 'recruiter' && (
          <RecruiterHub
            onRoleCreated={() => {
              fetchInternships();
              fetchStats();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">EdVyro Internship Portal</span>
              <span aria-hidden="true">·</span>
              <span>Task 05 Capstone</span>
            </div>
            <p className="mt-1 text-slate-400 text-[11px]">
              Production full-stack architecture powered by Node.js, Express, LibSQL SQLite, and React.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="hover:text-indigo-600 flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnostics & REST Health</span>
            </button>
            <span aria-hidden="true" className="text-slate-200">|</span>
            <button
              onClick={() => setActiveTab('recruiter')}
              className="hover:text-indigo-600"
            >
              Recruiter Admin
            </button>
            <span aria-hidden="true" className="text-slate-200">|</span>
            <button
              onClick={() => setActiveTab('track')}
              className="hover:text-indigo-600"
            >
              Candidate Tracker
            </button>
          </div>
        </div>
      </footer>

      {/* Internship Detail Modal */}
      <InternshipDetailModal
        internship={selectedInternship}
        onClose={() => setSelectedInternship(null)}
        onApply={(item) => setApplyingInternship(item)}
      />

      {/* Application Submission Modal */}
      <ApplicationModal
        internship={applyingInternship}
        isOpen={Boolean(applyingInternship)}
        onClose={() => setApplyingInternship(null)}
        onSuccess={(_app) => {
          fetchStats();
        }}
        onTrackRedirect={(email) => {
          setTrackedEmail(email);
          setActiveTab('track');
        }}
      />

      {/* System Health Diagnostic Modal */}
      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
    </div>
  );
}
