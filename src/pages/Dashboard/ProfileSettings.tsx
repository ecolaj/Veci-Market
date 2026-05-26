import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store';
import { User, Phone, MapPin, Edit3 } from 'lucide-react';
import { services } from '../../lib/services';
import { PhoneAlertModal } from '../../components/PhoneAlertModal';

export default function ProfileSettings() {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  if (!user) return null;

  const [formData, setFormData] = useState({
    display_name: user.display_name || '',
    phone: user.phone || '',
    secondary_phone: user.secondary_phone || '',
    sector: user.sector || '',
    house_number: user.house_number || '',
    avatar_url: user.avatar_url || ''
  });

  React.useEffect(() => {
    setFormData(prev => ({
      display_name: user.display_name || prev.display_name,
      phone: user.phone || prev.phone,
      secondary_phone: user.secondary_phone || prev.secondary_phone,
      sector: user.sector || prev.sector,
      house_number: user.house_number || prev.house_number,
      avatar_url: user.avatar_url || prev.avatar_url
    }));
  }, [user.display_name, user.phone, user.secondary_phone, user.sector, user.house_number, user.avatar_url]);

  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((formData.phone && formData.phone.length !== 8) || (formData.secondary_phone && formData.secondary_phone.length !== 8)) {
      setShowPhoneModal(true);
      return;
    }
    
    setLoading(true);
    try {
      await services.updateProfile(user.id, formData);
      updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMsg = parsed.error || err.message;
      } catch (e) {}
      alert('Hubo un error al guardar los cambios: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // Compress the image
          const img = new Image();
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 256;
             const MAX_HEIGHT = 256;
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
               avatar_url: compressedBase64
             }));
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
          <div 
            className="relative w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold shrink-0 overflow-hidden cursor-pointer group shadow-sm border-2 border-emerald-100 hover:border-emerald-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
             {formData.avatar_url ? (
               <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               user.display_name?.charAt(0).toUpperCase()
             )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-6 h-6 text-white" />
             </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div>
            <h2 className="font-bold text-lg">{user.display_name}</h2>
            <p className="text-neutral-500">{user.email}</p>
            <p className="text-xs text-neutral-400 mt-1">Haz clic en la foto para cambiarla</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Nombre Público</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              <input value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-emerald-500" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700">Teléfono *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input 
                  type="tel"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  title="El teléfono debe tener 8 dígitos"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 8)})} 
                  className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-emerald-500" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700">Teléfono Secundario (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input 
                  type="tel"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  title="El teléfono debe tener 8 dígitos"
                  value={formData.secondary_phone} 
                  onChange={e => setFormData({...formData, secondary_phone: e.target.value.replace(/\D/g, '').slice(0, 8)})} 
                  className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-emerald-500" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700">Sector / Colonia *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <select 
                  value={formData.sector} 
                  onChange={e => setFormData({...formData, sector: e.target.value})} 
                  className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-emerald-500 appearance-none bg-white" 
                  required
                >
                  <option value="" disabled>Selecciona un sector</option>
                  <option value="Parque 01">Parque 01</option>
                  <option value="Parque 02">Parque 02</option>
                  <option value="Parque 03">Parque 03</option>
                  <option value="Parque 04">Parque 04</option>
                  <option value="Parque 05">Parque 05</option>
                  <option value="Andana 01">Andana 01</option>
                  <option value="Andana 02">Andana 02</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700">No. de Casa *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} className="w-full pl-10 p-2.5 border border-neutral-300 rounded-lg outline-none focus:border-emerald-500" required />
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col items-center">
            <button disabled={loading} type="submit" className="bg-emerald-600 text-white font-medium px-8 py-3 rounded-full shadow-md hover:bg-emerald-700 transition hover:scale-105 disabled:opacity-50 min-w-[200px]">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <div className="h-6 mt-2">
              {saved && (
                <span className="text-emerald-600 font-medium text-sm animate-in fade-in slide-in-from-bottom-2">
                  ¡Cambios guardados con éxito!
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      <PhoneAlertModal isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)} />
    </div>
  )
}
