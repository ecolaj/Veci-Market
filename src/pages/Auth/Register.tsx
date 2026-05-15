import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string, name?: string, photo?: string } | undefined;
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(auth.currentUser ? 2 : 1);
  const [error, setError] = useState('');
  
  // Step 1: Email/Password
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Step 2: Profile complete
  const [formData, setFormData] = useState({
    sector: '',
    house_number: '',
    phone: '',
    secondary_phone: '',
    role: 'buyer'
  });

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      setStep(2);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está en uso. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: state?.email || auth.currentUser.email || authData.email,
        display_name: state?.name || authData.name || 'Usuario',
        avatar_url: state?.photo || auth.currentUser.photoURL || '',
        sector: formData.sector,
        house_number: formData.house_number,
        phone: formData.phone,
        secondary_phone: formData.secondary_phone,
        role: formData.role,
        created_at: new Date().toISOString()
      });
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100">
        <h1 className="text-2xl font-black text-center mb-2 text-neutral-800">
          {step === 1 ? 'Crear Cuenta' : 'Completar Perfil'}
        </h1>
        <p className="text-center text-sm font-medium text-neutral-500 mb-8">
          {step === 1 ? 'Regístrate con tu correo para empezar.' : 'Faltan algunos datos para finalizar tu registro.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Nombre completo</label>
              <input 
                value={authData.name}
                onChange={e => setAuthData({...authData, name: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Correo electrónico</label>
              <input 
                type="email"
                value={authData.email}
                onChange={e => setAuthData({...authData, email: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Contraseña</label>
              <input 
                type="password"
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
                minLength={6}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Creando cuenta...' : 'Continuar'}
            </button>
            <div className="text-center text-sm font-medium text-neutral-500 mt-6 pb-2">
              ¿Ya tienes una cuenta? <br/>
              <button type="button" onClick={() => navigate('/login')} className="text-emerald-600 font-bold mt-1 hover:underline">
                Inicia sesión aquí
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Sector / Colonia *</label>
              <input 
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">No. Casa *</label>
              <input 
                value={formData.house_number}
                onChange={e => setFormData({...formData, house_number: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Teléfono (8 dígitos) *</label>
              <input 
                type="tel"
                pattern="[0-9]{8}"
                maxLength={8}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Rol principal</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium cursor-pointer"
              >
                <option value="buyer">Quiero comprar</option>
                <option value="vendor">Quiero vender (y comprar)</option>
              </select>
            </div>
  
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Guardando...' : 'Finalizar Registro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
