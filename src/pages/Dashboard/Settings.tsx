import { useAuthStore } from '../../store';
import { services } from '../../lib/services';
import { LogOut, User, Shield, BookOpen, ChevronRight, AlertTriangle, X, Bell, BellOff, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import { requestNotificationPermission } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPerm(Notification.permission);
    }
  }, []);

  const handleToggleNotification = async () => {
    if (!('Notification' in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }

    if (notificationPerm === 'granted') {
      alert("Las notificaciones ya están activas. Para desactivarlas o cambiar el comportamiento en segundo plano, por favor ajusta los permisos desde la configuración de tu navegador o dispositivo.");
      // Optional: attempt a test push to prove they work
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      new Notification("Notificaciones activas", {
        body: "Así lucirán los avisos de nuevos pedidos y mensajes.",
        icon: "/icon.svg"
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPerm(permission);
    
    if (permission === 'granted') {
      await requestNotificationPermission(user?.id);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification("Notificaciones activas", {
            body: "¡Listo! Recibirás notificaciones mientras uses la app.",
            icon: "/icon.svg"
          } as any);
        });
      } else {
        new Notification("Notificaciones activas", {
          body: "¡Listo! Recibirás notificaciones mientras uses la app.",
          icon: "/icon.svg"
        });
      }
    } else {
      alert("Debes permitir las notificaciones en tu navegador/móvil para recibir alertas.");
    }
  };

  const handleLogout = async () => {
    await services.signOut();
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-neutral-800">Ajustes</h1>

      <div className="bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-sm">
        {user.role === 'admin' && (
          <div 
            onClick={() => navigate('/dashboard/reports')}
            className="flex items-center justify-between p-6 hover:bg-red-50 cursor-pointer transition-colors border-b border-neutral-100 sm:hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-600">Admin Reportes</h3>
                <p className="text-xs text-red-400">Gestionar reportes de la comunidad</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
          </div>
        )}

        <div 
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center justify-between p-6 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Ajustes de Perfil</h3>
              <p className="text-xs text-neutral-500">Actualiza tu información y avatar</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </div>

        <ThemeToggle />

        {/* Notifications Test */}
        <div 
          className="flex flex-col p-6 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100"
          onClick={handleToggleNotification}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", notificationPerm === 'granted' ? "bg-indigo-100 text-indigo-600" : "bg-neutral-100 text-neutral-400")}>
                {notificationPerm === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-neutral-800">Notificaciones PWA</h3>
                <p className="text-xs text-neutral-500">
                  {notificationPerm === 'granted' ? "Activas - click para probar" : "Desactivadas - click para activar"}
                </p>
              </div>
            </div>
            
            {/* Toggle switch visual indicator */}
            <div className={cn("w-12 h-6 rounded-full p-1 flex items-center transition-colors", notificationPerm === 'granted' ? "bg-indigo-500" : "bg-neutral-200")}>
              <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", notificationPerm === 'granted' ? "translate-x-6" : "translate-x-0")} />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-[10px] sm:text-xs">
            <strong>Nota sobre iOS/Móviles:</strong> Para que las notificaciones funcionen completamente en segundo plano cuando la app está cerrada, los navegadores y sistemas operativos (especialmente iOS) requieren servicios adicionales u opciones directas en <span className="font-bold">Ajustes &gt; Safari / Web</span> de tu dispositivo. Asegúrate de añadirla a la pantalla de inicio.
          </div>
        </div>

        {/* Manual */}
        <div 
          className="flex items-center justify-between p-6 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100"
          onClick={() => navigate("/manual")}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Manual de Usuario</h3>
              <p className="text-xs text-neutral-500">Guía de cómo usar VeciMarket</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </div>

        {/* Privacy Policy */}
        <div 
          className="flex items-center justify-between p-6 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100"
          onClick={() => navigate("/privacy")}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Política de Privacidad</h3>
              <p className="text-xs text-neutral-500">Términos y condiciones</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </div>

        {/* Logout */}
        <div 
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-between p-6 hover:bg-red-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-600">Cerrar Sesión</h3>
              <p className="text-xs text-red-400">Salir de tu cuenta</p>
            </div>
          </div>
        </div>

      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-neutral-800">
                ¿Cerrar Sesión?
              </h3>
              <p className="text-neutral-500 mt-2 font-medium">
                Tendrás que volver a ingresar tus credenciales para acceder a VeciMarket.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 font-black text-white rounded-2xl shadow-md transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
