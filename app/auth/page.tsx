'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '../../lib/supabase';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    if (!email || !password) { setError('Completá email y contraseña'); return; }
    setLoading(true); setError('');
    const result = await signIn(email, password);
    setLoading(false);
    if ('error' in result && result.error) { setError(result.error); return; }
    if ('user' in result && result.user) {
      localStorage.setItem('ip_u', JSON.stringify({
        id: result.user.id,
        name: result.name,
        email: result.user.email,
        role: result.role,
      }));
      router.push('/app');
    }
  }

  async function register() {
    if (!name || !email || !password) { setError('Completá todos los campos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true); setError('');
    const result = await signUp(email, password, name, isSeller ? 'seller' : 'buyer');
    setLoading(false);
    if ('error' in result && result.error) { setError(result.error); return; }
    if ('needsConfirmation' in result && result.needsConfirmation) {
      setError('📧 Revisá tu email para confirmar la cuenta y después iniciá sesión.');
      setTab('login');
      return;
    }
    if ('user' in result && result.user) {
      localStorage.setItem('ip_u', JSON.stringify({
        id: result.user.id,
        name: result.name,
        email: result.user.email,
        role: result.role,
      }));
      router.push('/app');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="logo-t" style={{ justifyContent: 'center', marginBottom: 32, fontSize: '1.8rem' }}>
          <span className="logo-d" />InstaProp
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Ingresar</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Registrarse</button>
        </div>

        {error && <div className="auth-err">{error}</div>}

        {tab === 'login' ? (
          <div className="auth-form">
            <input className="inp" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
            <input className="inp" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
            <button className="btn-p" style={{ width: '100%' }} onClick={login} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <div className="auth-dv">o</div>
            <button className="btn-gg" onClick={login} disabled={loading}><GoogleIcon />Continuar con Google</button>
          </div>
        ) : (
          <div className="auth-form">
            <input className="inp" type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
            <input className="inp" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} />
            <label className="auth-role">
              <input type="checkbox" checked={isSeller} onChange={e => setIsSeller(e.target.checked)} />
              <span>Soy vendedor / inmobiliaria</span>
            </label>
            <button className="btn-p" style={{ width: '100%' }} onClick={register} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
            <div className="auth-dv">o</div>
            <button className="btn-gg" onClick={register} disabled={loading}><GoogleIcon />Continuar con Google</button>
          </div>
        )}

        <div className="auth-ft">
          <button onClick={() => router.push('/')} style={{ color: 'var(--text2)', fontSize: '.8rem' }}>← Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}
