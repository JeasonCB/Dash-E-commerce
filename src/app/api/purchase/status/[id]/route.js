import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server.js';
import { getAdminClient } from '@/lib/supabase/admin.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const supabase = await createServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener estado de la compra
    const adminClient = getAdminClient();
    const { data: purchase, error } = await adminClient
      .from('purchases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        plan: purchase.plan_name,
        dashAddress: purchase.dash_address,
        dashAmount: purchase.dash_amount,
        paymentStatus: purchase.payment_status,
        deliveryStatus: purchase.delivery_status,
        confirmations: purchase.confirmations || 0,
        expiresAt: purchase.expires_at,
        createdAt: purchase.created_at,
        txid: purchase.transaction_id,
      },
    });

  } catch (error) {
    console.error('Purchase status error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch purchase status' },
      { status: 500 }
    );
  }
}
