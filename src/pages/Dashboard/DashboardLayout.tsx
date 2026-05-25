import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../../store';
import { LayoutDashboard, Inbox as InboxIcon, BarChart3, LogOut, Package, UserCircle, Settings, ShieldAlert, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full">
      <Outlet />
    </div>
  )
}
