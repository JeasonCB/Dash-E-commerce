'use client';

import { useState, useEffect, useCallback } from 'react';
import DashQRCode from '../payment/DashQRCode';
import PriceUpdateTimer from '../payment/PriceUpdateTimer';
import PaymentStatus from '../payment/PaymentStatus';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, purchase }) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const updatePrice = useCallback(async () => {
    if (!purchase?.plan) return;

    setIsLoadingPrice(true);
    try {
      const response = await fetch(`/api/purchase/price?plan=${encodeURIComponent(purchase.plan)}`);
      const data = await response.json();

      if (data.success) {
        setCurrentPrice(data.pricing);
      }
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  }, [purchase?.plan]);

  useEffect(() => {
    if (isOpen && purchase) {
      // Delay inicial para evitar llamada durante render
      const timer = setTimeout(() => {
        updatePrice();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, purchase, updatePrice]);

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-[0_30px_80px_-40px_rgba(56,189,248,0.6)] max-h-[90vh] overflow-y-auto">
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
          <h2 className="text-3xl font-black text-white">Completa tu Pago</h2>
          <p className="mt-2 text-sm text-slate-300/80">
            Envía el pago exacto a la dirección mostrada abajo
          </p>
        </div>

        {/* Payment Info */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <DashQRCode
              address={purchase.dashAddress}
              amount={currentPrice?.dash || purchase.dashAmount}
            />
          </div>

          {/* Amount */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center">
            <p className="text-sm text-slate-400">Monto a pagar</p>
            <p className="mt-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500">
              {currentPrice?.dash || purchase.dashAmount} DASH
            </p>
            <p className="mt-2 text-sm text-slate-400">
              ≈ ${currentPrice?.usd || purchase.planPriceUSD} USD
            </p>
            {isLoadingPrice && (
              <p className="mt-1 text-xs text-cyan-400">Actualizando precio...</p>
            )}
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
            <p className="text-sm font-semibold text-slate-300">Dirección de pago</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-black/30 p-3 text-sm text-cyan-300 break-all">
                {purchase.dashAddress}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(purchase.dashAddress);
                  toast.success('Dirección copiada al portapapeles', {
                    icon: '📋',
                    duration: 2000
                  });
                }}
                className="btn btn-sm btn-outline border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Price Update Timer */}
          <PriceUpdateTimer
            onUpdate={updatePrice}
            interval={purchase.priceUpdateInterval || 120}
          />

          {/* Payment Status */}
          <PaymentStatus purchaseId={purchase.id} />

          {/* Important Info */}
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <h4 className="font-semibold text-yellow-300">⚠️ Importante</h4>
            <ul className="mt-2 space-y-1 text-sm text-yellow-200/80">
              <li>• Envía exactamente {currentPrice?.dash || purchase.dashAmount} DASH</li>
              <li>• Requiere mínimo 3 confirmaciones (~7.5 minutos)</li>
              <li>• Recibirás tu bot por email en máximo 24 horas</li>
              <li>• El precio se actualiza cada {purchase.priceUpdateInterval || 120} segundos</li>
            </ul>
          </div>

          {/* Expiration */}
          <p className="text-center text-xs text-slate-400">
            Esta orden expira el {new Date(purchase.expiresAt).toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
}
