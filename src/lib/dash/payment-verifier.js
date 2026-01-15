import { insightAPI } from './insight-api.js';
import { PAYMENT_CONFIG } from '@/utils/constants.js';

export class PaymentVerifier {
  async verifyPayment(address, expectedAmount) {
    try {
      const addressInfo = await insightAPI.getAddressInfo(address);
      
      // Convertir balance de satoshis a DASH (1 DASH = 100,000,000 satoshis)
      const balanceDash = addressInfo.balance / 100000000;
      
      // Verificar que el monto sea correcto (con tolerancia)
      const amountDifference = Math.abs(balanceDash - expectedAmount);
      const tolerance = expectedAmount * PAYMENT_CONFIG.AMOUNT_TOLERANCE;
      
      if (amountDifference > tolerance) {
        return {
          verified: false,
          reason: 'amount_mismatch',
          expected: expectedAmount,
          received: balanceDash,
          difference: amountDifference,
        };
      }

      // Si el balance es 0, no hay pago
      if (balanceDash === 0) {
        return {
          verified: false,
          reason: 'no_payment',
          expected: expectedAmount,
          received: 0,
        };
      }

      // Obtener transacciones para verificar confirmaciones
      const txData = await insightAPI.getAddressTransactions(address);
      
      if (!txData.txs || txData.txs.length === 0) {
        return {
          verified: false,
          reason: 'no_transactions',
        };
      }

      // Obtener la transacción más reciente
      const latestTx = txData.txs[0];
      const confirmations = latestTx.confirmations || 0;

      // Verificar confirmaciones mínimas
      if (confirmations < PAYMENT_CONFIG.MIN_CONFIRMATIONS) {
        return {
          verified: false,
          reason: 'insufficient_confirmations',
          confirmations,
          required: PAYMENT_CONFIG.MIN_CONFIRMATIONS,
          txid: latestTx.txid,
          amount: balanceDash,
        };
      }

      // Pago verificado exitosamente
      return {
        verified: true,
        txid: latestTx.txid,
        amount: balanceDash,
        confirmations,
        blockHeight: latestTx.blockheight,
        timestamp: latestTx.time,
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async getPaymentStatus(address, expectedAmount) {
    try {
      const verification = await this.verifyPayment(address, expectedAmount);
      
      if (verification.verified) {
        return 'confirmed';
      }

      if (verification.reason === 'insufficient_confirmations') {
        return 'pending';
      }

      if (verification.reason === 'no_payment') {
        return 'awaiting_payment';
      }

      if (verification.reason === 'amount_mismatch') {
        return 'amount_incorrect';
      }

      return 'unknown';
    } catch (error) {
      throw error;
    }
  }
}

export const paymentVerifier = new PaymentVerifier();
