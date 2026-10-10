import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Send, 
  ShieldCheck, 
  Menu, 
  X, 
  Activity,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'browse' | 'track' | 'recruiter' | 'health';
  setActiveTab: (tab: 'browse' | 'track' | 'recruiter' | 'health') => void;
  serverOnline: boolean;
  totalRoles: number;
  openHealthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverOnline,
  totalRoles,
  openHealthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'browse' | 'track' | 'recruiter' | 'health') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('browse')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">EdVyro</span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Capstone
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Internship Career Portal</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => handleNavClick('browse')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'browse'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Browse Internships</span>
              {totalRoles > 0 && (
                <span className="ml-1 text-xs font-semibold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  {totalRoles}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'track'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Send className="w-4 h-4 text-slate-500" />
              <span>Track Application</span>
            </button>

            <button
              onClick={() => handleNavClick('recruiter')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'recruiter'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Employer Hub</span>
            </button>
          </nav>

          {/* Right Action / System Status */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openHealthModal}
              title="View REST API & SQLite System Diagnostics"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                {serverOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className="text-slate-700">
                {serverOnline ? 'Backend Online · SQLite' : 'Offline'}
              </span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openHealthModal}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              title="Health Diagnostics"
            >
              <Activity className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1">
          <button
            onClick={() => handleNavClick('browse')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
              activeTab === 'browse' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Browse Internships
            </span>
            <span className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {totalRoles}
            </span>
          </button>

          <button
            onClick={() => handleNavClick('track')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              activeTab === 'track' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Send className="w-4 h-4" /> Track My Applications
          </button>

          <button
            onClick={() => handleNavClick('recruiter')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              activeTab === 'recruiter' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" /> Employer & Recruiter Hub
          </button>

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openHealthModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Architecture & Health
              </span>
              <span className="text-emerald-700 font-semibold">Active</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
