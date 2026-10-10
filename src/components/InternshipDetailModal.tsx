import React, { useEffect } from 'react';
import { type Internship } from '../types.ts';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

interface InternshipDetailModalProps {
  internship: Internship | null;
  onClose: () => void;
  onApply: (internship: Internship) => void;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  onClose,
  onApply,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!internship) return null;

  const isClosed = internship.status === 'Closed';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-internship-title"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/80 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Kicker */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="text-indigo-600 font-semibold">{internship.category}</span>
          <span aria-hidden="true">·</span>
          <span>{internship.work_type}</span>
          <span aria-hidden="true">·</span>
          <span>Role ID #{internship.id}</span>
        </div>

        {/* Role Title */}
        <h2 id="modal-internship-title" className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {internship.title}
        </h2>

        {/* Company & Location */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-sm text-slate-600 mb-6">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            {internship.company}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {internship.location}
          </span>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
              Compensation
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              {internship.stipend}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
              Program Length
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {internship.duration}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
              Deadline
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {internship.deadline}
            </div>
          </div>
        </div>

        {/* Role Overview */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
            Role Overview
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {internship.description}
          </p>
        </div>

        {/* Requirements Checklist */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            Qualifications & Requirements
          </h3>
          <ul className="space-y-2.5">
            {internship.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skills Required */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
            Core Competencies
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-700">
            {internship.skills.map((skill, index) => (
              <React.Fragment key={skill}>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                  {skill}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onApply(internship);
            }}
            disabled={isClosed}
            className={`py-2.5 px-5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              isClosed
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            <span>{isClosed ? 'Role Closed' : 'Apply for this Role'}</span>
            {!isClosed && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
