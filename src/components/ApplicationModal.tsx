import React, { useState, useEffect } from 'react';
import { type Internship, type Application } from '../types.ts';
import { 
  X, 
  Send, 
  Loader2, 
  CheckCircle, 
  Building2, 
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Link as LinkIcon
} from 'lucide-react';

import { API_BASE_URL } from '../api.ts';

interface ApplicationModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (app: Application) => void;
  onTrackRedirect: (email: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  internship,
  isOpen,
  onClose,
  onSuccess,
  onTrackRedirect
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college: '',
    graduation_year: '2026',
    resume_url: '',
    cover_letter: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill email if stored previously
      const savedEmail = localStorage.getItem('edvyro_candidate_email');
      if (savedEmail && !formData.email) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
      }
      setErrors({});
      setServerErrors([]);
      setSubmittedApp(null);
    }
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !internship) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number (at least 7 digits)';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College or University name is required';
    }

    const gradYear = parseInt(formData.graduation_year, 10);
    const curYear = new Date().getFullYear();
    if (isNaN(gradYear) || gradYear < curYear - 4 || gradYear > curYear + 8) {
      newErrors.graduation_year = `Graduation year must be between ${curYear - 4} and ${curYear + 8}`;
    }

    if (!formData.resume_url.trim() || formData.resume_url.trim().length < 4) {
      newErrors.resume_url = 'Please provide a valid link to your Resume, LinkedIn, or Portfolio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors([]);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internship_id: internship.id,
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          college: formData.college.trim(),
          graduation_year: parseInt(formData.graduation_year, 10),
          resume_url: formData.resume_url.trim(),
          cover_letter: formData.cover_letter.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setServerErrors(data.details);
        } else {
          setServerErrors([data.error || 'Failed to submit application. Please check your inputs.']);
        }
        setIsSubmitting(false);
        return;
      }

      // Save email for quick lookup
      localStorage.setItem('edvyro_candidate_email', formData.email.trim().toLowerCase());
      setSubmittedApp(data.data);
      onSuccess(data.data);
    } catch (err: any) {
      setServerErrors(['Network error connecting to backend API. Please verify server connectivity.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 p-6 sm:p-8"
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

        {submittedApp ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your application for <strong className="text-slate-800">{internship.title}</strong> at {internship.company} has been securely stored in our SQLite database.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Application Reference ID:</span>
                <span className="font-mono font-bold text-indigo-700">#APP-{submittedApp.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Applicant Email:</span>
                <span className="font-medium text-slate-800">{submittedApp.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Initial Status:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {submittedApp.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  onClose();
                  onTrackRedirect(submittedApp.email);
                }}
                className="py-2.5 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Track Status in Candidate Portal
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div>
            <div className="mb-6">
              <div className="text-xs font-semibold text-indigo-600 mb-1">
                Application Form
              </div>
              <h2 id="app-modal-title" className="text-xl font-bold text-slate-900 tracking-tight">
                {internship.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{internship.company}</span>
                <span aria-hidden="true">·</span>
                <span>{internship.location}</span>
                <span aria-hidden="true">·</span>
                <span>{internship.stipend}</span>
              </div>
            </div>

            {/* Server-side Error Messages */}
            {serverErrors.length > 0 && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Submission Error:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
                    {serverErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      errors.full_name
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.full_name}</p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* College & Graduation Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / University <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stanford University"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        errors.college
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {errors.college && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.college}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grad Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resume / Portfolio Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume / Portfolio URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or https://github.com/..."
                    value={formData.resume_url}
                    onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      errors.resume_url
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                    }`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Provide a shareable public link to your PDF resume, GitHub, or portfolio website.
                </p>
                {errors.resume_url && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.resume_url}</p>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Statement of Interest / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the hiring team why you are excited about this opportunity..."
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
