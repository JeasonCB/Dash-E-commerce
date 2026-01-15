'use client';

import { useState, useEffect } from 'react';

export default function PaymentStatus({ purchaseId }) {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let eventSource;
    let reconnectTimeout;
    let isComponentMounted = true;

    const connectToSSE = () => {
      // Crear conexión SSE (sin console.log - ahora se guarda en BD)
      eventSource = new EventSource(`/api/purchase/events/${purchaseId}`);

      eventSource.onopen = () => {
        if (isComponentMounted) {
          setIsConnected(true);
          setError(null);
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'initial' || data.type === 'update') {
            if (isComponentMounted) {
              setStatus(data.purchase);
              setIsLoading(false);
              setError(null);
            }

            // Si el pago está confirmado, mostrar notificación
            if (data.purchase.payment_status === 'confirmed') {
              // Notificación de éxito
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('¡Pago Confirmado!', {
                  body: 'Tu pago ha sido confirmado. Recibirás tu bot por email.',
                  icon: '/dash-icon.png',
                });
              }
              
              // Cerrar conexión SSE (el pago ya se confirmó)
              if (eventSource) {
                eventSource.close();
              }
            }
            
            // Si expiró o fue cancelada, también cerrar
            if (['expired', 'cancelled'].includes(data.purchase.payment_status)) {
              if (eventSource) {
                eventSource.close();
              }
            }
          } else if (data.error) {
            if (isComponentMounted) {
              setError(data.error);
              setIsLoading(false);
            }
            if (eventSource) {
              eventSource.close();
            }
          }
        } catch (err) {
          // Error silencioso - se registra en backend
        }
      };

      eventSource.onerror = (err) => {
        if (isComponentMounted) {
          setIsConnected(false);
        }
        
        if (eventSource) {
          eventSource.close();
        }

        // Solo reintentar si el componente está montado y no hay estado final
        if (isComponentMounted && status && !['confirmed', 'expired', 'cancelled'].includes(status.payment_status)) {
          reconnectTimeout = setTimeout(() => {
            connectToSSE();
          }, 5000);
        }
      };
    };

    // Conectar a SSE
    connectToSSE();

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup al desmontar
    return () => {
      isComponentMounted = false;
      
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [purchaseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="loading loading-spinner loading-md text-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
        {error}
      </div>
    );
  }

  if (!status) return null;

  const getStatusColor = () => {
    switch (status.payment_status) {
      case 'confirmed':
        return 'from-green-400 to-emerald-400';
      case 'pending':
        return 'from-yellow-400 to-orange-400';
      case 'expired':
        return 'from-red-400 to-pink-400';
      default:
        return 'from-gray-400 to-slate-400';
    }
  };

  const getStatusText = () => {
    switch (status.payment_status) {
      case 'confirmed':
        return '✅ Pago Confirmado';
      case 'pending':
        return '⏳ Esperando Pago';
      case 'expired':
        return '❌ Orden Expirada';
      default:
        return '📊 Verificando...';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
      {/* Indicador de conexión en tiempo real */}
      <div className="mb-3 flex items-center gap-2 text-xs">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <span className={isConnected ? 'text-green-400' : 'text-gray-400'}>
          {isConnected ? 'Actualizaciones en tiempo real' : 'Reconectando...'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Estado del Pago</p>
          <p className={`mt-1 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {status.payment_status === 'pending' && status.confirmations > 0 && (
          <div className="text-right">
            <p className="text-sm text-slate-400">Confirmaciones</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">
              {status.confirmations} / 3
            </p>
          </div>
        )}
      </div>

      {status.payment_status === 'confirmed' && (
        <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <p className="text-sm text-green-300">
            🎉 Tu bot será enviado a tu correo en las próximas 24 horas
          </p>
          {status.transaction_id && (
            <p className="mt-2 text-xs text-green-400/70">
              TX: {status.transaction_id.substring(0, 16)}...
            </p>
          )}
        </div>
      )}

      {status.payment_status === 'pending' && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
          <p className="text-sm text-yellow-300">
            💫 Monitoreando blockchain en tiempo real...
          </p>
        </div>
      )}
    </div>
  );
}
