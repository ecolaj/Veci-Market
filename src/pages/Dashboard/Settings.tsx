import { useAuthStore } from '../../store';
import { services } from '../../lib/services';
import { LogOut, User, Shield, BookOpen, ChevronRight, AlertTriangle, X, Bell, BellOff, ShieldAlert, DownloadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import { requestNotificationPermission, db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { cn } from '../../lib/utils';

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [testingPush, setTestingPush] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPerm(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      const q = query(collection(db, 'reports'), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snap) => {
        setPendingReportsCount(snap.docs.length);
      }, (error) => {
        console.warn("Could not subscribe to pending reports (likely permission issue or non-admin):", error);
      });
      return () => unsub();
    }
  }, [user?.role]);

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

  const handleSendTestPush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (testingPush) return;
    setTestingPush(true);
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', user.id));
      const tokens = userDoc.exists() ? (userDoc.data()?.fcm_tokens || []) : [];
      
      if (tokens.length === 0) {
        alert("No se encontraron tokens FCM registrados para tu cuenta en este navegador. Intenta desinstalar/instalar el acceso directo de tu PWA y vuelve a activar las notificaciones para volver a generarlo.");
        setTestingPush(false);
        return;
      }
      
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: user.id,
          tokens,
          title: "¡Prueba de VeciMarket!",
          body: "Esta es una notificación push de prueba real en tiempo de ejecución. ¡Tu PWA funciona perfectamente!",
          data: { url: '/dashboard/settings' }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`¡Notificación enviada con éxito! Revisa la pantalla de tu móvil.`);
      } else {
        alert(`Error al enviar: ${data.error || 'Desconocido'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error de red o conexión: ${err.message}`);
    } finally {
      setTestingPush(false);
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
        {user?.role === 'admin' && (
          <div 
            onClick={() => navigate('/dashboard/reports')}
            className="flex items-center justify-between p-6 hover:bg-red-50 cursor-pointer transition-colors border-b border-neutral-100 sm:hidden relative"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center relative">
                <ShieldAlert className="w-5 h-5" />
                {pendingReportsCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm">
                    {pendingReportsCount}
                  </div>
                )}
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
                  {notificationPerm === 'granted' ? "Activas" : "Desactivadas - click para activar"}
                </p>
              </div>
            </div>
            
            {/* Toggle switch visual indicator */}
            <div className={cn("w-12 h-6 rounded-full p-1 flex items-center transition-colors", notificationPerm === 'granted' ? "bg-indigo-500" : "bg-neutral-200")}>
              <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", notificationPerm === 'granted' ? "translate-x-6" : "translate-x-0")} />
            </div>
          </div>

          {notificationPerm === 'granted' && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={testingPush}
                onClick={handleSendTestPush}
                className="w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 transition-colors py-3.5 px-4 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testingPush ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-700 animate-spin" />
                    Enviando prueba...
                  </>
                ) : (
                  "Probar notificación push real (FCM)"
                )}
              </button>
            </div>
          )}
          
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

        {/* Install Guide */}
        <div 
          className="flex items-center justify-between p-6 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-100"
          onClick={() => navigate("/install")}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800">Guía de Instalación</h3>
              <p className="text-xs text-neutral-500">Cómo agregar como App en tu celular</p>
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
