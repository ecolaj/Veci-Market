import { useState } from 'react';
import { useAppStore, useAuthStore } from '../../store';
import { Plus, Trash2, Edit2, Store, X, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Classified } from '../../types';
import { useNavigate } from 'react-router-dom';
import { services } from '../../lib/services';
import { formatPrice } from '../../lib/utils';

export default function MyClassifieds() {
  const { user } = useAuthStore();
  const { classifieds } = useAppStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'delete'; id?: string; data?: any } | null>(null);

  if (!user) return null;

  const myClassifieds = classifieds.filter(c => c.vendor_id === user.id);

  const confirmAction = async () => {
    if (!confirmModal) return;
    
    setIsSubmitting(true);
    if (confirmModal.type === 'delete' && confirmModal.id) {
      await services.deleteClassified(confirmModal.id);
    }
    setIsSubmitting(false);
    setConfirmModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-neutral-800">Mis Anuncios</h1>
        <button 
          onClick={() => navigate('/publish')}
          className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-center gap-2 rounded-xl font-bold shadow-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5"/> Nuevo Anuncio
        </button>
      </div>

      {myClassifieds.length === 0 ? (
         <div className="text-center py-16 bg-white rounded-[32px] border border-neutral-100 shadow-sm">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-bold">Aún no tienes anuncios publicados.</p>
            <button onClick={() => navigate('/publish')} className="mt-4 text-emerald-600 font-bold hover:underline">¡Publica tu primero anuncio!</button>
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {myClassifieds.map(item => (
            <div key={item.id} className="bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-5 shadow-sm border border-neutral-100 flex flex-col hover:border-emerald-200 transition-colors">
              <div className="relative h-32 sm:h-40 bg-neutral-100 rounded-[16px] sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden">
                {(item.images?.[0] || item.image_url) ? (
                  <img src={item.images?.[0] || item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300"><Store className="w-10 h-10" /></div>
                )}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black text-emerald-600 shadow-sm z-10">{formatPrice(item.price)}</div>
              </div>
              <h3 className="font-black text-sm sm:text-lg leading-tight line-clamp-2 sm:line-clamp-1 mb-1 text-neutral-800">{item.title}</h3>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase mb-3 sm:mb-4 flex-1">
                {formatDistanceToNow(new Date(item.created_at), {locale: es})}
              </p>
              <div className="flex gap-2 pt-2 sm:pt-3 border-t border-neutral-50 flex-col sm:flex-row">
                <button 
                  onClick={() => navigate(`/publish?edit=${item.id}`)}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-bold text-[10px] sm:text-xs flex items-center justify-center sm:justify-start gap-1 border border-neutral-100 hover:border-emerald-200"
                  title="Editar"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button 
                  onClick={() => setConfirmModal({ isOpen: true, type: 'delete', id: item.id })}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-[10px] sm:text-xs flex items-center justify-center sm:justify-start gap-1 border border-neutral-100 hover:border-red-200 sm:ml-auto"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-500`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-neutral-800">
                ¿Eliminar Anuncio?
              </h3>
              <p className="text-neutral-500 mt-2 font-medium">
                Si ya vendiste tu producto o no deseas seguir ofreciéndolo, elimínalo. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAction}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 font-black text-white rounded-2xl shadow-md transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600 disabled:opacity-50`}
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

