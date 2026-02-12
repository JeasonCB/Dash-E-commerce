import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server.js';
import { getAdminClient } from '@/lib/supabase/admin.js';
import { dashWallet } from '@/lib/dash/wallet.js';
import { priceOracle } from '@/lib/dash/price-oracle.js';
import { sendPurchaseConfirmation } from '@/lib/email/resend-client.js';
import { PLAN_PRICES, PAYMENT_CONFIG } from '@/utils/constants.js';

export async function POST(request) {
  try {
    // 1. Verificar autenticación
    const supabase = await createServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Obtener datos de la compra
    const body = await request.json();
    const { plan } = body;

    // Security: Validate plan exists as own property to prevent prototype pollution
    if (!plan || !Object.hasOwn(PLAN_PRICES, plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 3. Verificar límite de compras pendientes por usuario (MÁXIMO 1)
    const { data: existingPurchases, error: checkError } = await adminClient
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .in('payment_status', ['pending', 'confirmed'])
      .eq('delivery_status', 'pending');

    if (checkError) {
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    if (existingPurchases && existingPurchases.length >= 1) {
      return NextResponse.json(
        { error: 'You have reached the maximum of 1 pending purchase. Please complete or cancel the existing one.' },
        { status: 429 }
      );
    }

    // 4. Obtener precio actual de DASH
    // eslint-disable-next-line security/detect-object-injection
    const planPriceUSD = PLAN_PRICES[plan].usd;
    const pricing = await priceOracle.calculateDashAmount(planPriceUSD);

    // 5. Generar dirección Dash única
    const addressIndex = await dashWallet.getNextAddressIndex(getAdminClient);
    const dashAddress = dashWallet.generateAddress(addressIndex);

    // 6. Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PAYMENT_CONFIG.EXPIRY_HOURS);

    // 7. Crear registro de compra
    const { data: purchase, error: insertError } = await adminClient
      .from('purchases')
      .insert({
        user_id: user.id,
        email: user.email,
        plan_name: plan,
        plan_price_usd: planPriceUSD,
        dash_address: dashAddress,
        dash_amount: pricing.dash,
        dash_price_usd: pricing.dashPriceUSD,
        payment_status: 'pending',
        delivery_status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create purchase: ${insertError.message}`);
    }

    // 8. Registrar generación de dirección (log de auditoría)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await adminClient
      .from('address_generation_logs')
      .insert({
        purchase_id: purchase.id,
        address: dashAddress,
        derivation_index: addressIndex,
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
      });

    // 9. Enviar email de confirmación
    try {
      await sendPurchaseConfirmation({
        email: user.email,
        name: user.user_metadata?.name || user.email,
        plan,
        dashAddress,
        dashAmount: pricing.dash,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // No fallar la compra si el email falla
    }

    // 10. Retornar datos de la compra
    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        plan,
        dashAddress,
        dashAmount: pricing.dash,
        dashPriceUSD: pricing.dashPriceUSD,
        expiresAt: expiresAt.toISOString(),
        priceUpdateInterval: PAYMENT_CONFIG.PRICE_UPDATE_INTERVAL,
      },
    });

  } catch (error) {
    console.error('Purchase creation error:', error);
    
    // Security: Do not expose internal error details to client
    return NextResponse.json(
      { 
        error: 'Failed to create purchase',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
