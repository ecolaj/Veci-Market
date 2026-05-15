import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Extend the Window interface to include a type for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    if (localStorage.getItem('pwa_prompt_dismissed')) {
      setHasDismissed(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in navigator) && (navigator as any).standalone;

    if (isIos && !isStandalone) {
      setIsIosPrompt(true);
      setTimeout(() => setShowPrompt(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // We can decide when to show the prompt. For now, show it shortly after load.
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (hasDismissed) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed bottom-24 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 px-5 py-4 rounded-[20px] shadow-2xl flex items-center justify-between text-white w-full max-w-md pointer-events-auto"
          >
            {isIosPrompt ? (
              <div className="flex items-center gap-3 font-medium text-sm text-left flex-1">
                <div className="bg-white/20 p-2 rounded-full shrink-0">
                  <Share className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="block leading-tight text-white/90">
                  Instala la app: Toca el ícono <Share className="w-4 h-4 inline" /> y luego <strong>"Agregar a inicio"</strong>
                </span>
                <button 
                  onClick={handleDismiss}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 font-medium text-sm text-left flex-1">
                  <div className="bg-white/20 p-2 rounded-full shrink-0">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="block leading-tight text-white/90">
                    ¡Instala <strong>VeciMarket</strong> en tu pantalla de inicio para acceso rápido!
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={handleInstallClick} 
                    className="text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shrink-0 shadow-sm"
                  >
                    Instalar
                  </button>
                  <button 
                    onClick={handleDismiss}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4 text-neutral-300" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
