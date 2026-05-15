import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, useAuthStore } from '../store';
import { services } from '../lib/services';
import { Store, User, Phone, MapPin, ArrowLeft, CheckCircle2, CreditCard, Banknote, Landmark, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaymentMethod } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function ClassifiedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classifieds, categories, users, reviews } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [notes, setNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const item = classifieds.find(c => c.id === id);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!viewerOpen || !item?.images) return;
    if (e.key === 'Escape') setViewerOpen(false);
    if (e.key === 'ArrowRight') setCurrentImageIndex(prev => (prev + 1) % item.images!.length);
    if (e.key === 'ArrowLeft') setCurrentImageIndex(prev => (prev - 1 + item.images!.length) % item.images!.length);
  }, [viewerOpen, item]);

  useEffect(() => {
    window.scrollTo(0, 0);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!item) {
    return <div className="text-center py-20 text-neutral-500">Clasificado no encontrado</div>;
  }

  const vendor = users.find(u => u.id === item.vendor_id);
  const category = categories.find(c => c.id === item.category_id);
  const itemReviews = reviews.filter(r => r.classified_id === item.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    await services.placeOrder({
      classified_id: item.id,
      buyer_id: user.id,
      vendor_id: item.vendor_id,
      delivery_address: `${user.sector} - Casa/Apto: ${user.house_number || 'N/A'}`,
      notes: notes,
    });
    
    setOrderSuccess(true);
    setIsOrdering(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || reviewRating === 0) return;
    
    await services.addReview({
      classified_id: item.id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment,
    });
    
    setReviewComment('');
    setReviewRating(0);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !reportReason) return;
    
    setIsReporting(true);
    await services.addReport({
      classified_id: item.id,
      reporter_id: user.id,
      reason: reportReason,
    });
    
    setIsReporting(false);
    setShowReportModal(false);
    alert("Reporte enviado a los administradores. ¡Gracias por ayudar a mantener segura la comunidad!");
  };

  const renderPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'efectivo': return <Banknote className="w-4 h-4" />;
      case 'tarjeta': return <CreditCard className="w-4 h-4" />;
      case 'transferencia': return <Landmark className="w-4 h-4" />;
    }
  };

  const openViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.images) setCurrentImageIndex(prev => (prev + 1) % item.images!.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.images) setCurrentImageIndex(prev => (prev - 1 + item.images!.length) % item.images!.length);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
            {item.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                onClick={() => openViewer(idx)}
                alt={`${item.title} - imagen ${idx + 1}`} 
                className="w-full h-64 sm:h-96 object-cover bg-neutral-100 flex-shrink-0 snap-center cursor-pointer hover:opacity-95 transition-opacity" 
                referrerPolicy="no-referrer" 
              />
            ))}
          </div>
        ) : item.image_url ? (
          <img onClick={() => openViewer(0)} src={item.image_url} alt={item.title} className="w-full h-64 sm:h-96 object-cover bg-neutral-100 cursor-pointer hover:opacity-95 transition-opacity" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-64 sm:h-96 bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Store className="w-16 h-16" />
          </div>
        )}
        
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              {category && (
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider mb-3 ${category.color}`}>
                  {category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-black text-neutral-800">{item.title}</h1>
              <p className="text-sm text-neutral-500 mt-2 font-medium">
                Publicado hace {formatDistanceToNow(new Date(item.created_at), { locale: es })}
              </p>
            </div>
            <div className="text-3xl font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">{formatPrice(item.price)}</div>
          </div>

          <div className="prose prose-neutral max-w-none text-neutral-600 mb-8">
            <p className="whitespace-pre-wrap">{item.description}</p>
          </div>

          {item.payment_methods && item.payment_methods.length > 0 && (
            <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Métodos de Pago Aceptados</h3>
              <div className="flex flex-wrap gap-2">
                {item.payment_methods.map(method => (
                  <div key={method} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 capitalize shadow-sm">
                    {renderPaymentIcon(method)} {method}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row gap-6">
            {/* Vendor Info */}
            <div className="flex-1 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Acerca del Vendedor</h3>
              <div 
                className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-neutral-100 p-2 -mx-2 rounded-lg transition-colors"
                onClick={() => navigate(`/user/${vendor?.id}`)}
              >
                 {vendor?.avatar_url ? (
                   <img src={vendor.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border border-neutral-200 object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {vendor?.display_name?.charAt(0).toUpperCase()}
                   </div>
                 )}
                 <div>
                   <p className="font-bold text-neutral-800 group-hover:text-emerald-600">{vendor?.display_name}</p>
                   <p className="text-xs text-neutral-500 flex items-center gap-1">
                     <MapPin className="w-3 h-3" /> {vendor?.sector}
                   </p>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-1 flex flex-col justify-center">
               {orderSuccess ? (
                 <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                   <CheckCircle2 className="w-6 h-6 shrink-0" />
                   <div>
                     <p className="font-bold">¡Pedido realizado con éxito!</p>
                     <p className="text-sm opacity-90">El vendedor ha sido notificado.</p>
                   </div>
                 </div>
               ) : !isOrdering ? (
                 <button 
                  onClick={() => isAuthenticated ? setIsOrdering(true) : setShowAuthModal(true)}
                  className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                 >
                   Realizar Pedido
                 </button>
               ) : (
                 <form onSubmit={handleOrder} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <h4 className="font-bold mb-3">Confirma tu pedido</h4>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Notas/Observaciones</label>
                      <textarea 
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Ej. Entregar después de las 8 pm, pago exacto..."
                        className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsOrdering(false)} className="flex-1 py-2 text-sm font-medium text-neutral-600 bg-neutral-200 rounded-lg hover:bg-neutral-300">
                        Cancelar
                      </button>
                      <button type="submit" className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                        Confirmar
                      </button>
                    </div>
                 </form>
               )}
               {/* Report button */}
               <button 
                  onClick={() => isAuthenticated ? setShowReportModal(true) : setShowAuthModal(true)}
                  className="mt-4 text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors mx-auto block"
               >
                 Reportar Anuncio
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-6 sm:p-10 mt-6">
        <h2 className="text-2xl font-black text-neutral-800 mb-6">Reseñas y Opiniones</h2>
        
        {isAuthenticated && user && (
          <form onSubmit={handleReviewSubmit} className="mb-8 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
            <h3 className="font-bold text-neutral-800 mb-3">Deja tu opinión</h3>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={cn("w-6 h-6", star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="¿Qué te pareció este producto/servicio?"
              className="w-full p-3 border border-neutral-300 rounded-xl text-sm mb-3 outline-none focus:border-emerald-500"
              required
              rows={3}
            />
            <button 
              type="submit" 
              disabled={reviewRating === 0}
              className="bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar Reseña
            </button>
          </form>
        )}

        <div className="space-y-6">
          {itemReviews.length === 0 ? (
            <p className="text-neutral-500 text-center py-6">Aún no hay reseñas para este anuncio. ¡Sé el primero en opinar!</p>
          ) : (
            itemReviews.map(review => {
              const reviewUser = users.find(u => u.id === review.user_id);
              return (
                <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                       {reviewUser?.avatar_url ? (
                         <img src={reviewUser.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                       ) : (
                         <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs">
                           {reviewUser?.display_name?.charAt(0).toUpperCase() || 'U'}
                         </div>
                       )}
                       {reviewUser?.display_name || 'Usuario'}
                    </div>
                    <span className="text-xs text-neutral-400">
                      hace {formatDistanceToNow(new Date(review.created_at), { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600">{review.comment}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Image Viewer Fullscreen Modal */}
      {viewerOpen && item.images && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewerOpen(false)}>
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-md transition-colors"
            onClick={(e) => { e.stopPropagation(); setViewerOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>

          {item.images.length > 1 && (
            <>
              <button 
                className="absolute left-4 sm:left-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-md transition-colors"
                onClick={prevImage}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                className="absolute right-4 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-md transition-colors"
                onClick={nextImage}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="w-full max-w-5xl px-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img 
              src={item.images[currentImageIndex]} 
              alt={`${item.title} - imagen completa`} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
              referrerPolicy="no-referrer"
            />
            {item.images.length > 1 && (
              <div className="text-white/60 font-medium text-sm mt-4 tracking-widest">
                {currentImageIndex + 1} / {item.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-500">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-neutral-800 mb-2">
                ¡Hola vecino!
              </h3>
              <p className="text-neutral-500 font-medium mb-6">
                Para realizar un pedido o conectar con los vendedores, te invitamos a iniciar sesión o crear una cuenta gratuita. ¡Así mantenemos una comunidad segura!
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 px-4 font-black text-white rounded-2xl shadow-md transition-transform hover:scale-[1.02] bg-emerald-500 hover:bg-emerald-600"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-colors"
                >
                  Continuar explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-black text-neutral-800 mb-2">
                Reportar Anuncio
              </h3>
              <p className="text-neutral-500 font-medium mb-6 text-sm">
                ¿Encontraste algo incorrecto, ofensivo o engañoso? Nuestro equipo revisará este anuncio.
              </p>
              
              <form onSubmit={handleReport} className="text-left space-y-4">
                <div>
                   <label className="block text-sm font-bold text-neutral-700 mb-2">Motivo del reporte</label>
                   <select 
                     value={reportReason}
                     onChange={e => setReportReason(e.target.value)}
                     className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium text-sm"
                     required
                   >
                     <option value="">Selecciona una opción</option>
                     <option value="fraude">Posible estafa / Perfil falso</option>
                     <option value="ofensivo">Contenido ofensivo o inapropiado</option>
                     <option value="spam">Spam / Publicación duplicada</option>
                     <option value="otro">Otro</option>
                   </select>
                </div>
                
                <button 
                  type="submit"
                  disabled={isReporting || !reportReason}
                  className="w-full mt-4 bg-red-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isReporting ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
