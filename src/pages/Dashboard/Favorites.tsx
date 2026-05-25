import { useAppStore, useAuthStore } from '../../store';
import { Heart, Store, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatPrice } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { services } from '../../lib/services';

export default function Favorites() {
  const { user } = useAuthStore();
  const { classifieds, categories, users, reviews } = useAppStore();

  const getAverageRating = (classifiedId: string) => {
    const itemReviews = reviews.filter(r => r.classified_id === classifiedId);
    if (itemReviews.length === 0) return 0;
    const sum = itemReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / itemReviews.length;
  };

  const favoriteAds = classifieds.filter(c => user?.saved_ads?.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shadow-sm">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-800">Mis Favoritos</h1>
          <p className="text-neutral-500 font-medium">Anuncios que has guardado</p>
        </div>
      </div>

      {favoriteAds.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">No tienes favoritos aún</h2>
          <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
            Explora las categorías y guarda los anuncios que más te interesen para verlos más tarde.
          </p>
          <Link to="/search" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
            Explorar Anuncios
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favoriteAds.map(item => {
            const vendor = users.find(u => u.id === item.vendor_id);
            const category = categories.find(c => c.id === item.category_id);
            const rating = getAverageRating(item.id);
            const reviewCount = reviews.filter(r => r.classified_id === item.id).length;
            const isSaved = true;

            return (
              <Link 
                key={item.id} 
                to={`/classified/${item.id}`}
                className="group flex flex-col bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 shadow-sm border border-neutral-100 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <div className="relative h-36 sm:h-44 bg-neutral-100 rounded-[16px] sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden">
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-emerald-600 shadow-sm z-10">{formatPrice(item.price)}</div>
                   {user && (
                     <button
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         services.toggleFavorite(user.id, item.id, isSaved);
                       }}
                       className={cn(
                         "absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm shadow-sm transition-colors z-10 hover:scale-105 active:scale-95",
                         isSaved ? "bg-red-50 text-red-500" : "bg-white/80 text-neutral-400 hover:bg-white"
                       )}
                     >
                       <Heart className={cn("w-5 h-5 transition-transform duration-300", isSaved && "fill-current scale-110")} />
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
                  <div className="flex justify-between items-start justify-between mb-2">
                    <h4 className="font-black text-lg text-neutral-800 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-2 pr-2">
                      {item.title}
                    </h4>
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
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-50 mt-auto">
                     {vendor?.avatar_url ? (
                        <img src={vendor.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-200 object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {vendor?.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800 truncate">{vendor?.display_name}</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate">{vendor?.sector}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
