import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import { PhoneAlertModal } from '../../components/PhoneAlertModal';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string, name?: string, photo?: string } | undefined;
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(auth.currentUser ? 2 : 1);
  const [error, setError] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
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

  const handleAuthResult = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        navigate('/');
      } else {
        setStep(2);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthResult(result.user);
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(userCredential.user);
      
      setStep(2);
    } catch (err: any) {
      console.error("Auth Register Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está en uso. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo no es válido.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('El registro con correo y contraseña no está habilitado.');
      } else {
        setError('Error al crear la cuenta. Inténtalo de nuevo: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if ((formData.phone && formData.phone.length !== 8) || (formData.secondary_phone && formData.secondary_phone.length !== 8)) {
      setShowPhoneModal(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: state?.email || auth.currentUser.email || authData.email,
        display_name: state?.name || authData.name || 'Usuario',
        avatar_url: state?.photo || auth.currentUser.photoURL || '',
        sector: formData.sector,
        house_number: formData.house_number,
        phone: formData.phone,
        secondary_phone: formData.secondary_phone,
        role: formData.role,
        created_at: serverTimestamp()
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMsg = parsed.error || err.message;
      } catch (e) {}
      setError('Hubo un error al guardar tu perfil: ' + errorMsg);
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

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
              <div className="relative bg-white px-4 text-xs font-bold text-neutral-400 lowercase">o registrarse con</div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-neutral-200 text-neutral-700 font-bold py-3.5 rounded-2xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Google
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
              <select 
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium"
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
      <PhoneAlertModal isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)} />
    </div>
  );
}
