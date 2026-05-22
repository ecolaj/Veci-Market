import React, { useState, useEffect } from 'react';
import { useAuthStore, useAppStore } from '../../store';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Report } from '../../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Trash2, EyeOff, Ban, Link as LinkIcon, Edit2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminReports() {
  const { user } = useAuthStore();
  const { classifieds, users } = useAppStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const q = query(collection(db, 'reports'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reps: Report[] = [];
      snapshot.forEach(doc => {
        reps.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(reps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">No tienes permisos para ver esta página.</div>;
  }

  const handleUpdateStatus = async (reportId: string, status: Report['status']) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
      setSelectedReport(null);
    } catch (e) {
      console.error(e);
      alert('Error al actualizar el reporte');
    }
  };

  const handleDeactivateAd = async (classifiedId: string, reportId: string) => {
    if (!window.confirm('¿Desactivar este anuncio?')) return;
    try {
      await updateDoc(doc(db, 'classifieds', classifiedId), { status: 'inactive' });
      await handleUpdateStatus(reportId, 'resolved');
      alert('Anuncio desactivado.');
    } catch (e) {
      console.error(e);
      alert('Error al desactivar');
    }
  };

  const handleDeleteAd = async (classifiedId: string, reportId: string) => {
    if (!window.confirm('¿Eliminar este anuncio permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'classifieds', classifiedId));
      await handleUpdateStatus(reportId, 'resolved');
      alert('Anuncio eliminado.');
    } catch (e) {
      console.error(e);
      alert('Error al eliminar');
    }
  };

  const handleSuspendUser = async (userId: string, reportId: string) => {
    if (!window.confirm('¿Marcar la cuenta del usuario como inactiva/suspendida? (A nivel aplicación)')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'banned' });
      await handleUpdateStatus(reportId, 'resolved');
      alert('Vendedor baneado. Sus próximos accesos podrían ser restringidos.');
    } catch (e) {
      console.error(e);
      alert('Error al suspender al usuario.');
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-neutral-500">Cargando reportes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
           <ShieldAlert className="w-6 h-6" />
         </div>
         <div>
           <h1 className="text-2xl font-black text-neutral-800">Panel de Administración</h1>
           <p className="text-sm text-neutral-500">Gestión de denuncias y reportes</p>
         </div>
      </div>

      <div className="grid gap-4">
        {reports.map(report => {
          const reporter = users.find(u => u.id === report.reporter_id);
          const cls = classifieds.find(c => c.id === report.classified_id);
          const vendor = cls ? users.find(u => u.id === cls.vendor_id) : null;
          
          return (
            <div key={report.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-4">
               <div className="flex justify-between items-start">
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' : report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                       {report.status}
                     </span>
                     <span className="text-xs text-neutral-400 font-bold">{new Date(report.created_at).toLocaleDateString()}</span>
                   </div>
                   <h3 className="font-bold text-neutral-800">
                     Motivo: <span className="text-red-600">{report.reason}</span>
                   </h3>
                   <p className="text-sm text-neutral-500 mt-1">
                     Reportado por: <span className="font-medium text-neutral-700">{reporter?.display_name || 'Usuario '}</span>
                   </p>
                 </div>
                 <button 
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  className="bg-neutral-100 text-neutral-600 p-2 rounded-xl hover:bg-neutral-200 transition-colors"
                 >
                   <Edit2 className="w-4 h-4" />
                 </button>
               </div>

               {cls ? (
                 <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center gap-4">
                    {cls.images?.[0] ? (
                      <img src={cls.images[0]} alt="ad" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                        <span className="text-neutral-400 font-black text-xs">IMG</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/classified/${cls.id}`}>
                        <h4 className="font-bold text-sm truncate hover:underline hover:text-indigo-600">{cls.title}</h4>
                      </Link>
                      <p className="text-xs text-neutral-500">Vendedor: {vendor?.display_name || 'Desconocido'}</p>
                    </div>
                    <Link to={`/classified/${cls.id}`} className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </Link>
                 </div>
               ) : (
                 <div className="text-sm text-neutral-500 italic border-l-2 border-red-300 pl-3">
                    El anuncio reportado ya no existe o fue eliminado.
                 </div>
               )}

               {selectedReport?.id === report.id && (
                 <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-2">
                   {report.status === 'pending' && (
                     <>
                        <button onClick={() => handleUpdateStatus(report.id, 'dismissed')} className="flex flex-col items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-xl transition-colors text-xs font-bold">
                          <CheckCircle className="w-4 h-4" />
                          Descartar
                        </button>
                        <button onClick={() => handleDeactivateAd(report.classified_id, report.id)} disabled={!cls} className="flex flex-col items-center gap-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 rounded-xl transition-colors text-xs font-bold disabled:opacity-50">
                          <EyeOff className="w-4 h-4" />
                          Ocultar Anuncio
                        </button>
                        <button onClick={() => handleDeleteAd(report.classified_id, report.id)} disabled={!cls} className="flex flex-col items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 rounded-xl transition-colors text-xs font-bold disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                          Eliminar Anuncio
                        </button>
                        <button onClick={() => handleSuspendUser(cls?.vendor_id || '', report.id)} disabled={!cls} className="flex flex-col items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl transition-colors text-xs font-bold disabled:opacity-50">
                          <Ban className="w-4 h-4" />
                          Suspender Cta.
                        </button>
                     </>
                   )}
                   {report.status !== 'pending' && (
                     <button onClick={() => handleUpdateStatus(report.id, 'pending')} className="col-span-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm rounded-xl">
                       Reabrir reporte
                     </button>
                   )}
                 </div>
               )}
            </div>
          )
        })}
        
        {reports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
             <Shield className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
             <p className="text-neutral-500 font-medium">¡No hay reportes pendientes!</p>
          </div>
        )}
      </div>
    </div>
  )
}
