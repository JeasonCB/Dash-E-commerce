import { createServer } from '@/lib/supabase/server';

/**
 * Sistema de logging seguro que guarda en base de datos en lugar de console.log
 * Evita exponer información sensible en la consola del navegador
 */

const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

/**
 * Guarda un log en la tabla security_events de Supabase
 * @param {string} level - Nivel del log (info, warn, error, debug)
 * @param {string} eventType - Tipo de evento (ej: 'sse_connection', 'payment_verification')
 * @param {object} metadata - Datos adicionales del evento
 * @param {string} userId - ID del usuario (opcional)
 * @param {string} purchaseId - ID de la compra (opcional)
 */
async function logToDatabase(level, eventType, metadata = {}, userId = null, purchaseId = null) {
  // Solo en servidor (APIs)
  if (typeof window !== 'undefined') return;

  try {
    const supabase = await createServer();
    
    await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        user_id: userId,
        purchase_id: purchaseId,
        metadata: {
          level,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
  } catch (error) {
    // Fallback silencioso - si falla el log, no interrumpir la aplicación
    // No usar console en producción
    if (process.env.NODE_ENV === 'development') {
      // Silencioso incluso en desarrollo para evitar spam
    }
  }
}

/**
 * Logger para eventos informativos
 */
export const logInfo = (eventType, metadata, userId, purchaseId) => {
  logToDatabase(LOG_LEVELS.INFO, eventType, metadata, userId, purchaseId);
};

/**
 * Logger para advertencias
 */
export const logWarn = (eventType, metadata, userId, purchaseId) => {
  logToDatabase(LOG_LEVELS.WARN, eventType, metadata, userId, purchaseId);
};

/**
 * Logger para errores
 */
export const logError = (eventType, metadata, userId, purchaseId) => {
  logToDatabase(LOG_LEVELS.ERROR, metadata, userId, purchaseId);
};

/**
 * Logger para debugging (solo en desarrollo)
 */
export const logDebug = (eventType, metadata, userId, purchaseId) => {
  if (process.env.NODE_ENV === 'development') {
    logToDatabase(LOG_LEVELS.DEBUG, eventType, metadata, userId, purchaseId);
  }
};

/**
 * Logger específico para SSE
 */
export const logSSE = {
  connection: (purchaseId, userId) => {
    logInfo('sse_connection', { action: 'connected' }, userId, purchaseId);
  },
  disconnection: (purchaseId, userId, reason = 'unknown') => {
    logInfo('sse_disconnection', { action: 'disconnected', reason }, userId, purchaseId);
  },
  event: (purchaseId, eventData, userId) => {
    logInfo('sse_event', { data: eventData }, userId, purchaseId);
  },
  error: (purchaseId, errorMessage, userId) => {
    logError('sse_error', { error: errorMessage }, userId, purchaseId);
  }
};

/**
 * Logger para verificación de pagos
 */
export const logPayment = {
  verification: (purchaseId, status, userId) => {
    logInfo('payment_verification', { status }, userId, purchaseId);
  },
  confirmed: (purchaseId, txId, userId) => {
    logInfo('payment_confirmed', { transaction_id: txId }, userId, purchaseId);
  },
  failed: (purchaseId, reason, userId) => {
    logError('payment_failed', { reason }, userId, purchaseId);
  }
};

export default {
  info: logInfo,
  warn: logWarn,
  error: logError,
  debug: logDebug,
  sse: logSSE,
  payment: logPayment
};
