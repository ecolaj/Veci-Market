import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../../store';
import { LayoutDashboard, Inbox as InboxIcon, BarChart3, LogOut, Package, UserCircle, Settings, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const orders = useAppStore(state => state.orders);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const pendingOrders = orders.filter(o => o.vendor_id === user.id && o.status === 'pending').length;

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Navigation - Sidebar on Desktop */}
      <aside className="hidden sm:block w-64 shrink-0">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100 sticky top-24">
          <div className="hidden sm:block mb-6 px-2">
            <h2 className="font-black text-xl text-neutral-800">{user.display_name}</h2>
            <p className="text-sm text-neutral-400 capitalize font-bold">{user.role}</p>
          </div>
          
          <nav className="flex sm:flex-col overflow-x-auto sm:overflow-visible gap-2 sm:gap-2 pb-2 sm:pb-0 scrollbar-hide">
            {user.role === 'admin' && (
              <NavLink 
                to="/dashboard/reports" 
                className={({isActive}) => cn(
                  "flex items-center shrink-0 gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all",
                  isActive ? "bg-red-50 text-red-600 shadow-sm" : "text-neutral-500 bg-neutral-50 sm:bg-transparent hover:bg-red-50 hover:text-red-700 hover:scale-[1.02]"
                )}
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-red-600">Admin Reportes</span>
              </NavLink>
            )}
            <NavLink 
              to="/dashboard/settings" 
              className={({isActive}) => cn(
                "flex items-center shrink-0 gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all",
                isActive ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-neutral-500 bg-neutral-50 sm:bg-transparent hover:bg-neutral-50 hover:text-neutral-800 hover:scale-[1.02]"
              )}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Ajustes</span>
            </NavLink>
            <NavLink 
              to="/dashboard" 
              end
              className={({isActive}) => cn(
                "flex items-center shrink-0 gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all",
                isActive ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-neutral-500 bg-neutral-50 sm:bg-transparent hover:bg-neutral-50 hover:text-neutral-800 hover:scale-[1.02]"
              )}
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Mis Anuncios</span>
            </NavLink>
            <NavLink 
              to="/dashboard/inbox" 
              className={({isActive}) => cn(
                "flex items-center shrink-0 gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all",
                isActive ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-neutral-500 bg-neutral-50 sm:bg-transparent hover:bg-neutral-50 hover:text-neutral-800 hover:scale-[1.02]"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <InboxIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Bandeja</span>
              </div>
              {pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                  {pendingOrders}
                </span>
              )}
            </NavLink>
            <NavLink 
              to="/dashboard/stats" 
              className={({isActive}) => cn(
                "flex items-center shrink-0 gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all",
                isActive ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-neutral-500 bg-neutral-50 sm:bg-transparent hover:bg-neutral-50 hover:text-neutral-800 hover:scale-[1.02]"
              )}
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Estadísticas</span>
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
