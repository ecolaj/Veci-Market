import { BrowserRouter as Router, Routes, Route, Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search as SearchIcon, User, Bell, Menu, LayoutDashboard, Plus, Settings, Package, Info, Heart } from 'lucide-react';
import { useAuthStore, useAppStore } from './store';
import { cn } from './lib/utils';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { requestNotificationPermission } from './lib/firebase';

import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import LoginPage from './pages/Auth/Login';
import ClassifiedDetail from './pages/ClassifiedDetail';
import DashboardLayout from './pages/Dashboard/DashboardLayout'; // We will create this
import MyClassifieds from './pages/Dashboard/MyClassifieds'; // We will create this
import Inbox from './pages/Dashboard/Inbox'; // We will create this
import Stats from './pages/Dashboard/Stats'; // We will create this
import Favorites from './pages/Dashboard/Favorites';
import ProfileSettings from './pages/Dashboard/ProfileSettings';
import SettingsView from './pages/Dashboard/Settings';
import AdminReports from './pages/Dashboard/AdminReports';

import RegisterPage from './pages/Auth/Register';
import PublishAd from './pages/PublishAd';
import UserProfile from './pages/UserProfile';
import Manual from './pages/Manual';
import InstallGuide from './pages/InstallGuide';
import Privacy from './pages/Privacy';
import PWAPrompt from './components/PWAPrompt';
import AppLogo from './components/AppLogo';

// Layout component
function Layout() {
  const { isAuthenticated, user } = useAuthStore();
  const orders = useAppStore(state => state.orders);
  const location = useLocation();
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPerm = async () => {
    const perm = await Notification.requestPermission();
    setNotificationPerm(perm);
    if (perm === 'granted') {
      await requestNotificationPermission(user?.id);
    }
  };
  
  // Count pending orders for vendor
  const pendingOrders = orders.filter(o => o.vendor_id === user?.id && o.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 pt-safe font-sans shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 p-1">
              <AppLogo className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-neutral-800">Veci<span className="text-emerald-500">Market</span></span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/dashboard/reports" className="hidden sm:inline-flex px-3 py-2 text-xs font-bold bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors">
                    Admin Reportes
                  </Link>
                )}
                <Link to="/publish" className="hidden sm:inline-flex text-sm font-bold bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                  + Nuevo Anuncio
                </Link>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to="/dashboard/favorites" className="relative p-2 text-neutral-600 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                    {user?.saved_ads?.length ? (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    ) : null}
                  </Link>
                  <Link to="/dashboard/inbox" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors flex items-center justify-center">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {pendingOrders > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-black px-1.5 min-w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center">
                        {pendingOrders}
                      </span>
                    )}
                  </Link>
                </div>
                <Link to="/dashboard/profile" className="flex items-center gap-3 bg-white p-1 pr-1 sm:pr-4 border border-neutral-200 hover:border-emerald-200 rounded-full shadow-sm transition-colors ml-1 sm:ml-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-emerald-200 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-emerald-200 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.display_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-bold text-neutral-800 leading-tight">{user?.display_name}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold truncate max-w-[100px]">{user?.sector || 'Usuario'}</span>
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Pending Orders Notification Banner */}
      <AnimatePresence>
        {isAuthenticated && notificationPerm === 'default' && (
          <div className="fixed top-24 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none mb-2">
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-indigo-500/95 backdrop-blur-md border border-indigo-500/50 px-5 py-4 rounded-[20px] shadow-2xl flex items-center justify-between text-white w-full max-w-md pointer-events-auto"
            >
              <div className="flex items-center gap-3 font-medium text-sm">
                <div className="bg-white/20 p-2 rounded-full shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <span className="block leading-tight text-white/90">
                    Activa las <strong>Notificaciones</strong> para no perder ningún detalle de tus pedidos.
                  </span>
                </div>
              </div>
              <button onClick={requestPerm} className="text-xs font-black bg-white hover:bg-neutral-100 text-indigo-600 px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shrink-0 shadow-sm ml-4">
                Activar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthenticated && pendingOrders > 0 && (
          <div className={`fixed ${notificationPerm === 'default' ? 'top-48' : 'top-24'} left-0 right-0 z-50 flex justify-center px-4 pointer-events-none`}>
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-red-500/95 backdrop-blur-md border border-red-500/50 px-5 py-4 rounded-[20px] shadow-2xl shadow-red-500/20 flex items-center justify-between text-white w-full max-w-md pointer-events-auto"
            >
              <div className="flex items-center gap-3 font-medium text-sm">
                <div className="bg-white/20 p-2 rounded-full shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <span className="block leading-tight text-white/90">
                    Tienes <strong className="text-white">{pendingOrders}</strong> {pendingOrders === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de validar.
                  </span>
                </div>
              </div>
              <Link to="/dashboard/inbox" className="text-xs font-black bg-white hover:bg-neutral-100 text-red-600 px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shrink-0 shadow-sm ml-4">
                Ver
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PWAPrompt />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 md:pt-8 pb-6 mb-16 sm:mb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white border-t border-neutral-200 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className={cn("grid items-center h-16 relative", isAuthenticated ? "grid-cols-5" : "grid-cols-3")}>
          <NavLink to="/" end className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Inicio</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
            <SearchIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Buscar</span>
          </NavLink>
          {isAuthenticated && (
             <NavLink to="/dashboard" end className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
               <Package className="w-5 h-5" />
               <span className="text-[10px] font-bold truncate px-1 text-center w-full">Vender</span>
             </NavLink>
          )}
          {isAuthenticated && (
             <NavLink to="/dashboard/inbox" className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full relative", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
               <div className="relative">
                 <Bell className="w-5 h-5" />
                 {pendingOrders > 0 && (
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                     {pendingOrders}
                   </span>
                 )}
               </div>
               <span className="text-[10px] font-bold">Bandeja</span>
             </NavLink>
          )}
          {isAuthenticated && (
             <NavLink to="/dashboard/settings" className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
               <Settings className="w-5 h-5" />
               <span className="text-[10px] font-bold">Ajustes</span>
             </NavLink>
          )}
          {!isAuthenticated && (
            <NavLink to="/login" className={({ isActive }) => cn("flex flex-col flex-1 items-center gap-1 p-2 transition-colors w-full", isActive ? "text-emerald-600 relative after:absolute after:bottom-0 after:w-8 after:h-1 after:bg-emerald-500 after:rounded-t-md" : "text-neutral-500 hover:text-emerald-500")}>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Cuenta</span>
            </NavLink>
          )}
        </div>
      </nav>

      {isAuthenticated && (
        <Link to="/publish" className="sm:hidden fixed bottom-20 right-4 z-50 bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border border-emerald-400">
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="classified/:id" element={<ClassifiedDetail />} />
          <Route path="user/:id" element={<UserProfile />} />
          <Route path="manual" element={<Manual />} />
          <Route path="install" element={<InstallGuide />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<MyClassifieds />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="stats" element={<Stats />} />
          </Route>
        </Route>
        {/* Full screen pages outside the main layout */}
        <Route path="/publish" element={<PublishAd />} />
      </Routes>
    </Router>
  );
}
