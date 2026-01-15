'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const supabase = createClient();

  useEffect(() => {
    // Verificar si ya hay sesión
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onSuccess?.();
      }
    };

    if (isOpen) {
      checkSession();
    }
  }, [isOpen, supabase.auth, onSuccess]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Error al iniciar sesión. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Por favor intenta de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-[0_30px_80px_-40px_rgba(56,189,248,0.6)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
          aria-label="Cerrar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-slate-300/80">
            Inicia sesión para continuar con tu compra
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="btn btn-lg w-full border-0 bg-white text-slate-900 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>

        {/* Privacy notice */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Al continuar, aceptas nuestros términos y política de privacidad.
        </p>
      </div>
    </div>
  );
}
