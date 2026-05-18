import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Store, MapPin, ArrowLeft } from 'lucide-react';
import { Classified } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { ContactPhone } from '../components/ContactPhone';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, classifieds, categories } = useAppStore();

  const user = users.find(u => u.id === id);
  const userClassifieds = classifieds.filter(c => c.vendor_id === id && c.status === 'active');

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-black text-neutral-800">Usuario no encontrado</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-bold hover:underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* User Info */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100 flex flex-col md:flex-row items-center md:items-start gap-6">
         {user.avatar_url ? (
           <img src={user.avatar_url} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-emerald-50 object-cover shrink-0" referrerPolicy="no-referrer" />
         ) : (
           <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-4xl shrink-0">
              {user.display_name?.charAt(0).toUpperCase()}
           </div>
         )}
         <div className="text-center md:text-left flex-1">
           <h1 className="text-3xl font-black text-neutral-800 mb-2">{user.display_name}</h1>
           <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-500 mb-2">
             <MapPin className="w-4 h-4" />
             <span className="font-medium">{user.sector}</span>
           </div>
           
           {user.phone && (
             <div className="flex items-center justify-center md:justify-start mb-4">
               <ContactPhone phone={user.phone} />
             </div>
           )}
           
           <div className="flex items-center justify-center md:justify-start gap-6">
             <div className="text-center">
               <div className="text-2xl font-black text-emerald-600">{userClassifieds.length}</div>
               <div className="text-xs uppercase font-bold text-neutral-400">Anuncios Activos</div>
             </div>
           </div>
         </div>
      </div>

      <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
        <Store className="w-6 h-6 text-emerald-500" />
        Anuncios de {user.display_name}
      </h2>

      {userClassifieds.length === 0 ? (
        <div className="bg-white rounded-[32px] p-10 text-center border border-neutral-100 shadow-sm">
          <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">Este usuario no tiene anuncios publicados en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {userClassifieds.map(item => {
            const category = categories.find(c => c.id === item.category_id);
            return (
              <Link 
                key={item.id} 
                to={`/classified/${item.id}`}
                className="group flex flex-col bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-5 shadow-sm border border-neutral-100 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <div className="relative h-32 sm:h-44 bg-neutral-100 rounded-[16px] sm:rounded-2xl mb-3 sm:mb-4 overflow-hidden">
                   <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black text-emerald-600 shadow-sm z-10">{formatPrice(item.price)}</div>
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
                  
                  <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2 flex-1">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
