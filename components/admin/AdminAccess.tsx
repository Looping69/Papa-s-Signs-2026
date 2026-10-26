import React, { useCallback, useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck, LogIn } from 'lucide-react';
interface Session {
  authenticated: boolean;
  setupRequired: boolean;
}
export default function AdminAccess({
  children
}: {
  children: (logout: () => Promise<void>, authenticated: boolean) => React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [entered, setEntered] = useState(false);
  const [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [expired, setExpired] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session', {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to check admin access.');
      setSession(data);
      if (data.authenticated) {
        setEntered(true);
        setExpired(false);
      }
    } catch (e) {
      setSession(null);
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const expired = () => {
      setSession({
        authenticated: false,
        setupRequired: false
      });
      setExpired(true);
    };
    const focus = () => void refresh();
    window.addEventListener('admin-session-expired', expired);
    window.addEventListener('focus', focus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 30000);
    return () => {
      window.removeEventListener('admin-session-expired', expired);
      window.removeEventListener('focus', focus);
      window.clearInterval(timer);
    };
  }, [refresh]);
  const logout = async () => {
    if (!window.confirm('Log out? Unsaved changes in this admin tab will be discarded.')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{}',
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error('Unable to confirm logout. Please try again.');
      setSession({
        authenticated: false,
        setupRequired: false
      });
      setEntered(false);
      setExpired(false);
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return <>
    {entered && <div style={{
      display: session?.authenticated ? 'block' : 'none'
    }} aria-hidden={!session?.authenticated}>{children(logout,session?.authenticated===true)}</div>}
    {!session?.authenticated && <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-7 sm:p-10 shadow-lg">
        <LockKeyhole className="w-9 h-9 text-brand-cyan mb-5" />
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">PAPA'S SIGNS · ADMIN</p>
        <h1 className="text-2xl font-black text-brand-black">{session?.setupRequired ? 'Set your admin password' : 'Admin sign in'}</h1>
        <p className="mt-3 text-sm text-gray-500">{session?.setupRequired ? 'Create a private password of at least 14 characters. Only a salted password hash is stored on this computer.' : 'Enter your password to manage website content, images and quote controls.'}</p>
        {expired && <p role="status" className="mt-4 p-3 bg-amber-50 text-amber-900 text-sm rounded-lg">Your session expired. Unsaved edits are kept in this tab; sign in again to continue.</p>}
        {error && <p role="alert" className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</p>}
        {!session ? <button onClick={() => {
          setError('');
          void refresh();
        }} className="mt-6 px-5 py-3 bg-brand-black text-white rounded-xl font-bold text-sm">{error ? 'Retry access check' : 'Checking access…'}</button> : <form className="mt-6 space-y-4" onSubmit={async e => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError('');
          try {
            const response = await fetch(session.setupRequired ? '/api/admin/setup' : '/api/admin/login', {
              method: 'POST',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                password,
                ...(session.setupRequired ? {
                  confirmPassword: confirm
                } : {})
              }),
              signal: AbortSignal.timeout(15000)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
            setPassword('');
            setConfirm('');
            await refresh();
          } catch (e) {
            setPassword('');
            setConfirm('');
            setError((e as Error).message);
            await refresh();
          } finally {
            setBusy(false);
          }
        }}>
          <label className="block text-sm font-bold">Password<input required type="password" name="password" autoComplete={session.setupRequired ? 'new-password' : 'current-password'} minLength={session.setupRequired ? 14 : 1} maxLength={256} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className="block w-full mt-2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan" /></label>
          {session.setupRequired && <label className="block text-sm font-bold">Confirm password<input required type="password" name="confirmPassword" autoComplete="new-password" minLength={14} maxLength={256} value={confirm} onChange={e => setConfirm(e.target.value)} disabled={busy} className="block w-full mt-2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan" /></label>}
          <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 bg-brand-black text-white rounded-xl px-5 py-3 font-bold disabled:opacity-50"><LogIn className="w-4 h-4" />{busy ? 'Please wait…' : session.setupRequired ? 'Create password & sign in' : 'Sign in'}</button>
        </form>}
        <p className="mt-6 text-xs text-gray-500 flex items-start gap-2"><ShieldCheck className="w-4 h-4 flex-shrink-0" />Local access only. Sessions expire after eight hours or a server restart.</p>
        <a href="/#/" className="inline-block mt-6 text-sm font-bold text-brand-cyan">Back to website</a>
      </div>
    </section>}
    {session?.authenticated && error && <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-sm p-4 rounded-xl bg-red-50 text-red-700 shadow-lg text-sm">{error}</div>}
  </>;
}
