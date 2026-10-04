import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Sim, Excluir',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#240b4d] border border-purple-600 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
          <p className="text-purple-200 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-white font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
