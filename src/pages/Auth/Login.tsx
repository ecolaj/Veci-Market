import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import React, { useState } from 'react';
import { Mail, Lock, X } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const handleAuthResult = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        navigate('/');
      } else {
        navigate('/register', { state: { email: user.email, name: user.displayName, photo: user.photoURL }});
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthResult(result.user);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setResetMsg('');
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg('Se ha enviado un enlace a tu correo para restablecer la contraseña.');
    } catch (err: any) {
      setResetMsg('Error al enviar el correo. Verifica que la dirección sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100">
        <h1 className="text-2xl font-black text-center mb-2 text-neutral-800">Iniciar Sesión</h1>
        
        <p className="text-center text-sm font-medium text-neutral-500 mb-8">
          Únete a VeciMarket y conecta con tu comunidad.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-1 mb-2">
            <button 
              type="button" 
              onClick={() => { setResetEmail(email); setShowResetModal(true); setResetMsg(''); }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-bold"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
          <div className="relative bg-white px-4 text-xs font-bold text-neutral-400 lowercase">o continuar con</div>
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

        <div className="text-center text-sm font-medium text-neutral-500 mt-6">
          ¿No tienes una cuenta? <br/>
          <button onClick={() => navigate('/register')} className="text-emerald-600 font-bold mt-1 hover:underline">
            Regístrate aquí
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-neutral-800 mb-2">
              Recuperar Contraseña
            </h3>
            <p className="text-neutral-500 font-medium mb-6 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            
            {resetMsg && (
              <div className={`p-4 rounded-2xl mb-6 text-sm font-bold text-center ${resetMsg.includes('enviado') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="relative mb-4">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 font-black text-white rounded-2xl shadow-md transition-transform hover:scale-[1.02] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
