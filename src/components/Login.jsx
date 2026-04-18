import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let message = 'Error al iniciar sesión';
      if (err.code === 'auth/user-not-found') message = 'Usuario no encontrado';
      if (err.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
      if (err.code === 'auth/invalid-login-credentials' || err.code === 'auth/invalid-credential') message = 'Credenciales inválidas (correo o contraseña incorrectos)';
      if (err.code === 'auth/invalid-email') message = 'Correo inválido';
      if (err.code === 'auth/email-already-in-use') message = 'El correo ya está en uso';
      if (err.code === 'auth/weak-password') message = 'La contraseña debe tener al menos 6 caracteres';
      if (err.code === 'auth/operation-not-allowed') message = 'La autenticación por correo no está habilitada en la consola de Firebase';
      
      if (message === 'Error al iniciar sesión' && err.message) {
         message = `${message}: ${err.message}`;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sistema Vencedores</h1>
          <p className="text-gray-500 mt-2">Acceso a la gestión en la nube</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="ejemplo@club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRegistering ? (
              'Crear Cuenta'
            ) : (
              'Entrar al Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Primer acceso? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
