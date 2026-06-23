import { useState } from 'react';
import { useAppStore, useAuthStore } from '../../store';
import { TrendingUp, Users, Package, Award, XCircle, ChevronDown } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Stats() {
  const { user } = useAuthStore();
  const { orders, classifieds, users } = useAppStore();
  const [showChart, setShowChart] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');

  if (!user) return null;

  // Filter valid delivered/cancelled orders for this vendor
  const myOrders = orders.filter(o => o.vendor_id === user.id);
  const myDeliveredOrders = myOrders.filter(o => o.status === 'delivered');
  const myCancelledOrders = myOrders.filter(o => o.status === 'cancelled');

  // Dynamic Year choices based on vendor orders
  const years = Array.from(new Set(myOrders.map(o => {
    try {
      return new Date(o.created_at).getFullYear();
    } catch {
      return null;
    }
  }).filter((y): y is number => y !== null))).sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  const yearOptions = years.length > 0 ? years : [currentYear];

  const months = [
    { value: '0', label: 'Enero' },
    { value: '1', label: 'Febrero' },
    { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Mayo' },
    { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' },
    { value: '10', label: 'Noviembre' },
    { value: '11', label: 'Diciembre' },
  ];

  // Apply Filters to delivered/cancelled orders
  const filteredDeliveredOrders = myDeliveredOrders.filter(order => {
    const d = new Date(order.created_at);
    if (selectedYear !== 'todos' && String(d.getFullYear()) !== selectedYear) return false;
    if (selectedMonth !== 'todos' && String(d.getMonth()) !== selectedMonth) return false;
    return true;
  });

  const filteredCancelledOrders = myCancelledOrders.filter(order => {
    const d = new Date(order.created_at);
    if (selectedYear !== 'todos' && String(d.getFullYear()) !== selectedYear) return false;
    if (selectedMonth !== 'todos' && String(d.getMonth()) !== selectedMonth) return false;
    return true;
  });

  // Calculate Total Sales for filtered period
  const totalSales = filteredDeliveredOrders.reduce((sum, order) => {
    const item = classifieds.find(c => c.id === order.classified_id);
    return sum + (order.item_snapshot?.price ?? item?.price ?? 0);
  }, 0);

  // Calculate Top Customers for filtered period
  const customerCounts = filteredDeliveredOrders.reduce((acc, order) => {
    acc[order.buyer_id] = (acc[order.buyer_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCustomers = Object.entries(customerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([id, count]) => {
      const u = users.find(u => u.id === id);
      return {
        id,
        display_name: u?.display_name || 'Usuario Desconocido',
        avatar_url: u?.avatar_url || '',
        count
      };
    });

  // Calculate Most Sold Product for filtered period
  const productCounts = filteredDeliveredOrders.reduce((acc, order) => {
    acc[order.classified_id] = (acc[order.classified_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedProducts = Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([id, count]) => {
      let item: any = classifieds.find(c => c.id === id);
      if (!item) {
        const snapshot = filteredDeliveredOrders.find(o => o.classified_id === id)?.item_snapshot;
        item = {
          id,
          title: snapshot?.title || 'Producto Eliminado',
          price: snapshot?.price || 0,
          image_url: snapshot?.image_url || undefined,
        };
      }
      return { item, count };
    });

  // Chart Data: dynamic grouping based on whether a single month is filtered
  const isMonthFiltered = selectedMonth !== 'todos';

  const chartDataMapWithKeys = filteredDeliveredOrders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    let sortKey = '';
    let displayName = '';
    
    if (isMonthFiltered) {
      // Group by day of the month
      const day = date.getDate();
      sortKey = String(day).padStart(2, '0');
      displayName = `Día ${day}`;
    } else {
      // Group by month
      sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '');
      displayName = displayMonth.charAt(0).toUpperCase() + displayMonth.slice(1);
    }
    
    if (!acc[sortKey]) {
      acc[sortKey] = { name: displayName, total: 0, sortKey };
    }
    const item = classifieds.find(c => c.id === order.classified_id);
    acc[sortKey].total += (order.item_snapshot?.price ?? item?.price ?? 0);
    return acc;
  }, {} as Record<string, { name: string, total: number, sortKey: string }>);

  const chartData = Object.values(chartDataMapWithKeys).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const formatChartCurrency = (value: number) => {
    return `Q. ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `Q. ${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1000) {
      return `Q. ${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return `Q. ${value}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-black text-neutral-800">Mis Estadísticas</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 text-neutral-700 font-semibold px-4 py-2 pr-10 rounded-2xl shadow-sm hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
            >
              <option value="todos">Todos los años</option>
              {yearOptions.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 text-neutral-700 font-semibold px-4 py-2 pr-10 rounded-2xl shadow-sm hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
            >
              <option value="todos">Todos los meses</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Total Sales */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setShowChart(!showChart)}
            className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-md flex flex-col justify-between h-40 relative overflow-hidden text-left transition-transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            <div className="flex justify-between items-start relative z-10 w-full">
              <span className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Ventas Totales</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 opacity-80" />
                <ChevronDown className={`w-4 h-4 opacity-80 transition-transform duration-300 ${showChart ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <p className="text-4xl font-black relative z-10 truncate w-full">{formatPrice(totalSales)}</p>
            <div className="absolute -right-8 -bottom-8 text-6xl opacity-20 transform -rotate-12 pointer-events-none text-emerald-200 group-hover:scale-110 transition-transform duration-500 delay-75">📈</div>
          </button>

          <div className={`overflow-hidden transition-all duration-700 ease-in-out ${showChart ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white p-5 sm:p-6 rounded-[32px] border border-neutral-100 shadow-sm h-[320px]">
              <h3 className="font-bold text-neutral-800 mb-4 sm:mb-6 text-sm sm:text-base">Progresión de Ventas</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#A3A3A3', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#A3A3A3', fontSize: 11, fontWeight: 600 }}
                      tickFormatter={formatYAxisTick}
                      width={65}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                      formatter={(value: number) => [formatChartCurrency(value), '']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10B981" 
                      strokeWidth={4}
                      dot={{ r: 5, fill: '#10B981', stroke: '#ffffff', strokeWidth: 3 }}
                      activeDot={{ r: 7, fill: '#059669', stroke: '#ffffff', strokeWidth: 3 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-neutral-400 font-medium text-sm text-center">
                  No hay datos para mostrar en este periodo
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="font-bold text-neutral-400 uppercase tracking-wider text-xs">Pedidos Completados</span>
            <Package className="w-5 h-5 text-neutral-300" />
          </div>
          <p className="text-4xl font-black text-neutral-800">{filteredDeliveredOrders.length}</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="font-bold text-red-400 uppercase tracking-wider text-xs">Pedidos Rechazados</span>
            <XCircle className="w-5 h-5 text-red-200" />
          </div>
          <p className="text-4xl font-black text-neutral-800">{filteredCancelledOrders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <h2 className="font-black flex items-center gap-2 mb-6 text-neutral-800">
            <Award className="w-5 h-5 text-amber-500" />
            Ranking de Productos
          </h2>
          {sortedProducts.length > 0 ? (
            <div className="space-y-4">
              {sortedProducts.map((p, i) => (
                <div key={p.item!.id} className="flex gap-4 items-center bg-neutral-50 rounded-2xl p-3">
                   <div className="w-8 flex-shrink-0 flex items-center justify-center font-black text-lg text-neutral-400">
                     #{i + 1}
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-neutral-200 overflow-hidden shrink-0">
                     {(p.item!.images?.[0] || p.item!.image_url) && <img src={p.item!.images?.[0] || p.item!.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-800 truncate">{p.item!.title}</p>
                      <p className="text-sm text-neutral-500 font-medium">{p.count} unidad{p.count !== 1 ? 'es' : ''} vendida{p.count !== 1 ? 's' : ''}</p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm font-medium">Aún no hay suficientes datos.</p>
          )}
        </div>

        {/* Top 10 Customers */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <h2 className="font-black flex items-center gap-2 mb-6 text-neutral-800">
            <Users className="w-5 h-5 text-blue-500" />
            Top 10 Mejores Clientes
          </h2>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={c.id} className="flex justify-between items-center bg-neutral-50 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-neutral-400 w-5 hidden sm:inline-block">#{i + 1}</span>
                    {c.avatar_url ? (
                       <img src={c.avatar_url} alt={c.display_name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white relative overflow-hidden">
                        {c.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-neutral-800 text-sm leading-tight">{c.display_name}</p>
                      <p className="text-xs text-neutral-500 sm:hidden">Rank #{i + 1}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-xl shadow-sm text-neutral-700 whitespace-nowrap">{c.count} pedido{c.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm font-medium">Aún no hay suficientes datos.</p>
          )}
        </div>
      </div>
    </div>
  )
}
