import axios from 'axios';
import { DASH_CONFIG } from '@/utils/constants.js';

export class PriceOracle {
  async getDashPriceUSD() {
    const prices = [];
    const errors = [];

    // Intentar obtener precio de CoinGecko
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=usd',
        { timeout: 5000 }
      );
      
      if (response.data?.dash?.usd) {
        prices.push(response.data.dash.usd);
      }
    } catch (error) {
      errors.push(`CoinGecko failed: ${error.message}`);
    }

    // Intentar obtener precio de Coinbase
    try {
      const response = await axios.get(
        'https://api.coinbase.com/v2/exchange-rates?currency=DASH',
        { timeout: 5000 }
      );
      
      if (response.data?.data?.rates?.USD) {
        const price = parseFloat(response.data.data.rates.USD);
        if (price > 0) {
          prices.push(price);
        }
      }
    } catch (error) {
      errors.push(`Coinbase failed: ${error.message}`);
    }

    // Intentar obtener precio de Binance
    try {
      const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/price?symbol=DASHUSDT',
        { timeout: 5000 }
      );
      
      if (response.data?.price) {
        const price = parseFloat(response.data.price);
        if (price > 0) {
          prices.push(price);
        }
      }
    } catch (error) {
      errors.push(`Binance failed: ${error.message}`);
    }

    if (prices.length === 0) {
      console.error('All price oracles failed:', errors);
      throw new Error('Failed to fetch DASH price from all sources');
    }

    // Calcular mediana para evitar outliers
    const sortedPrices = prices.sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

    console.log(`DASH Price fetched: $${median.toFixed(2)} (from ${prices.length} sources)`);
    
    return median;
  }

  calculateDashAmount(usdAmount) {
    return new Promise(async (resolve, reject) => {
      try {
        const dashPriceUSD = await this.getDashPriceUSD();
        const dashAmount = usdAmount / dashPriceUSD;
        
        resolve({
          usd: usdAmount,
          dash: parseFloat(dashAmount.toFixed(8)),
          dashPriceUSD: parseFloat(dashPriceUSD.toFixed(2)),
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const priceOracle = new PriceOracle();
