import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_TASKS, INITIAL_SETTINGS, CATEGORIES } from '../data/initialData';
import { useNotifications } from './NotificationContext';

const TaskContext = createContext();

const TASKS_STORAGE_KEY = 'taskflow_tasks';
const SETTINGS_STORAGE_KEY = 'taskflow_settings';
const CATEGORIES_STORAGE_KEY = 'taskflow_categories';

export const TaskProvider = ({ children }) => {
  const { addToast, addNotification } = useNotifications();

  // Load Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Load Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Load Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  // Persist Tasks
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Persist Categories
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  // Create Task
  const addTask = (taskData) => {
    const today = new Date().toISOString().split('T')[0];
    const newTask = {
      id: 'task_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : '',
      status: taskData.status || settings.defaultStatus || 'To Do',
      priority: taskData.priority || settings.defaultPriority || 'Medium',
      category: taskData.category || 'Product',
      dueDate: taskData.dueDate || today,
      createdAt: today,
      subtasks: taskData.subtasks || [],
    };

    setTasks((prev) => [newTask, ...prev]);
    addToast(`Task "${newTask.title}" created successfully.`, 'success');
    addNotification({
      title: 'New Task Created',
      message: `"${newTask.title}" assigned with ${newTask.priority} priority.`,
      type: 'info',
      taskId: newTask.id,
    });
    return newTask;
  };

  // Update Task
  const updateTask = (id, updatedFields) => {
    let updatedTitle = '';
    let statusChangedToCompleted = false;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTitle = updatedFields.title || t.title;
          if (updatedFields.status === 'Completed' && t.status !== 'Completed') {
            statusChangedToCompleted = true;
          }
          return { ...t, ...updatedFields };
        }
        return t;
      })
    );

    addToast(`Task updated successfully.`, 'success');

    if (statusChangedToCompleted) {
      addNotification({
        title: 'Task Completed',
        message: `Great job! "${updatedTitle}" was completed.`,
        type: 'success',
        taskId: id,
      });
    }
  };

  // Delete Task
  const deleteTask = (id) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast(target ? `Task "${target.title}" deleted.` : 'Task deleted.', 'info');
  };

  // Fast Status Change
  const updateTaskStatus = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  // Toggle Complete
  const toggleTaskComplete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    updateTask(id, { status: newStatus });
  };

  // Subtasks helper
  const toggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = (task.subtasks || []).map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      })
    );
  };

  const addSubtask = (taskId, title) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newSub = {
            id: 'sub_' + Date.now().toString(36),
            title: title.trim(),
            completed: false,
          };
          return { ...task, subtasks: [...(task.subtasks || []), newSub] };
        }
        return task;
      })
    );
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: (task.subtasks || []).filter((s) => s.id !== subtaskId),
          };
        }
        return task;
      })
    );
  };

  // Add Category
  const addCategory = (newCat) => {
    const trimmed = newCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      addToast(`Category "${trimmed}" added.`, 'success');
    }
  };

  // Update Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Preferences saved successfully.', 'success');
  };

  // Reset to initial sample tasks
  const resetWorkspace = () => {
    setTasks(INITIAL_TASKS);
    setCategories(CATEGORIES);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(CATEGORIES));
    addToast('Workspace restored to standard configuration.', 'info');
  };

  // Import tasks from JSON
  const importTasks = (importedTasks) => {
    if (Array.isArray(importedTasks) && importedTasks.length > 0) {
      setTasks(importedTasks);
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(importedTasks));
      addToast(`Imported ${importedTasks.length} tasks successfully.`, 'success');
      return true;
    }
    addToast('Invalid task backup file format.', 'error');
    return false;
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const inReview = tasks.filter((t) => t.status === 'In Review').length;
    const pending = tasks.filter((t) => t.status === 'To Do').length;
    const urgent = tasks.filter((t) => t.priority === 'Urgent').length;
    const high = tasks.filter((t) => t.priority === 'High').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];

    const upcomingDeadlines = [...tasks]
      .filter((t) => t.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6);

    const overdueCount = tasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate < todayStr
    ).length;

    const dueTodayCount = tasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate === todayStr
    ).length;

    return {
      total,
      completed,
      inProgress,
      inReview,
      pending,
      urgent,
      high,
      completionRate,
      upcomingDeadlines,
      overdueCount,
      dueTodayCount,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        settings,
        categories,
        stats,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        toggleTaskComplete,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addCategory,
        updateSettings,
        resetWorkspace,
        importTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};

