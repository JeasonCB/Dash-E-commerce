import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin.js';
import { sendBotDelivery, sendAdminNotification } from '@/lib/email/resend-client.js';

export const runtime = 'edge';

export async function GET(request) {
  try {
    // 1. Verificar autenticación del cron (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = getAdminClient();

    // 2. Buscar compras confirmadas hace más de 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: pendingDeliveries, error } = await adminClient
      .from('purchases')
      .select('*')
      .eq('payment_status', 'confirmed')
      .eq('delivery_status', 'pending')
      .lte('updated_at', twentyFourHoursAgo.toISOString());

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`📦 Found ${pendingDeliveries?.length || 0} deliveries to process`);

    // 3. Procesar cada entrega
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const purchase of pendingDeliveries || []) {
      results.processed++;

      try {
        // 3a. Enviar email al cliente
        await sendBotDelivery({
          email: purchase.email,
          name: purchase.email.split('@')[0],
          plan: purchase.plan_name,
          purchaseId: purchase.id,
        });

        // 3b. Notificar al admin
        await sendAdminNotification({
          plan: purchase.plan_name,
          email: purchase.email,
          amount: purchase.dash_amount,
          purchaseId: purchase.id,
        });

        // 3c. Actualizar estado
        const { error: updateError } = await adminClient
          .from('purchases')
          .update({
            delivery_status: 'sent',
            delivered_at: new Date().toISOString(),
          })
          .eq('id', purchase.id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        results.successful++;
        console.log(`✅ Delivered: ${purchase.id}`);

      } catch (deliveryError) {
        results.failed++;
        results.errors.push({
          purchaseId: purchase.id,
          error: deliveryError.message,
        });

        console.error(`❌ Failed to deliver ${purchase.id}:`, deliveryError);

        // Log del error en base de datos
        await adminClient.from('security_alerts').insert({
          alert_type: 'delivery_failed',
          severity: 'HIGH',
          details: {
            purchase_id: purchase.id,
            error: deliveryError.message,
          },
        });
      }
    }

    // 4. Retornar resumen
    return NextResponse.json({
      success: true,
      summary: {
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        timestamp: new Date().toISOString(),
      },
      errors: results.errors,
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
