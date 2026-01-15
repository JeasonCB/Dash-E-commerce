import { Resend } from 'resend';
import { keyManager } from '../security/key-manager.js';

let resendClient = null;

export function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const resendKey = keyManager.getKey('RESEND_KEY');
  resendClient = new Resend(resendKey);
  
  return resendClient;
}

export async function sendPurchaseConfirmation({ email, name, plan, dashAddress, dashAmount, expiresAt }) {
  const resend = getResendClient();
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bots Cambiarios <no-reply@botsca mbiarios.com>',
      to: [email],
      subject: `Confirmación de compra: ${plan}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0ea5e9;">¡Gracias por tu compra!</h1>
          <p>Hola ${name || 'Cliente'},</p>
          <p>Hemos recibido tu solicitud de compra para <strong>${plan}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalles del pago:</h3>
            <p><strong>Monto a pagar:</strong> ${dashAmount} DASH</p>
            <p><strong>Dirección de pago:</strong><br/>
            <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; display: inline-block;">${dashAddress}</code></p>
            <p><strong>Expira:</strong> ${new Date(expiresAt).toLocaleString('es-ES')}</p>
          </div>

          <p>Una vez confirmado tu pago (mínimo 3 confirmaciones), recibirás tu bot en un máximo de 24 horas.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
          <p style="color: #6b7280; font-size: 14px;">
            Si tienes alguna pregunta, responde a este correo.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending purchase confirmation:', error);
    throw error;
  }
}

export async function sendBotDelivery({ email, name, plan, purchaseId }) {
  const resend = getResendClient();
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bots Cambiarios <no-reply@botscambiarios.com>',
      to: [email],
      subject: `✅ Tu ${plan} está listo para descargar`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">¡Tu bot está listo!</h1>
          <p>Hola ${name || 'Cliente'},</p>
          <p>Tu pago ha sido confirmado y tu <strong>${plan}</strong> está listo para usar.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contenido incluido:</h3>
            <ul>
              <li>✅ Código fuente del bot</li>
              <li>✅ Manual de instalación paso a paso</li>
              <li>✅ Video tutorial</li>
              <li>✅ Soporte técnico prioritario</li>
              <li>✅ Actualizaciones gratuitas</li>
            </ul>
          </div>

          <p><strong>Enlace de descarga:</strong><br/>
          <a href="https://tudominio.com/download/${purchaseId}" 
             style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Descargar ahora
          </a>
          </p>

          <p>Este enlace es válido por 30 días.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
          <p style="color: #6b7280; font-size: 14px;">
            ¿Necesitas ayuda? Responde a este correo.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending bot delivery:', error);
    throw error;
  }
}

export async function sendAdminNotification({ plan, email, amount, purchaseId }) {
  const resend = getResendClient();
  const adminEmail = keyManager.getKey('ADMIN_EMAIL');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Sistema <system@botscambiarios.com>',
      to: [adminEmail],
      subject: '🔔 Nueva venta registrada',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Nueva Compra</h2>
          <ul>
            <li><strong>Plan:</strong> ${plan}</li>
            <li><strong>Monto:</strong> ${amount} DASH</li>
            <li><strong>ID:</strong> ${purchaseId}</li>
            <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
          </ul>
          <p><em>Revisa Supabase para más detalles.</em></p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    // No fallar si el admin email falla
    return { success: false, error: error.message };
  }
}
