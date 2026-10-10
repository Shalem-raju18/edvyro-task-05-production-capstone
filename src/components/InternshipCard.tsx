import React from 'react';
import { type Internship } from '../types.ts';
import { Building2, Calendar, MapPin, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onSelect: (internship: Internship) => void;
  onApply: (internship: Internship) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onSelect,
  onApply
}) => {
  const isClosed = internship.status === 'Closed';

  return (
    <article className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between focus-within:ring-2 focus-within:ring-indigo-600/30">
      <div>
        {/* Kicker: Category and Work Type as quiet unboxed text */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          <span className="text-indigo-600 font-semibold">{internship.category}</span>
          <span aria-hidden="true">·</span>
          <span>{internship.work_type}</span>
          {isClosed && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600 font-medium">Position Filled</span>
            </>
          )}
        </div>

        {/* Primary Role Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          <button
            onClick={() => onSelect(internship)}
            className="text-left focus:outline-none focus-visible:underline"
          >
            {internship.title}
          </button>
        </h3>

        {/* Company & Location Metadata with typographic separators */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-sm text-slate-600 mt-1.5 mb-3.5">
          <span className="font-medium text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {internship.company}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <MapPin className="w-3 h-3 text-slate-400" />
            {internship.location}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {internship.description}
        </p>

        {/* Skills: Clean unboxed text list separated by bullets */}
        <div className="mb-5 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Required Competencies
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700">
            {internship.skills.slice(0, 4).map((skill, index) => (
              <React.Fragment key={skill}>
                <span className="font-medium text-slate-700">{skill}</span>
                {index < Math.min(internship.skills.length, 4) - 1 && (
                  <span aria-hidden="true" className="text-slate-300">·</span>
                )}
              </React.Fragment>
            ))}
            {internship.skills.length > 4 && (
              <span className="text-slate-400 text-[11px]">+{internship.skills.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
        {/* Stipend and Duration */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1 text-slate-900 font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{internship.stipend}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{internship.duration}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(internship)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Overview
          </button>
          <button
            onClick={() => onApply(internship)}
            disabled={isClosed}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              isClosed
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <span>{isClosed ? 'Closed' : 'Apply Now'}</span>
            {!isClosed && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
};
