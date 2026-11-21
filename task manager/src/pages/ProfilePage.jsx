import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  Award,
  Shield,
  Save,
  Lock,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { stats } = useTasks();
  const { addToast } = useNotifications();

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [workspace, setWorkspace] = useState(currentUser?.workspace || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'America/New_York (EST)');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});

  const getInitials = (nameStr) => {
    if (!nameStr) return 'TF';
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty.', 'error');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast('Please provide a valid email address.', 'error');
      return;
    }

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department: department.trim(),
      workspace: workspace.trim(),
      phone: phone.trim(),
      timezone,
      bio: bio.trim(),
    });

    addToast('Profile changes saved successfully.', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const errors = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    updateProfile({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
    addToast('Security credentials updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Identity Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-indigo-600/25 shrink-0">
            {getInitials(currentUser?.name)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentUser?.name || 'Authorized Member'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active Member
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {currentUser?.role || 'Lead Specialist'} • {currentUser?.workspace || 'TaskFlow Enterprise'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Member since {currentUser?.memberSince || '2024'} • Local storage synchronized
            </p>
          </div>
        </div>

        {/* Productivity Stat Pills */}
        <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Work</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.completed}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Efficiency</p>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {stats.completionRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Edit Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Personal & Professional Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Update your identity and display preferences across the workspace
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Job Title / Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Workspace */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Workspace
                </label>
                <input
                  type="text"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="America/New_York (EST)">America/New_York (EST / UTC-5)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / UTC-8)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT / UTC+0)</option>
                <option value="Europe/Berlin (CET)">Europe/Berlin (CET / UTC+1)</option>
                <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST / UTC+9)</option>
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST / UTC+5:30)</option>
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Professional Bio & Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & Password Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" /> Security Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Update password for this local browser session
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Update Credentials</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Note: All authentication state is managed in browser localStorage for offline capability.
          </div>
        </div>
      </div>
    </div>
  );
};

