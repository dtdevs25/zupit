import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;
  const colorClass = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';
  const bgClass = type === 'success' ? 'bg-green-500/20 border-green-500/50' : type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-blue-500/20 border-blue-500/50';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#240b4d] border border-purple-600 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${bgClass}`}>
            <Icon className={`w-8 h-8 ${colorClass}`} />
          </div>
          
          <h2 className="text-xl font-black text-white mb-2">{title}</h2>
          <p className="text-purple-200 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
