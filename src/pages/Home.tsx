import { useMemo } from 'react';
import { Utensils, ShoppingBag, Wrench, Shirt, Store, Star } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { useAppStore, useAuthStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const iconMap: Record<string, any> = {
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  wrench: Wrench,
  shirt: Shirt,
};

export default function Home() {
  const { categories, classifieds, users, reviews } = useAppStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const getAverageRating = (classifiedId: string) => {
    const itemReviews = reviews.filter(r => r.classified_id === classifiedId);
    if (itemReviews.length === 0) return 0;
    const sum = itemReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / itemReviews.length;
  };

  // Recommended feed based on both random mix AND top rated
  const recommendedClassifieds = useMemo(() => {
    const active = classifieds.filter(c => c.status === 'active');
    
    // Sort logic gives precedence to items with higher rating, but introduces randomness
    return active.sort((a, b) => {
      const scoreA = (getAverageRating(a.id) * 0.4) + (Math.random() * 5 * 0.6);
      const scoreB = (getAverageRating(b.id) * 0.4) + (Math.random() * 5 * 0.6);
      return scoreB - scoreA;
    }).slice(0, 5);
  }, [classifieds, reviews]);

  return (
    <div className="space-y-8">
      {/* Categories */}
      <section>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-neutral-800">
          <Store className="w-5 h-5 text-neutral-400" />
          Categorías
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon_name] || Store;
            return (
              <Link 
                key={cat.id} 
                to={`/search?category=${cat.id}`}
                className={cn(
                  "flex flex-col items-center justify-center p-3 sm:p-6 rounded-[20px] transition-transform hover:scale-105 active:scale-95 shadow-sm border border-neutral-50 text-center",
                  cat.color
                )}
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                <span className="font-bold text-[10px] sm:text-sm tracking-wide leading-tight">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recommended Classifieds */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-neutral-800">Descubre <span className="text-neutral-300 font-normal ml-2 hidden sm:inline">• Sugerencias</span></h2>
          <Link to="/search" className="bg-white px-4 py-2 rounded-xl text-sm font-bold border border-neutral-100 shadow-sm hover:border-neutral-200 transition-colors text-neutral-600">Ver todo</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedClassifieds.map(item => {
            const vendor = users.find(u => u.id === item.vendor_id);
            const category = categories.find(c => c.id === item.category_id);
            const rating = getAverageRating(item.id);
            const reviewCount = reviews.filter(r => r.classified_id === item.id).length;
            
            return (
              <Link 
                key={item.id} 
                to={`/classified/${item.id}`}
                className="group flex flex-col bg-white rounded-[32px] p-5 shadow-sm border border-neutral-100 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <div className="relative h-44 bg-neutral-100 rounded-2xl mb-4 overflow-hidden">
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-emerald-600 shadow-sm z-10">{formatPrice(item.price)}</div>
                  {(item.images?.[0] || item.image_url) ? (
                    <img 
                      src={item.images?.[0] || item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <Store className="w-12 h-12" />
                    </div>
                  )}
                  {category && (
                    <span className={cn("absolute bottom-3 left-3 px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider z-10", category.color)}>
                      {category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-neutral-800 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase mt-1 shrink-0 ml-2">
                      {formatDistanceToNow(new Date(item.created_at), { locale: es })}
                    </span>
                  </div>
                  
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-4 flex-1">
                    {item.description}
                  </p>
                  
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm">{rating.toFixed(1)}</span>
                      <span className="text-neutral-400 text-sm">({reviewCount})</span>
                    </div>
                  )}
                  
                  <div 
                    className="flex items-center gap-3 pt-4 border-t border-neutral-50"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/user/${vendor?.id}`);
                    }}
                  >
                     {vendor?.avatar_url ? (
                        <img src={vendor.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-200 object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {vendor?.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800 hover:text-emerald-600 transition-colors cursor-pointer">{vendor?.display_name}</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate max-w-[150px]">{vendor?.sector}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  );
}
