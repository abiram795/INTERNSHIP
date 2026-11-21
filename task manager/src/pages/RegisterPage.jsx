import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckSquare,
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Product Lead');
  const [workspace, setWorkspace] = useState('Acme SaaS Ventures');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Work email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service to proceed.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = register({
        name,
        email,
        role,
        workspace,
        password,
      });
      setIsLoading(false);

      if (result.success) {
        addToast(`Workspace account created! Welcome, ${result.user.name}.`, 'success');
        onNavigate('dashboard');
      } else {
        setErrors({ general: result.error || 'Registration failed.' });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors">
      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 my-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
          {/* Left Info Panel (2 cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white flex flex-col justify-between hidden md:flex">
            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <CheckSquare className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-lg font-extrabold tracking-tight">
                  TaskFlow Pro
                </span>
              </div>

              <h3 className="text-xl font-extrabold leading-snug">
                Start managing high-impact initiatives in minutes.
              </h3>

              <div className="space-y-4 mt-8 text-xs text-indigo-100 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Unlimited tasks, subtasks & tags</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Interactive Kanban & calendar views</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Deterministic JSON workspace backups</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Zero setup: runs entirely on frontend</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15 text-[11px] text-indigo-200">
              <span className="flex items-center gap-1 font-semibold text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                No Backend Dependencies
              </span>
              <span>All user data and deliverables persist locally in your browser.</span>
            </div>
          </div>

          {/* Right Form Area (3 cols) */}
          <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your workspace account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set up your team workspace profile with zero server latency.
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. Jordan Miller"
                    className={`w-full pl-10 pr-3.5 py-2 text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.name
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="jordan@company.com"
                    className={`w-full pl-10 pr-3.5 py-2 text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.email
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Row: Role & Workspace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Designation / Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Lead Designer"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Workspace Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={workspace}
                      onChange={(e) => setWorkspace(e.target.value)}
                      placeholder="e.g. Acme Studio"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-3.5 py-2 text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        errors.password
                          ? 'border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((prev) => ({ ...prev, confirmPassword: null }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-3.5 py-2 text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        errors.confirmPassword
                          ? 'border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    I agree to the Workspace Terms of Service & Privacy Policy.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Workspace...' : 'Register Workspace Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

