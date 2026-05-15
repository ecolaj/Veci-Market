import { useAppStore, useAuthStore } from '../../store';
import { TrendingUp, Users, Package, Award } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export default function Stats() {
  const { user } = useAuthStore();
  const { orders, classifieds, users } = useAppStore();

  if (!user) return null;

  // Filter valid delivered orders for this vendor
  const myDeliveredOrders = orders.filter(o => o.vendor_id === user.id && o.status === 'delivered');

  // Calculate Total Sales
  const totalSales = myDeliveredOrders.reduce((sum, order) => {
    const item = classifieds.find(c => c.id === order.classified_id);
    return sum + (item?.price || 0);
  }, 0);

  // Calculate Top Customers
  const customerCounts = myDeliveredOrders.reduce((acc, order) => {
    acc[order.buyer_id] = (acc[order.buyer_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCustomers = Object.entries(customerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      ...users.find(u => u.id === id)!,
      count
    }));

  // Calculate Most Sold Product
  const productCounts = myDeliveredOrders.reduce((acc, order) => {
    acc[order.classified_id] = (acc[order.classified_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProductEntry = Object.entries(productCounts).sort(([,a], [,b]) => b - a)[0];
  const topProduct = topProductEntry ? {
    item: classifieds.find(c => c.id === topProductEntry[0]),
    count: topProductEntry[1]
  } : null;


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-neutral-800">Mis Estadísticas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-500 p-8 rounded-[32px] text-white shadow-md flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <span className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Ventas Totales</span>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-4xl font-black relative z-10">{formatPrice(totalSales)}</p>
          <div className="absolute -right-8 -bottom-8 text-6xl opacity-20 transform -rotate-12 pointer-events-none text-emerald-200">📈</div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="font-bold text-neutral-400 uppercase tracking-wider text-xs">Pedidos Completados</span>
            <Package className="w-5 h-5 text-neutral-300" />
          </div>
          <p className="text-4xl font-black text-neutral-800">{myDeliveredOrders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Product */}
        <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <h2 className="font-black flex items-center gap-2 mb-6 text-neutral-800">
            <Award className="w-5 h-5 text-amber-500" />
            Producto Estrella
          </h2>
          {topProduct?.item ? (
            <div className="flex gap-4 items-center">
               <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                 {(topProduct.item.images?.[0] || topProduct.item.image_url) && <img src={topProduct.item.images?.[0] || topProduct.item.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
               </div>
               <div>
                  <p className="font-bold">{topProduct.item.title}</p>
                  <p className="text-sm text-neutral-500">{topProduct.count} unidades vendidas</p>
               </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">Aún no hay suficientes datos.</p>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <h2 className="font-black flex items-center gap-2 mb-6 text-neutral-800">
            <Users className="w-5 h-5 text-blue-500" />
            Mejores Clientes
          </h2>
          {topCustomers.length > 0 ? (
            <div className="space-y-4">
              {topCustomers.map((c, i) => (
                <div key={c.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-400 w-4">{i + 1}.</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {c.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.display_name}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold bg-neutral-100 px-2 py-1 rounded-md">{c.count} pedidos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">Aún no hay suficientes datos.</p>
          )}
        </div>
      </div>
    </div>
  )
}
