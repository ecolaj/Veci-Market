import { useState } from 'react';
import { useAppStore, useAuthStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, X, Truck, Package, PackageCheck, AlertTriangle } from 'lucide-react';
import { cn, formatPrice } from '../../lib/utils';
import { services } from '../../lib/services';

export default function Inbox() {
  const { user } = useAuthStore();
  const { orders, classifieds, users } = useAppStore();

  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; orderId: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const vendorOrders = orders.filter(o => o.vendor_id === user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const buyerOrders = orders.filter(o => o.buyer_id === user.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayedOrders = activeTab === 'sales' ? vendorOrders : buyerOrders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Package className="w-3 h-3" /> Pendiente</span>;
      case 'accepted': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Truck className="w-3 h-3" /> En Camino</span>;
      case 'delivered': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><PackageCheck className="w-3 h-3" /> Entregado</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><X className="w-3 h-3" /> Cancelado</span>;
      default: return null;
    }
  }

  const handleReject = async () => {
    if (rejectModal && cancelReason.trim()) {
      setIsUpdating(true);
      await services.updateOrderStatus(rejectModal.orderId, 'cancelled', cancelReason.trim());
      setIsUpdating(false);
      setRejectModal(null);
      setCancelReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-neutral-800">Bandeja de Pedidos</h1>
        
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('sales')}
            className={cn("flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'sales' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
          >
            Ventas ({vendorOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={cn("flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'purchases' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
          >
            Compras ({buyerOrders.length})
          </button>
        </div>
      </div>
      
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-neutral-500 font-bold">No tienes pedidos en esta sección.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map(order => {
            const classified = classifieds.find(c => c.id === order.classified_id);
            const otherUser = users.find(u => u.id === (activeTab === 'sales' ? order.buyer_id : order.vendor_id));
            
            return (
              <div key={order.id} className={cn(
                "bg-white p-6 rounded-[32px] border shadow-sm transition-colors",
                order.status === 'pending' && activeTab === 'sales' ? 'border-orange-200 bg-orange-50/30' : 'border-neutral-100'
              )}>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                       {getStatusBadge(order.status)}
                       <span className="text-xs text-neutral-400 font-bold uppercase">
                         hace {formatDistanceToNow(new Date(order.created_at), { locale: es })}
                       </span>
                    </div>
                    <h3 className="font-black text-xl text-neutral-800">{classified?.title || 'Producto Eliminado'}</h3>
                    <p className="text-emerald-500 font-black text-lg bg-emerald-50 mt-2 px-3 py-1 inline-block rounded-lg shadow-sm border border-emerald-100">{classified ? formatPrice(classified.price) : ''}</p>
                  </div>
                  
                  {activeTab === 'sales' && order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => setRejectModal({ isOpen: true, orderId: order.id })} disabled={isUpdating} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100 shadow-sm disabled:opacity-50">
                        <X className="w-4 h-4" /> Rechazar
                      </button>
                      <button onClick={async () => { setIsUpdating(true); await services.updateOrderStatus(order.id, 'accepted'); setIsUpdating(false); }} disabled={isUpdating} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm transition-transform disabled:opacity-50 hover:scale-[1.02]">
                        <Check className="w-4 h-4" /> Aceptar
                      </button>
                    </div>
                  )}
                  {activeTab === 'sales' && order.status === 'accepted' && (
                    <div>
                      <button onClick={async () => { setIsUpdating(true); await services.updateOrderStatus(order.id, 'delivered'); setIsUpdating(false); }} disabled={isUpdating} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                        Marcar como Entregado
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 text-sm">
                  <p className="font-black mb-2 text-neutral-700">Información del {activeTab === 'sales' ? 'Comprador' : 'Vendedor'}</p>
                  <p><span className="text-neutral-400 font-bold">Nombre:</span> <span className="font-medium">{otherUser?.display_name}</span></p>
                  <p><span className="text-neutral-400 font-bold">Contacto:</span> <span className="font-medium">{otherUser?.phone || otherUser?.email}</span></p>
                  {activeTab === 'sales' && (
                    <p><span className="text-neutral-400 font-bold">Entrega en:</span> <span className="font-medium">{order.delivery_address}</span></p>
                  )}
                  
                  {order.status === 'cancelled' && order.cancel_reason && (
                    <div className="mt-3 p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
                      <p className="font-bold text-xs uppercase tracking-wider text-red-600 mb-1">Motivo del rechazo:</p>
                      <p className="font-medium">{order.cancel_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Rechazo */}
      {rejectModal && rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setRejectModal(null); setCancelReason(''); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-neutral-800">
                Rechazar Pedido
              </h3>
              <p className="text-neutral-500 mt-2 font-medium">
                Por favor indica al comprador el motivo por el cual rechazas este pedido.
              </p>
            </div>
            
            <textarea 
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Ej. No tengo stock en este momento..."
              className="w-full p-4 mb-4 bg-neutral-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium resize-none shadow-inner"
              rows={3}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setRejectModal(null); setCancelReason(''); }}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject}
                disabled={!cancelReason.trim()}
                className="flex-1 py-3 px-4 font-black text-white rounded-2xl shadow-md transition-transform hover:scale-[1.02] bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
