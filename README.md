# 🤖 Bots Cambiarios - Sistema de Venta con Criptomonedas

Sistema completo de comercio electrónico para venta de bots automatizados de compra de divisas, con pagos en criptomoneda Dash, autenticación OAuth, verificación blockchain y entrega automatizada.


## 📋 Características

- ✅ **Autenticación segura** con Google OAuth (Supabase)
- ✅ **Pagos en Dash** con direcciones HD únicas por compra
- ✅ **Precio dinámico** que se actualiza cada 120 segundos
- ✅ **Verificación blockchain** automática (3 confirmaciones)
- ✅ **Entrega diferida** de productos (24 horas post-pago)
- ✅ **Geo-restricción** (solo Venezuela y Colombia)
- ✅ **Rate limiting** (protección anti-abuso)
- ✅ **Encriptación AES-256-GCM** para todas las API keys
- ✅ **Emails transaccionales** con Resend
- ✅ **QR codes dinámicos** para facilitar pagos
- ✅ **Logging completo** y auditoría

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, DaisyUI
- **Backend:** Next.js API Routes, Vercel Edge Functions
- **Base de Datos:** Supabase (PostgreSQL con RLS)
- **Autenticación:** Supabase Auth (Google OAuth)
- **Blockchain:** Dash (testnet/mainnet)
- **Emails:** Resend
- **Hosting:** Vercel

## 📦 Dependencias Instaladas

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "latest",
  "@dashevo/dashcore-lib": "^0.20.0",
  "resend": "^3.0.0",
  "qrcode": "^1.5.3",
  "axios": "^1.6.5"
}
```

## 🚀 Configuración Inicial

> 📖 **¿Primera vez configurando el proyecto?**  
> Lee la **[Guía Completa de Configuración](./SETUP-GUIDE.md)** para obtener instrucciones paso a paso sobre cómo obtener todas las credenciales necesarias (Supabase, Dash xpub, Resend, etc.)

### 1. Clonar y preparar el proyecto

```bash
cd "c:\Users\Jeason Campos\Desktop\Bots\my-app"
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor y ejecutar el contenido de `supabase-schema.sql`
3. Configurar Google OAuth:
   - Google Cloud Console → Crear OAuth Client
   - Agregar redirect URI: `https://[tu-proyecto].supabase.co/auth/v1/callback`
   - Copiar Client ID y Client Secret
   - En Supabase → Authentication → Providers → Google → Habilitar y pegar credenciales

### 3. Configurar Dash Wallet (Testnet)

1. Descargar Dash Core Wallet
2. Configurar para testnet
3. Crear nueva wallet o restaurar desde seed
4. Exportar xpub (Extended Public Key):
   ```
   Window → Console
   > getaccountaddress ""
   > dumpprivkey [address]
   > (Usar herramienta para derivar xpub desde private key)
   ```

### 4. Configurar Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar tu dominio (DNS settings)
3. Obtener API Key

### 5. Encriptar credenciales

```bash
node scripts/encrypt-credentials.js
```

Este script te pedirá:
- Dash xpub (testnet)
- Resend API Key
- Supabase Service Role Key
- Tu email de administrador

El output incluirá todas las variables encriptadas listas para copiar.

### 6. Crear archivo .env.local

Copiar `.env.local.example` a `.env.local` y pegar los valores encriptados del paso anterior:

```env
ENCRYPTION_MASTER_KEY=...
DASH_XPUB_ENC=...
DASH_XPUB_HASH=...
# ... resto de variables
```

**Variables públicas (NO encriptadas):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Configuración
DASH_NETWORK=testnet
ALLOWED_COUNTRIES=VE,CO
PAYMENT_EXPIRY_HOURS=72
MIN_CONFIRMATIONS=3
PRICE_UPDATE_INTERVAL=120
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000/pricing](http://localhost:3000/pricing)

## 📁 Estructura del Proyecto

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/callback/           # OAuth callback
│   │   │   ├── purchase/
│   │   │   │   ├── create/              # Crear compra
│   │   │   │   ├── price/               # Obtener precio DASH
│   │   │   │   └── status/[id]/         # Estado de compra
│   │   │   ├── dash/
│   │   │   │   └── verify-payment/      # Verificar pago blockchain
│   │   │   └── cron/
│   │   │       └── process-deliveries/  # Cron job (24h delay)
│   │   ├── pricing/                     # Página de planes
│   │   └── confirmation/                # Confirmación post-compra
│   │
│   ├── components/
│   │   ├── modals/
│   │   │   ├── LoginModal.jsx           # Login con Google
│   │   │   └── PaymentModal.jsx         # Pago con Dash + QR
│   │   └── payment/
│   │       ├── DashQRCode.jsx           # QR dinámico
│   │       ├── PriceUpdateTimer.jsx     # Timer 120s
│   │       └── PaymentStatus.jsx        # Estado en tiempo real
│   │
│   ├── lib/
│   │   ├── security/
│   │   │   ├── encryption.js            # AES-256-GCM
│   │   │   └── key-manager.js           # Gestor de claves
│   │   ├── supabase/
│   │   │   ├── client.js                # Cliente (browser)
│   │   │   ├── server.js                # Servidor (API routes)
│   │   │   └── admin.js                 # Service role
│   │   ├── dash/
│   │   │   ├── wallet.js                # HD Wallet
│   │   │   ├── insight-api.js           # Blockchain queries
│   │   │   ├── price-oracle.js          # Precios multi-source
│   │   │   └── payment-verifier.js      # Verificación de pagos
│   │   └── email/
│   │       └── resend-client.js         # Emails (cliente + admin)
│   │
│   ├── utils/
│   │   └── constants.js                 # Configuración global
│   │
│   └── middleware.js                    # Geo-blocking + Rate limit
│
├── scripts/
│   └── encrypt-credentials.js           # Herramienta de encriptación
│
├── supabase-schema.sql                  # Schema de BD
├── vercel.json                          # Config de Vercel (cron)
├── .env.local.example                   # Template de variables
└── README.md                            # Este archivo
```

## 🔐 Seguridad

### Encriptación
- Todas las API keys están encriptadas con AES-256-GCM
- Master key de 256 bits (nunca en código)
- Auth tags para detectar tampering
- Hashes SHA-256 para validación de integridad

### Geo-blocking
- Solo Venezuela (VE) y Colombia (CO)
- Usa ipapi.co para geolocalización
- **Solo activo en producción** (deshabilitado en desarrollo/localhost)
- Verifica `NODE_ENV === 'production'` antes de aplicar restricciones

### Rate Limiting
- Máximo 5 requests por IP cada 15 minutos
- Aplica solo a rutas críticas (`/api/purchase/*`, `/api/dash/*`)
- En producción: migrar a Redis/Upstash

### Blockchain
- HD Wallet: dirección única por compra
- 3 confirmaciones mínimas (~7.5 min)
- Validación de monto exacto (±0.1%)
- Verificación en múltiples APIs (fallback)

### Row Level Security (RLS)
- Los usuarios solo ven sus propias compras
- Service role para operaciones administrativas
- Políticas a nivel de fila en PostgreSQL

## 🔄 Flujo de Compra

1. **Usuario hace click en "Comprar Bot"**
   - Si no está autenticado → Modal de login (Google OAuth)
   - Si está autenticado → Crear compra directamente

2. **Sistema crea la compra**
   - Obtiene precio DASH/USD actual
   - Genera dirección Dash única (HD Wallet)
   - Calcula fecha de expiración (+72h)
   - Guarda en Supabase
   - Envía email de confirmación

3. **Usuario paga**
   - Ve QR code + dirección + monto
   - Precio se actualiza cada 120 segundos
   - Envía DASH desde su wallet

4. **Verificación automática**
   - Sistema verifica pago en blockchain cada 30s
   - Espera 3 confirmaciones
   - Valida monto exacto

5. **Confirmación**
   - Actualiza `payment_status` a 'confirmed'
   - Usuario ve mensaje de éxito

6. **Entrega (24h después)**
   - Cron job ejecuta cada hora
   - Busca compras confirmadas hace +24h
   - Envía email al cliente con archivos
   - Notifica al admin
   - Actualiza `delivery_status` a 'sent'

## ⚙️ Variables de Entorno

### Públicas (Cliente)
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Privadas (Servidor - Encriptadas)
```env
ENCRYPTION_MASTER_KEY          # Master key de encriptación
DASH_XPUB_ENC                  # xpub encriptado
RESEND_KEY_ENC                 # API key de Resend encriptada
SUPABASE_SERVICE_ENC           # Service role key encriptada
ADMIN_EMAIL_ENC                # Email admin encriptado
```

### Configuración
```env
DASH_NETWORK=testnet           # testnet | mainnet
ALLOWED_COUNTRIES=VE,CO
PAYMENT_EXPIRY_HOURS=72
MIN_CONFIRMATIONS=3
PRICE_UPDATE_INTERVAL=120
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
CRON_SECRET=random_secret
```

## 🚢 Deployment en Vercel

### 1. Conectar repositorio
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin [tu-repo]
git push -u origin main
```

### 2. Importar en Vercel
- Ir a [vercel.com/new](https://vercel.com/new)
- Importar repositorio
- Configurar variables de entorno

### 3. Variables en Vercel
Ir a Settings → Environment Variables y agregar TODAS las variables de `.env.local`

### 4. Configurar cron jobs
El archivo `vercel.json` ya está configurado para ejecutar el cron cada hora.

### 5. Deploy
```bash
vercel --prod
```

## 🧪 Testing

### Testnet
1. Obtener DASH de prueba: [testnet faucet](https://testnet-faucet.dash.org/)
2. Configurar `DASH_NETWORK=testnet`
3. Usar xpub de wallet testnet
4. Realizar compra de prueba

### Verificar flujo completo
1. Ir a `/pricing`
2. Click en un plan
3. Login con Google
4. Copiar dirección Dash generada
5. Enviar DASH desde wallet testnet
6. Esperar confirmaciones
7. Verificar email de entrega (después de 24h o manualmente ejecutar cron)

## 📊 Monitoreo

### Logs de Supabase
- Ir a Supabase Dashboard → Logs
- Ver queries, errores, performance

### Vercel Logs
- Ir a Vercel Dashboard → tu-proyecto → Logs
- Ver requests, errores de API routes

### Security Alerts
- Tabla `security_alerts` en Supabase
- Filtrar por severity: 'CRITICAL', 'HIGH'

## ⚠️ Troubleshooting

### Error: "ENCRYPTION_MASTER_KEY not found"
- Verificar que `.env.local` existe
- Verificar que la variable está definida
- Reiniciar servidor de desarrollo

### Error: "Geo-blocked request"
- **En desarrollo:** Geo-blocking está desactivado automáticamente (localhost siempre permitido)
- **En producción:** Solo IPs de Venezuela (VE) o Colombia (CO) están permitidas
- Verificar que `NODE_ENV=production` esté configurado correctamente en Vercel
- Para debugging temporal: comentar el middleware geo-blocking
- Nota: IPs locales (127.0.0.1, 192.168.x.x) siempre permitidas en producción

### Error: "Rate limit exceeded"
- Esperar 15 minutos
- En desarrollo: limpiar el store de rate limiting (reiniciar servidor)

### Error: "Payment verification failed"
- Verificar que la dirección recibió fondos
- Verificar network (testnet vs mainnet)
- Revisar Insight API status

### Cron job no ejecuta
- Verificar `vercel.json` en la raíz
- Verificar `CRON_SECRET` en variables de entorno de Vercel
- Ver logs en Vercel Dashboard


## 📝 Licencia

Proyecto privado - Todos los derechos reservados

---

**Creado con ❤️ usando Next.js y Dash**
