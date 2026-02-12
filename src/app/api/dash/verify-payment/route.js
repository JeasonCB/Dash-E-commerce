import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin.js';
import { paymentVerifier } from '@/lib/dash/payment-verifier.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 1. Obtener la compra
    const { data: purchase, error } = await adminClient
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (error || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // 2. Verificar si ya está confirmado
    if (purchase.payment_status === 'confirmed') {
      return NextResponse.json({
        success: true,
        status: 'already_confirmed',
        purchase: {
          paymentStatus: purchase.payment_status,
          confirmations: purchase.confirmations,
        },
      });
    }

    // 3. Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(purchase.expires_at);
    
    if (now > expiresAt) {
      await adminClient
        .from('purchases')
        .update({ payment_status: 'expired' })
        .eq('id', purchaseId);

      return NextResponse.json({
        success: false,
        status: 'expired',
        message: 'Purchase has expired',
      });
    }

    // 4. Verificar pago en blockchain
    const verification = await paymentVerifier.verifyPayment(
      purchase.dash_address,
      purchase.dash_amount
    );

    // 5. Actualizar según el resultado
    if (verification.verified) {
      // Pago confirmado
      const { error: updateError } = await adminClient
        .from('purchases')
        .update({
          payment_status: 'confirmed',
          transaction_id: verification.txid,
          confirmations: verification.confirmations,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchaseId);

      if (updateError) {
        throw new Error(`Failed to update purchase: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        status: 'confirmed',
        verification: {
          txid: verification.txid,
          confirmations: verification.confirmations,
          amount: verification.amount,
        },
      });
    }

    // 6. Pago pendiente o incorrecto
    return NextResponse.json({
      success: false,
      status: verification.reason,
      verification: {
        reason: verification.reason,
        confirmations: verification.confirmations || 0,
        required: verification.required,
        expected: verification.expected,
        received: verification.received,
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Security: Do not expose internal error details to client
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
