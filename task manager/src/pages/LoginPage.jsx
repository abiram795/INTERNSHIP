import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckSquare,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail('alex.morgan@taskflow.io');
    setPassword('password123');
    setErrors({});
    addToast('Credentials pre-filled for quick access.', 'info');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    addToast(
      'Password recovery: For local workspaces, use standard password "password123" or register a new workspace profile.',
      'info',
      5000
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Please provide your workspace email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. user@domain.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate instant smooth auth transition
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);

      if (result.success) {
        addToast(`Welcome back, ${result.user.name}!`, 'success');
        onNavigate('dashboard');
      } else {
        setErrors({ general: result.error || 'Authentication failed. Please verify credentials.' });
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors">
      {/* Top bar with back to home & theme toggle */}
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
          {/* Left Hero Sidebar (2 cols) */}
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
                Accelerate team execution with zero latency.
              </h3>

              <div className="space-y-4 mt-8 text-xs text-indigo-100 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Real-time Kanban & List workflow</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Instant browser LocalStorage sync</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Interactive agenda calendar</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15 text-[11px] text-indigo-200">
              <span className="flex items-center gap-1 font-semibold text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Local Session Engine
              </span>
              <span>All changes persist seamlessly across browser reloads.</span>
            </div>
          </div>

          {/* Right Form Area (3 cols) */}
          <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your productivity dashboard.
              </p>
            </div>

            {/* Quick Fill Button */}
            <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Pre-configured Account
                </p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  alex.morgan@taskflow.io
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Fill</span>
              </button>
            </div>

            {/* General Error Banner */}
            {errors.general && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
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
                    placeholder="name@company.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.email
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.password
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Remember session on this device
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              Don't have a workspace account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

