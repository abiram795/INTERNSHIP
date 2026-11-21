import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { TaskModal } from '../components/tasks/TaskModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useTasks } from '../context/TaskContext';

export const DashboardLayout = ({ currentPage, onNavigate, children }) => {
  const { deleteTask } = useTasks();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState('To Do');

  // Global Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleOpenNewTask = (initialStatus = 'To Do') => {
    setTaskToEdit(null);
    setModalDefaultStatus(initialStatus || 'To Do');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handlePromptDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          onOpenNewTaskModal={() => handleOpenNewTask('To Do')}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {typeof children === 'function'
            ? children({
                openCreateTaskModal: handleOpenNewTask,
                openEditTaskModal: handleOpenEditTask,
                promptDeleteTask: handlePromptDeleteTask,
              })
            : children}
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        task={taskToEdit}
        defaultStatus={modalDefaultStatus}
      />

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Deliverable"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
};
