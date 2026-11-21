import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  HardDrive,
  Sliders
} from 'lucide-react';

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, tasks, categories, resetWorkspace, importTasks } = useTasks();
  const { currentUser } = useAuth();
  const { addToast } = useNotifications();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Compute localStorage footprint
  const calculateStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    return (total / 1024).toFixed(1); // in KB
  };

  const storageKB = calculateStorageSize();

  // Export JSON handler
  const handleExportData = () => {
    const backupData = {
      version: '3.4.0',
      exportedAt: new Date().toISOString(),
      user: currentUser,
      settings,
      categories,
      tasks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `taskflow-workspace-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Workspace backup JSON file downloaded.', 'success');
  };

  // Import JSON handler
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          importTasks(parsed.tasks);
          if (parsed.settings) updateSettings(parsed.settings);
        } else if (Array.isArray(parsed)) {
          importTasks(parsed);
        } else {
          addToast('Unrecognized JSON structure. Please check backup file.', 'error');
        }
      } catch {
        addToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Workspace Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize interface themes, default sprint parameters, and backup local state
        </p>
      </div>

      {/* Section 1: Appearance & Theme */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" /> Interface Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Select your visual appearance mode for maximum focus and contrast
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Light Appearance
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Crisp high-contrast daylight styling
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 shrink-0">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Dark Appearance
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Reduced eye fatigue in low-light environments
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 2: Task Defaults */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" /> Default Task Parameters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Initial attributes assigned when authoring new deliverables
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Priority Level
            </label>
            <select
              value={settings.defaultPriority || 'Medium'}
              onChange={(e) => updateSettings({ defaultPriority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Pipeline Status
            </label>
            <select
              value={settings.defaultStatus || 'To Do'}
              onChange={(e) => updateSettings({ defaultStatus: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Deadline Warning Notifications
              </p>
              <p className="text-[11px] text-slate-400">
                Surface in-app alert badges when deliverables are scheduled for today or tomorrow
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailReminders ?? true}
              onChange={(e) => updateSettings({ emailReminders: e.target.checked })}
              className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Daily Sprint Summary
              </p>
              <p className="text-[11px] text-slate-400">
                Calculate live velocity ratios across active deliverables
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.dailySummary ?? true}
              onChange={(e) => updateSettings({ dailySummary: e.target.checked })}
              className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Data Management & Backup */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" /> Data Sovereignty & Backups
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export, import, or restore your complete workspace with zero cloud lock-in
          </p>
        </div>

        {/* Footprint Indicator */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Storage Allocation Usage</span>
            <span>{storageKB} KB of 5,120 KB</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="w-[2%] h-full bg-emerald-500 rounded-full" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            All records are preserved in HTML5 LocalStorage on this device.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export */}
          <button
            onClick={handleExportData}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-200 transition-all flex flex-col items-center text-center gap-1.5 group"
          >
            <Download className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Export Backup JSON</span>
            <span className="text-[10px] text-slate-400">Download snapshot</span>
          </button>

          {/* Import */}
          <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-200 transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer group">
            <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Import JSON File</span>
            <span className="text-[10px] text-slate-400">Restore tasks</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Workspace */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-600 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-200 transition-all flex flex-col items-center text-center gap-1.5 group"
          >
            <RotateCcw className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Restore Sample Tasks</span>
            <span className="text-[10px] text-slate-400">Reset to standard setup</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetWorkspace}
        title="Restore Standard Configuration"
        message="This will re-seed your workspace with standard commercial tasks and categories. Any existing tasks will be replaced."
        confirmText="Confirm Restore"
        confirmVariant="danger"
      />
    </div>
  );
};
