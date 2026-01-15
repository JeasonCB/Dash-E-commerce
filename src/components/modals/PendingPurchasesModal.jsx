'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

export default function PendingPurchasesModal({ isOpen, onClose, onViewPayment }) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { showConfirm, ConfirmModal } = useConfirm();

  useEffect(() => {
    if (isOpen) {
      fetchPendingPurchases();
    }
  }, [isOpen]);

  const fetchPendingPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .in('payment_status', ['pending', 'confirmed'])
        .eq('delivery_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
    } catch (err) {
      toast.error('Error al cargar compras');
    }
  };

  const handleCancelPurchase = async (purchaseId) => {
    const confirmed = await showConfirm({
      title: '¿Cancelar orden?',
      message: 'Esta acción no se puede deshacer.\n\nLa orden será marcada como cancelada y podrás crear nuevas compras.',
      confirmText: 'Sí, cancelar',
      cancelText: 'No, mantener',
      type: 'danger',
    });

    if (!confirmed) return;

    setIsLoading(true);
    const loadingToast = toast.loading('Cancelando orden...');

    try {
      const response = await fetch('/api/purchase/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar');
      }

      toast.success('Orden cancelada exitosamente', { id: loadingToast });

      // Actualizar lista local
      setPurchases(prev => prev.filter(p => p.id !== purchaseId));

      // Refrescar lista
      await fetchPendingPurchases();
      
      // Si ya no hay compras pendientes, cerrar el modal
      const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
      if (updatedPurchases.length === 0) {
        setTimeout(() => {
          if (onClose) onClose();
        }, 500); // Pequeño delay para que el usuario vea el toast de éxito
      }
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPayment = (purchase) => {
    // Cerrar este modal
    if (onClose) onClose();
    
    // Abrir modal de pago
    if (onViewPayment) {
      onViewPayment({
        id: purchase.id,
        dashAddress: purchase.dash_address,
        dashAmount: purchase.dash_amount,
        plan: purchase.plan_name,
        expiresAt: purchase.expires_at,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || purchases.length < 1) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500/50">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-orange-500/20 border border-orange-500/50">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Límite de Compras Alcanzado
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Tienes {purchases.length} orden{purchases.length > 1 ? 'es' : ''} pendiente{purchases.length > 1 ? 's' : ''} (máximo permitido: 1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
            disabled={isLoading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Alert */}
        <div className="alert alert-warning mb-6">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div className="text-sm">
            <p className="font-semibold">Debes cancelar tu orden pendiente para crear una nueva compra</p>
            <p className="text-xs mt-1">Las órdenes canceladas no afectan tu historial de compras</p>
          </div>
        </div>

        {/* Lista de compras pendientes */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Tu orden pendiente:
          </h4>
          
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {purchase.plan_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Creada: {formatDate(purchase.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-cyan-400 font-mono">
                    {purchase.dash_amount} DASH
                  </span>
                  <span className="text-slate-500">
                    ${purchase.plan_price_usd} USD
                  </span>
                  <span className={`badge badge-sm ${
                    purchase.payment_status === 'confirmed' 
                      ? 'badge-info' 
                      : 'badge-warning'
                  }`}>
                    {purchase.payment_status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Botón Ver Pago (siempre visible) */}
                <button
                  onClick={() => handleViewPayment(purchase)}
                  className="btn btn-sm btn-primary"
                  disabled={isLoading}
                >
                  Ver Pago
                </button>

                {/* Botón Cancelar (solo para pendientes) */}
                {purchase.payment_status === 'pending' && (
                  <button
                    onClick={() => handleCancelPurchase(purchase.id)}
                    className="btn btn-sm btn-error btn-outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Cancelar'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>

        {/* Info footer */}
        <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <p className="text-xs text-cyan-200">
            💡 <span className="font-semibold">Consejo:</span> Solo puedes tener 1 orden pendiente a la vez. Cancélala manualmente para crear una nueva compra de inmediato.
          </p>
        </div>
      </div>
      <div className="modal-backdrop bg-black/70" onClick={onClose}>
        <button className="cursor-default">close</button>
      </div>

      {/* Custom Confirm Modal */}
      <ConfirmModal />
    </div>
  );
}
