import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckSquare,
  ArrowRight,
  Sparkles,
  Shield,
  Calendar,
  BarChart3,
  CheckCircle2,
  Sun,
  Moon,
  Star,
  LayoutGrid
} from 'lucide-react';

export const LandingPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Product at ScaleWave',
      quote:
        'TaskFlow Pro completely replaced our bloated legacy project tools. Our sprint velocity surged by 28% in the first quarter alone.',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Staff Systems Architect at Synthetix',
      quote:
        'The offline-first architecture and instant local state updates make this tool feel lightning fast. There is literally zero latency.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Design at Horizon Labs',
      quote:
        'The attention to typography, spacing, and micro-interactions makes organizing tasks enjoyable rather than a chore.',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever free',
      desc: 'Ideal for independent operators and freelancers seeking organized workflows.',
      features: [
        'Up to 100 active deliverables',
        'Interactive Kanban & List views',
        'Deliverable checklists & subtasks',
        'Offline browser storage engine',
        'Standard theme styling',
      ],
      popular: false,
      cta: 'Start Free',
      ctaAction: () => onNavigate(isAuthenticated ? 'dashboard' : 'register'),
    },
    {
      name: 'Professional',
      price: '$19',
      period: 'per member / month',
      desc: 'High-velocity sprint management for growing product & engineering teams.',
      features: [
        'Unlimited tasks & categories',
        'Interactive monthly agenda calendar',
        'Velocity analytics & priority metrics',
        'Custom JSON workspace backup & import',
        'Real-time deadline notifications',
        'Priority email assistance',
      ],
      popular: true,
      cta: 'Launch Workspace',
      ctaAction: () => onNavigate(isAuthenticated ? 'dashboard' : 'register'),
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: 'per member / month',
      desc: 'Governance, advanced security policies, and custom compliance workflows.',
      features: [
        'Everything in Professional',
        'Dedicated workspace isolation',
        'Executive productivity reporting',
        'Custom audit trails & data retention',
        '24/7 dedicated support representative',
      ],
      popular: false,
      cta: 'Contact Sales',
      ctaAction: () => onNavigate(isAuthenticated ? 'dashboard' : 'register'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top SaaS Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              TaskFlow <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
            </span>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Reviews
            </a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TaskFlow Pro 3.4 • Zero-Latency Local Storage & Kanban Suite</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Deliver Ambitious Goals with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
              Clarity & Speed
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The premium task execution engine designed for high-velocity teams.
            Manage multi-tier deliverables, align team deadlines, and visualize
            workflow velocity effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              <span>Explore Live Workspace</span>
            </button>
          </div>

          {/* Proof micro-copy */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant Local Storage
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Backend Setup Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full Offline Support
            </span>
          </div>

          {/* Hero Mockup Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-indigo-500/20 to-slate-200/40 dark:from-indigo-500/20 dark:to-slate-800/40 shadow-2xl border border-indigo-200/50 dark:border-indigo-900/40">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner text-left">
              {/* App Chrome Header */}
              <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 text-xs font-bold text-slate-500">
                    taskflow.workspace.app / agile-sprint-board
                  </span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  Enterprise Production
                </span>
              </div>

              {/* Sample Live Mockup Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      To Do (3)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Planning
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      Product
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      Prepare Enterprise Customer Onboarding Deck
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">Due in 4 days</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      In Progress (2)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Sprint 24
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-200 dark:border-indigo-900 shadow-sm ring-1 ring-indigo-500/20">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                      Urgent
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      Finalize Q3 Product Roadmap & OKRs
                    </h5>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                      <div className="w-2/3 h-full bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Completed (5)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      100%
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Verified
                    </span>
                    <h5 className="text-xs font-bold line-through text-slate-400 mt-1.5">
                      Design System Typography & Elevation Tokens
                    </h5>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Shipped successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Engineered to Keep Teams in Flow State
            </h3>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-3">
              Everything your team needs to capture work, prioritize commitments, and monitor delivery pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Dual Kanban & List Views
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Switch instantly between a multi-column visual Kanban board and a dense sortable list view with full search.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Agenda Calendar
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                View your sprint deliverables mapped cleanly onto a full calendar grid with due date chips and day drill-down.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Dynamic Velocity Metrics
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Monitor live task completion percentages, priority distribution ratios, and upcoming deadline forecasts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Offline LocalStorage Engine
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Your data is stored locally in your browser with zero network lag. Export and backup your workspace anytime in standard JSON.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Checklists & Subtasks
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Break complex deliverables down into actionable subtask items with individual completion checkboxes and progress bars.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Pro Theme Engine
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Seamless Dark Mode and Light Mode support with refined contrast, premium borders, and smooth transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Simple, Predictable Plans for Teams
            </h3>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-3">
              Get started immediately with full frontend capabilities. No surprise charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                    Most Popular Choice
                  </span>
                )}

                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                    {plan.desc}
                  </p>

                  <div className="mt-6 mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      / {plan.period}
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={plan.ctaAction}
                  className={`mt-8 w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Social Proof
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Endorsed by Top Product Leaders
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-indigo-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Supercharge Your Team's Execution Today
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto">
            Experience the clarity of high-velocity task management with instant offline persistence and enterprise-grade design.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'register')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-extrabold rounded-xl shadow-xl transition-all"
            >
              Get Started Free Now
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-700/80 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all border border-indigo-500/50"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              TaskFlow Pro SaaS Platform
            </span>
            <span>• © 2026 TaskFlow Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
            <button
              onClick={() => onNavigate('settings')}
              className="hover:underline"
            >
              Preferences
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
