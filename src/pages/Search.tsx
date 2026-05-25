import { useState, useMemo } from 'react';
import { useAppStore, useAuthStore } from '../store';
import { Search, Store, Star, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn, formatPrice } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { services } from '../lib/services';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const { user } = useAuthStore();
  const { classifieds, categories, users, reviews } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'price_asc' | 'price_desc'>('recent');

  const getAverageRating = (classifiedId: string) => {
    const itemReviews = reviews.filter(r => r.classified_id === classifiedId);
    if (itemReviews.length === 0) return 0;
    const sum = itemReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / itemReviews.length;
  };

  const filteredClassifieds = useMemo(() => {
    let result = classifieds.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? c.category_id === selectedCategory : true;
      return matchesSearch && matchesCategory && c.status === 'active';
    });
    
    result = result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'rating') {
        const ratingA = getAverageRating(a.id);
        const ratingB = getAverageRating(b.id);
        if (ratingA === ratingB) {
           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return ratingB - ratingA;
      } else if (sortBy === 'price_asc') {
        return a.price - b.price;
      } else if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });
    
    return result;
  }, [classifieds, searchTerm, selectedCategory, sortBy, reviews]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="¿Qué buscas hoy en tu comunidad?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-neutral-600 transition-all font-medium"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 shrink-0 overflow-hidden">
          <select 
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSearchParams(e.target.value ? { category: e.target.value } : {});
            }}
            className="py-3 px-2 sm:px-4 bg-neutral-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-neutral-600 font-bold transition-all sm:shrink-0 cursor-pointer text-xs sm:text-base w-full max-w-[50vw]"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-3 px-2 sm:px-4 bg-neutral-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-neutral-600 font-bold transition-all sm:shrink-0 cursor-pointer text-xs sm:text-base w-full max-w-[50vw]"
          >
            <option value="recent">Más recientes</option>
            <option value="rating">Mejor calificados</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-neutral-800 mb-4">
          {filteredClassifieds.length} resultados
        </h2>

        {filteredClassifieds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-neutral-100 shadow-sm">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-bold">No se encontraron resultados para tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredClassifieds.map(item => {
              const vendor = users.find(u => u.id === item.vendor_id);
              const category = categories.find(c => c.id === item.category_id);
              const rating = getAverageRating(item.id);
              const reviewCount = reviews.filter(r => r.classified_id === item.id).length;
              const isSaved = user?.saved_ads?.includes(item.id) || false;
              
              return (
                <Link 
                  key={item.id} 
                  to={`/classified/${item.id}`}
                  className="group flex flex-col bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-5 shadow-sm border border-neutral-100 hover:border-emerald-200 transition-colors cursor-pointer"
                >
                  <div className="relative h-32 sm:h-44 bg-neutral-100 rounded-[16px] sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden">
                     <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black text-emerald-600 shadow-sm z-10">{formatPrice(item.price)}</div>
                     {user && (
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           services.toggleFavorite(user.id, item.id, isSaved);
                         }}
                         className={cn(
                           "absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full backdrop-blur-sm shadow-sm transition-colors z-10 hover:scale-105 active:scale-95",
                           isSaved ? "bg-red-50 text-red-500" : "bg-white/80 text-neutral-400 hover:bg-white"
                         )}
                       >
                         <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300", isSaved && "fill-current scale-110")} />
                       </button>
                     )}
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
                    <div className="flex justify-between items-start mb-1 sm:mb-2 flex-col sm:flex-row">
                      <h4 className="font-black text-sm sm:text-lg text-neutral-800 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold uppercase mt-1 shrink-0 sm:ml-2">
                        {formatDistanceToNow(new Date(item.created_at), { locale: es })}
                      </span>
                    </div>
                    
                    <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4 flex-1">
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
                      className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-neutral-50 mt-auto"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                       {vendor?.avatar_url ? (
                          <img src={vendor.avatar_url} alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-neutral-200 object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] sm:text-xs">
                            {vendor?.display_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      <div className="flex flex-col min-w-0">
                        <Link to={`/user/${vendor?.id}`} className="text-[10px] sm:text-xs font-bold text-neutral-800 hover:text-emerald-600 transition-colors cursor-pointer truncate">{vendor?.display_name}</Link>
                        <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate pb-[1px]">{vendor?.sector}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
