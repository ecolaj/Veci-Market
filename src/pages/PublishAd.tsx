import React, { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '../store';
import { Plus, Trash2, Edit2, Store, X, ArrowLeft } from 'lucide-react';
import { Classified, PaymentMethod } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../lib/services';

const AVAILABLE_PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'tarjeta', label: 'Tarjeta' },
  { id: 'transferencia', label: 'Transferencia' }
];

export default function PublishAd() {
  const { user } = useAuthStore();
  const { categories, classifieds } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{title: string, description: string, price: string, category_id: string, image_url: string, images: string[], payment_methods: PaymentMethod[]}>({ title: '', description: '', price: '', category_id: categories[0]?.id || '', image_url: '', images: [], payment_methods: ['efectivo'] });

  useEffect(() => {
    if (editingId) {
      const item = classifieds.find(c => c.id === editingId);
      if (item && item.vendor_id === user?.id) {
        setFormData({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category_id: item.category_id,
          image_url: item.image_url || '',
          images: item.images || (item.image_url ? [item.image_url] : []),
          payment_methods: item.payment_methods || ['efectivo']
        });
      }
    }
  }, [editingId, classifieds, user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - formData.images.length;
    
    if (files.length > remainingSlots) {
      alert(`Solo puedes subir hasta 5 imágenes. Quedan ${remainingSlots} espacios disponibles.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const img = new Image();
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 800; // Larger for ads
             const MAX_HEIGHT = 800;
             let width = img.width;
             let height = img.height;
             
             if (width > height) {
               if (width > MAX_WIDTH) {
                 height *= MAX_WIDTH / width;
                 width = MAX_WIDTH;
               }
             } else {
               if (height > MAX_HEIGHT) {
                 width *= MAX_HEIGHT / height;
                 height = MAX_HEIGHT;
               }
             }
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, width, height);
             const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
             
             setFormData(prev => ({
               ...prev,
               images: [...prev.images, compressedBase64]
             }));
          };
          img.src = event.target.result as string;
        }
      };
       reader.readAsDataURL(file as File);
    });
    
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method) 
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (editingId) {
      await services.updateClassified(editingId, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.images[0] || formData.image_url,
        images: formData.images,
        payment_methods: formData.payment_methods
      });
    } else {
      await services.addClassified({
        vendor_id: user.id,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.images[0] || formData.image_url,
        images: formData.images,
        payment_methods: formData.payment_methods,
        status: 'active'
      });
    }
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 h-16 flex items-center gap-4 pt-safe box-content">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-600" />
        </button>
        <h1 className="font-black text-xl text-neutral-800 flex-1">
          {editingId ? 'Editar Anuncio' : 'Publicar Anuncio'}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">Título de tu anuncio</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium" placeholder="Ej: Empanadas de carne, Servicios de plomería..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">Descripción</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium resize-none" placeholder="Describe los detalles..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-600 mb-2">Precio (Q)</label>
              <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-600 mb-2">Categoría</label>
              <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium cursor-pointer">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">Métodos de Pago Aceptados</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_PAYMENT_METHODS.map(method => (
                <label key={method.id} className="flex items-center gap-2 cursor-pointer bg-neutral-50 p-3 rounded-2xl border border-neutral-200 hover:border-emerald-200 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.payment_methods.includes(method.id)}
                    onChange={() => togglePaymentMethod(method.id)}
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-neutral-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">Imágenes (hasta 5)</label>
            <div className="p-6 bg-neutral-50 border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={formData.images.length >= 5}
                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-auto mb-2"
              />
              <p className="text-xs text-neutral-400 font-medium">Formatos recomendados: JPG, PNG. Máximo 5mb por imagen.</p>
            </div>
            
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-6 pb-10">
            <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
              {isSubmitting ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Publicar Anuncio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
