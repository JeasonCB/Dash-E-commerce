'use client';

import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Modal de confirmación personalizado para reemplazar window.confirm()
 * Uso: 
 * const { showConfirm, ConfirmModal } = useConfirm();
 * const result = await showConfirm({ title, message });
 */

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'warning', // 'warning' | 'danger' | 'info'
  });
  const [resolvePromise, setResolvePromise] = useState(null);

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || '¿Estás seguro?',
        message: options.message || '',
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
      });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  const getIcon = () => {
    switch (config.type) {
      case 'danger':
        return <ExclamationTriangleIcon className="h-12 w-12 text-error" />;
      case 'info':
        return <CheckCircleIcon className="h-12 w-12 text-info" />;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-warning" />;
    }
  };

  const ConfirmModal = () => {
    if (!isOpen) return null;

    return (
      <div className="modal modal-open">
        <div className="modal-box bg-slate-900 border border-white/10">
          <button
            onClick={handleCancel}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4">
              {getIcon()}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              {config.title}
            </h3>

            <p className="text-slate-300 mb-6 max-w-sm whitespace-pre-line">
              {config.message}
            </p>

            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={handleCancel}
                className="btn btn-ghost min-w-[120px]"
              >
                {config.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`btn min-w-[120px] ${
                  config.type === 'danger' 
                    ? 'btn-error' 
                    : config.type === 'info'
                    ? 'btn-info'
                    : 'btn-warning'
                }`}
              >
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop bg-black/70" onClick={handleCancel}>
          <button>close</button>
        </div>
      </div>
    );
  };

  return { showConfirm, ConfirmModal };
}
