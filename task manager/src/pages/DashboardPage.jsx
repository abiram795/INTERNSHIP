import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { StatCard } from '../components/dashboard/StatCard';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { RecentTasks } from '../components/dashboard/RecentTasks';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  LayoutGrid,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DashboardPage = ({
  onNavigate,
  openCreateTaskModal,
  openEditTaskModal,
  promptDeleteTask,
}) => {
  const { currentUser } = useAuth();
  const { tasks, stats, toggleTaskComplete } = useTasks();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Workspace Sprint 24 Active</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Team Lead'}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            You have <strong className="text-white font-bold">{stats.pending + stats.inProgress} active deliverables</strong> across your projects.
            {stats.dueTodayCount > 0 && (
              <span className="text-amber-300 font-bold ml-1">
                {stats.dueTodayCount} task(s) are due today.
              </span>
            )}
          </p>
        </div>

        {/* Action quick links */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => openCreateTaskModal('To Do')}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-950/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Deliverable</span>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/15 transition-all flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4 text-indigo-300" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          trend="+14% this month"
          trendPositive={true}
          icon={Layers}
          accentColor="indigo"
          subtitle="All categories"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          trend={`${stats.completionRate}% completion`}
          trendPositive={stats.completionRate >= 50}
          icon={CheckCircle2}
          accentColor="emerald"
          subtitle="Verified deliverables"
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          trend={`${stats.inReview} in review`}
          trendPositive={true}
          icon={Clock}
          accentColor="blue"
          subtitle="Active execution"
        />

        <StatCard
          title="Pending / To Do"
          value={stats.pending}
          trend={stats.urgent > 0 ? `${stats.urgent} urgent` : 'No urgent alerts'}
          trendPositive={stats.urgent === 0}
          icon={AlertTriangle}
          accentColor={stats.urgent > 0 ? 'rose' : 'amber'}
          subtitle="Backlog pipeline"
        />
      </div>

      {/* Weekly Velocity & Distribution */}
      <ProductivityChart tasks={tasks} stats={stats} />

      {/* Upcoming Deadlines & Recent Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines
          deadlines={stats.upcomingDeadlines}
          onEditTask={openEditTaskModal}
          onToggleComplete={toggleTaskComplete}
          onNavigateTasks={() => onNavigate('tasks')}
        />

        <RecentTasks
          tasks={tasks}
          onEditTask={openEditTaskModal}
          onDeleteTask={promptDeleteTask}
          onToggleComplete={toggleTaskComplete}
          onNavigateTasks={() => onNavigate('tasks')}
          onAddNewTask={() => openCreateTaskModal('To Do')}
        />
      </div>
    </div>
  );
};

