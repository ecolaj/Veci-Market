import { AlertTriangle, X } from 'lucide-react';

interface PhoneAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneAlertModal({ isOpen, onClose }: PhoneAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-neutral-800">
            Teléfono Inválido
          </h3>
          <p className="text-neutral-500 font-medium">
            Por favor, asegúrate de que el número de teléfono tenga exactamente 8 dígitos (ni más, ni menos).
          </p>
          <button 
            onClick={onClose}
            className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 transition transform hover:scale-105 active:scale-95 shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
