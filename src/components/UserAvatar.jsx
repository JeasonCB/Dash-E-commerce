'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function UserAvatar() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      <div className="dropdown dropdown-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-circle btn-ghost bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
          aria-label="Menú de usuario"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="w-10 h-10 rounded-full ring-2 ring-cyan-400/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-lg">
              {firstLetter}
            </div>
          )}
        </button>

        {isOpen && (
          <ul className="dropdown-content menu bg-slate-900/98 backdrop-blur-xl rounded-2xl z-[1] w-72 p-0 shadow-2xl border-2 border-cyan-500/30 mt-3 overflow-hidden">
            {/* Header con info del usuario */}
            <li className="menu-title px-0 py-0 mb-0">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-cyan-500/20">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={displayName}
                    className="w-14 h-14 rounded-full ring-2 ring-cyan-400/50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-cyan-400/50">
                    {firstLetter}
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-white text-base truncate">{displayName}</span>
                  <span className="text-xs text-cyan-300/90 truncate font-medium">
                    {user.email}
                  </span>
                </div>
              </div>
            </li>
            
            {/* Botón de cerrar sesión */}
            <li className="p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 font-semibold group"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
