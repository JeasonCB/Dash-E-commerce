export const PLAN_PRICES = {
  'Bot BNC': {
    usd: 150,
    name: 'Bot BNC',
    description: 'Automatiza tus compras de dólares en Banco Nacional de Crédito',
  },
  'Bot Banesco': {
    usd: 150,
    name: 'Bot Banesco',
    description: 'IA que gestiona el ciclo completo de compra en Banesco',
  },
  'Paquete Ultimate Bot': {
    usd: 249,
    name: 'Paquete Ultimate Bot',
    description: 'Los dos bots trabajando juntos',
    originalPrice: 300,
    discount: 20,
  },
};

export const PAYMENT_CONFIG = {
  EXPIRY_HOURS: parseInt(process.env.PAYMENT_EXPIRY_HOURS || '72'),
  MIN_CONFIRMATIONS: parseInt(process.env.MIN_CONFIRMATIONS || '3'),
  PRICE_UPDATE_INTERVAL: parseInt(process.env.PRICE_UPDATE_INTERVAL || '120'),
  AMOUNT_TOLERANCE: 0.001, // 0.1% de tolerancia
};

export const SECURITY_CONFIG = {
  ALLOWED_COUNTRIES: (process.env.ALLOWED_COUNTRIES || 'VE,CO').split(','),
  RATE_LIMIT_REQUESTS: parseInt(process.env.RATE_LIMIT_REQUESTS || '5'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
};

export const DASH_CONFIG = {
  NETWORK: process.env.DASH_NETWORK || 'testnet',
  INSIGHT_APIS: [
    'https://insight.dash.org/insight-api',
    'https://api.blockchair.com/dash',
  ],
  PRICE_ORACLES: [
    'https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=usd',
    'https://api.coinbase.com/v2/exchange-rates?currency=DASH',
  ],
};
