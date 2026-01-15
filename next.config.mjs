/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar headers de seguridad a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: solo permitir recursos del mismo origen
              "default-src 'self'",
              
              // Scripts: permitir mismo origen + inline scripts (Next.js los requiere)
              // En producción, considerar usar nonces para mayor seguridad
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              
              // Estilos: permitir mismo origen + inline styles (Tailwind requiere)
              "style-src 'self' 'unsafe-inline'",
              
              // Imágenes: permitir mismo origen + data URIs (para QR codes)
              "img-src 'self' data: https:",
              
              // Fuentes: permitir mismo origen
              "font-src 'self' data:",
              
              // Conexiones: permitir Supabase API + Insight API (DASH blockchain)
              "connect-src 'self' https://*.supabase.co https://insight.dash.org wss://*.supabase.co",
              
              // Frames: no permitir embeber este sitio en iframes (Clickjacking protection)
              "frame-ancestors 'none'",
              
              // Objetos: no permitir plugins (Flash, Java, etc.)
              "object-src 'none'",
              
              // Base URI: restringir a mismo origen
              "base-uri 'self'",
              
              // Formularios: solo permitir envío a mismo origen
              "form-action 'self'",
              
              // Upgrade insecure requests (HTTP -> HTTPS)
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            // Prevenir clickjacking (X-Frame-Options)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevenir MIME sniffing (X-Content-Type-Options)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Habilitar XSS protection en navegadores antiguos
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Strict Transport Security (HSTS)
            // Forzar HTTPS por 1 año, incluir subdominios
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Referrer Policy (no enviar origen a sitios externos)
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions Policy (Feature Policy)
            // Deshabilitar APIs no necesarias
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()', // Deshabilitar FLoC (privacidad)
              'payment=(self)', // Solo permitir Payment API en mismo origen
            ].join(', '),
          },
          {
            // Cross-Origin Opener Policy (COOP)
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            // Cross-Origin Resource Policy (CORP)
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            // Cross-Origin Embedder Policy (COEP)
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
      {
        // Headers específicos para API routes
        source: '/api/:path*',
        headers: [
          {
            // No cachear respuestas de API
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  
  // Configuración de producción
  poweredByHeader: false, // Ocultar header "X-Powered-By: Next.js"
  
  // Otras configuraciones...
};

export default nextConfig;
