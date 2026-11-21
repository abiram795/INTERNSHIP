import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger', // 'danger' | 'primary'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

