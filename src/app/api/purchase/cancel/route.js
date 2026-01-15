import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    // Verificar autenticación
    const supabase = await createServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Verificar que la compra pertenece al usuario
    const { data: purchase, error: fetchError } = await adminClient
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Verificar que se puede cancelar (solo si está pending y no entregado)
    if (purchase.payment_status !== 'pending' || purchase.delivery_status !== 'pending') {
      return NextResponse.json(
        { error: 'This purchase cannot be cancelled' },
        { status: 400 }
      );
    }

    // Actualizar estado a cancelled
    const { data: updated, error: updateError } = await adminClient
      .from('purchases')
      .update({
        payment_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to cancel purchase: ${updateError.message}`);
    }

    // Log en base de datos
    logger.info('purchase_cancelled', {
      purchase_id: purchaseId,
      plan: purchase.plan_name,
      reason: 'user_requested'
    }, user.id, purchaseId);

    return NextResponse.json({
      success: true,
      purchase: updated,
    });

  } catch (error) {
    logger.error('purchase_cancel_error', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { error: error.message || 'Failed to cancel purchase' },
      { status: 500 }
    );
  }
}
