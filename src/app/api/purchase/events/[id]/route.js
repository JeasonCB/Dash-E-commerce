// API Route para Server-Sent Events (SSE)
// Envía actualizaciones en tiempo real del estado de la compra

import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  const params = await context.params;
  const { id } = params;

  // Configurar SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const supabase = await createServer();

      // Enviar evento inicial
      const sendEvent = (data) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Obtener estado inicial
      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        sendEvent({ error: 'Compra no encontrada' });
        controller.close();
        return;
      }

      // Enviar estado inicial
      sendEvent({ type: 'initial', purchase });
      
      // Log en BD: Conexión SSE establecida
      logger.sse.connection(id, purchase.user_id);

      // Suscribirse a cambios en tiempo real
      const channel = supabase
        .channel(`purchase:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE', // Solo escuchar UPDATEs (cuando cambia el estado)
            schema: 'public',
            table: 'purchases',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            // Log en BD: Actualización recibida
            logger.sse.event(id, payload.new, payload.new.user_id);
            
            sendEvent({ 
              type: 'update', 
              purchase: payload.new 
            });

            // Si el pago está confirmado o expiró, cerrar la conexión
            if (['confirmed', 'expired', 'cancelled'].includes(payload.new.payment_status)) {
              logger.sse.disconnection(id, purchase.user_id, `Estado final: ${payload.new.payment_status}`);
              
              // Dar tiempo para que el cliente reciba el evento final
              setTimeout(() => {
                supabase.removeChannel(channel);
                controller.close();
              }, 1000);
            }
          }
        )
        .subscribe();

      // Cleanup cuando el cliente se desconecta
      request.signal.addEventListener('abort', () => {
        // Log en BD: Desconexión SSE por parte del cliente
        logger.sse.disconnection(id, purchase.user_id, 'Cliente desconectado');
        
        supabase.removeChannel(channel);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
