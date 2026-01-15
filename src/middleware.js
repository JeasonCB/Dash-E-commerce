import { NextResponse } from 'next/server';
import { SECURITY_CONFIG } from '@/utils/constants.js';

// Rate limiting store (en producción usar Redis)
const rateLimitStore = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.timestamp > SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

async function getCountryCode(ip) {
  try {
    // Usar ipapi.co para obtener el país
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Bots-Cambiarios/1.0',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.country_code;
  } catch (error) {
    console.error('Geolocation error:', error);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Solo aplicar a rutas API críticas
  if (pathname.startsWith('/api/purchase') || pathname.startsWith('/api/dash')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                request.headers.get('x-real-ip') || 
                '127.0.0.1';

    // 1. Rate Limiting
    cleanupOldEntries();
    
    const rateLimitKey = `rate_limit:${ip}`;
    const rateLimitData = rateLimitStore.get(rateLimitKey) || { count: 0, timestamp: Date.now() };

    if (Date.now() - rateLimitData.timestamp > SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS) {
      rateLimitData.count = 0;
      rateLimitData.timestamp = Date.now();
    }

    rateLimitData.count++;
    rateLimitStore.set(rateLimitKey, rateLimitData);

    if (rateLimitData.count > SECURITY_CONFIG.RATE_LIMIT_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Por favor espera 15 minutos antes de intentar de nuevo',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900',
          },
        }
      );
    }

    // 2. Geo-blocking (solo para Venezuela y Colombia)
    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV === 'production' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
      const countryCode = await getCountryCode(ip);

      if (countryCode && !SECURITY_CONFIG.ALLOWED_COUNTRIES.includes(countryCode)) {
        console.warn(`Geo-blocked request from ${countryCode} (IP: ${ip})`);
        
        return NextResponse.json(
          { 
            error: 'Region not allowed',
            message: 'Este servicio solo está disponible en Venezuela y Colombia',
          },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/purchase/:path*',
    '/api/dash/:path*',
  ],
};
