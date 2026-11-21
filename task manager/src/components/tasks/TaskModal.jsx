import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useTasks } from '../../context/TaskContext';
import { Plus, Trash2, CheckSquare, Calendar, Flag, Tag, Layers } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, task = null, defaultStatus = 'To Do' }) => {
  const { addTask, updateTask, categories, addCategory, settings } = useTasks();

  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Product');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'To Do');
      setPriority(task.priority || 'Medium');
      setCategory(task.category || 'Product');
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setSubtasks(task.subtasks ? [...task.subtasks] : []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || settings?.defaultStatus || 'To Do');
      setPriority(settings?.defaultPriority || 'Medium');
      setCategory(categories[0] || 'Product');
      setDueDate(today);
      setSubtasks([]);
    }
    setSubtaskInput('');
    setIsAddingCategory(false);
    setNewCategoryInput('');
    setErrors({});
  }, [task, isOpen, settings, categories, defaultStatus]);

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!subtaskInput.trim()) return;
    const newSub = {
      id: 'sub_' + Date.now().toString(36),
      title: subtaskInput.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, newSub]);
    setSubtaskInput('');
  };

  const handleToggleSubtask = (id) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (newCategoryInput.trim()) {
      addCategory(newCategoryInput.trim());
      setCategory(newCategoryInput.trim());
      setNewCategoryInput('');
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      subtasks,
    };

    if (isEditing) {
      updateTask(task.id, payload);
    } else {
      addTask(payload);
    }

    onClose();
  };

  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400' },
    { value: 'Medium', label: 'Medium', color: 'border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400' },
    { value: 'High', label: 'High', color: 'border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400' },
    { value: 'Urgent', label: 'Urgent', color: 'border-rose-400 dark:border-rose-600 text-rose-600 dark:text-rose-400' },
  ];

  const statusOptions = ['To Do', 'In Progress', 'In Review', 'Completed'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task Details' : 'Create New Task'}
      subtitle={isEditing ? `Task ID: #${task?.id}` : 'Plan and schedule a new execution deliverable'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="e.g. Conduct Security Penetration Audit"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.title
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Description & Specifications
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail context, acceptance criteria, dependencies or external references..."
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
          />
        </div>

        {/* Row: Status & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-500" /> Priority Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all text-center ${
                    priority === opt.value
                      ? `${opt.color} bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500/30 font-extrabold`
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row: Category & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5 text-emerald-500" /> Project / Category
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {isAddingCategory ? 'Select Existing' : '+ New Tag'}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="New category..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: null }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.dueDate
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.dueDate && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Deliverable Checklist / Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
          </label>

          {/* Subtasks list */}
          {subtasks.length > 0 && (
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm group"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                    <span
                      className={`${
                        sub.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors opacity-80 group-hover:opacity-100"
                    title="Remove subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Subtask input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add an actionable subtask item..."
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              disabled={!subtaskInput.trim()}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
