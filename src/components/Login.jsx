import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { Lock, Mail, AlertCircle, Loader2, User, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess, users = [], members = [] }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portalCode, setPortalCode] = useState('');
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'member'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMode === 'member') {
        const codeToTry = portalCode.trim().toUpperCase();
        if (!codeToTry) {
          throw new Error('Por favor ingresa tu código de acceso');
        }

        const member = members.find(m => 
          (m.portalAccessCode === codeToTry) || 
          (m.id && m.id.slice(-6).toUpperCase() === codeToTry)
        );

        if (member) {
          console.log('✅ Miembro identificado con código:', codeToTry);
          
          // Elevate session with anonymous login to fulfill Firebase security requirements for reading master docs
          try {
            await signInAnonymously(auth);
            console.log('🛡️ Sesión de Firebase elevada para portal de miembro');
          } catch (authErr) {
            console.warn('⚠️ No se pudo elevar la sesión (Anónima), el portal podría tener acceso limitado:', authErr);
          }

          const memberUser = {
            ...member,
            role: 'member',
            displayName: `${member.firstName} ${member.lastName}`
          };
          localStorage.setItem('clubvencedores_current_user', JSON.stringify(memberUser));
          onLoginSuccess(memberUser);
          return;
        } else {
          throw new Error('Código de acceso inválido. Verifica que sea el de 6 caracteres que aparece en tu perfil.');
        }
      }

      // Admin Login Logic
      const localUser = users.find(u => 
        (u.username && u.username.toLowerCase() === email.toLowerCase()) || 
        (u.email && u.email.toLowerCase() === email.toLowerCase())
      );

      if (localUser && localUser.password === password) {
        console.log('✅ Local user detected, bypassing Firebase Auth');
        
        // Elevate session with anonymous login to allow Storage uploads
        try {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
            console.log('🛡️ Sesión de Firebase elevada para administrador local');
          }
        } catch (authErr) {
          console.warn('⚠️ No se pudo elevar la sesión de Firebase:', authErr);
        }

        localStorage.setItem('clubvencedores_current_user', JSON.stringify(localUser));
        onLoginSuccess(localUser);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let message = err.message || 'Error al iniciar sesión';
      if (err.code === 'auth/user-not-found') message = 'Usuario no encontrado';
      if (err.code === 'auth/wrong-password') message = 'Contraseña incorrecta';
      if (err.code === 'auth/invalid-login-credentials' || err.code === 'auth/invalid-credential') message = 'Credenciales inválidas (correo o contraseña incorrectos)';
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-950 to-black flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {loginMode === 'admin' ? (
              <Lock className="text-red-600 w-8 h-8" />
            ) : (
              <ShieldCheck className="text-red-600 w-8 h-8" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sistema Vencedores</h1>
          <p className="text-gray-500 mt-2">
            {loginMode === 'admin' ? 'Acceso Administrativo' : 'Portal de Miembros'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => { setLoginMode('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              loginMode === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Administrador
          </button>
          <button
            onClick={() => { setLoginMode('member'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              loginMode === 'member' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Miembro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loginMode === 'admin' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block text-left px-1">Usuario o Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="soybaex o ejemplo@club.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block text-left px-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block text-center uppercase tracking-widest">
                  Código de Portal
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-6 h-6" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-center text-3xl font-black font-mono tracking-[0.3em] uppercase placeholder:text-gray-300"
                    placeholder="ABC123"
                    value={portalCode}
                    onChange={(e) => setPortalCode(e.target.value.toUpperCase())}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">
                  Ingresa el código de 6 caracteres que aparece en tu perfil del club.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : loginMode === 'member' ? (
              'Ingresar al Portal'
            ) : (
              'Entrar al Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
