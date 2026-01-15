'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function PendingPurchasesBanner() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkPendingPurchases();
  }, []);

  const checkPendingPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .in('payment_status', ['pending', 'confirmed'])
        .eq('delivery_status', 'pending');

      if (error) throw error;

      const count = data?.length || 0;
      setPendingCount(count);
      
      // Mostrar banner si hay 1 o más compras pendientes
      if (count >= 1) {
        setIsVisible(true);
      }
    } catch (err) {
      // Error silencioso
    }
  };

  if (!isVisible || pendingCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4">
      <div className="alert alert-warning shadow-2xl border-2 border-orange-500/50 backdrop-blur-md animate-pulse">
        <ExclamationTriangleIcon className="h-6 w-6" />
        <div className="flex-1">
          <h3 className="font-bold">Tienes {pendingCount} compra{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''}</h3>
          <div className="text-xs">
            Máximo permitido: 1 orden. Cancela la orden pendiente para crear una nueva.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="btn btn-sm btn-ghost"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
