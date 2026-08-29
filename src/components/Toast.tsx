'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const typeConfig = {
    success: { icon: CheckCircle2, className: 'toast-success bg-secondary/10 border-secondary text-secondary' },
    error: { icon: XCircle, className: 'toast-error bg-danger/10 border-danger text-danger' },
    warning: { icon: AlertCircle, className: 'toast-warning bg-warning/10 border-warning text-warning' },
    info: { icon: Info, className: 'toast-info bg-info/10 border-info text-info' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`toast flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md min-w-[300px] max-w-md ${config.className}`}>
        <Icon size={20} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
