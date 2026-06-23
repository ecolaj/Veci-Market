import React, { useState } from 'react';
import { Phone, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactPhoneProps {
  phone: string;
  className?: string;
}

export function ContactPhone({ phone, className = '' }: ContactPhoneProps) {
  const [activeModal, setActiveModal] = useState<'whatsapp' | 'call' | null>(null);

  if (!phone) return null;

  const whatsAppUrl = `https://wa.me/${phone.startsWith('502') ? phone : '502' + phone}`;
  const telUrl = `tel:${phone}`;

  const handleConfirmAction = () => {
    if (activeModal === 'whatsapp') {
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    } else if (activeModal === 'call') {
      window.location.href = telUrl;
    }
    setActiveModal(null);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Phone Button */}
      <button 
        onClick={() => setActiveModal('call')}
        className="font-medium cursor-pointer hover:text-emerald-600 hover:underline flex items-center gap-1 bg-transparent border-none p-0 text-left"
        title="Llamar"
      >
        <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
        <span>{phone}</span>
      </button>

      {/* WhatsApp Button */}
      <button 
        onClick={() => setActiveModal('whatsapp')}
        className="w-7 h-7 shrink-0 flex items-center justify-center bg-[#25D366] rounded-full hover:bg-green-600 transition-colors shadow-sm cursor-pointer border-none"
        title="Enviar WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="text-white fill-current" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"></path>
        </svg>
      </button>

      {/* Modern Dialog Modal (AnimatePresence) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-[32px] p-6 shadow-2xl border border-neutral-100 max-w-sm w-full mx-auto flex flex-col items-center text-center z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
                activeModal === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {activeModal === 'whatsapp' ? (
                  <MessageSquare className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-black text-neutral-800 leading-snug">
                {activeModal === 'whatsapp' ? '¿Enviar mensaje de WhatsApp?' : '¿Llamar por teléfono?'}
              </h3>
              <p className="text-sm text-neutral-500 mt-2 px-1 leading-relaxed">
                {activeModal === 'whatsapp' ? (
                  <>Se abrirá la aplicación para chatear con el vecino al número <span className="font-bold text-neutral-700">{phone}</span>.</>
                ) : (
                  <>Tu dispositivo iniciará una llamada normal al vecino al número <span className="font-bold text-neutral-700">{phone}</span>.</>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full mt-6">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3.5 px-4 rounded-2xl transition-colors text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmAction}
                  className={`flex-1 text-white font-bold py-3.5 px-4 rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    activeModal === 'whatsapp' 
                      ? 'bg-[#25D366] hover:bg-green-600 shadow-green-100' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {activeModal === 'whatsapp' ? 'Chatear' : 'Llamar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
