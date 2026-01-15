import axios from 'axios';
import { DASH_CONFIG, PAYMENT_CONFIG } from '@/utils/constants.js';

export class InsightAPI {
  constructor() {
    this.apis = [
      'https://insight.dash.org/insight-api',
      'https://testnet-insight.dashevo.org/insight-api',
    ];
    
    this.currentAPI = DASH_CONFIG.NETWORK === 'testnet' ? this.apis[1] : this.apis[0];
  }

  async getAddressInfo(address) {
    try {
      const response = await axios.get(
        `${this.currentAPI}/addr/${address}`,
        { timeout: 10000 }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Insight API error for address ${address}:`, error.message);
      throw new Error(`Failed to fetch address info: ${error.message}`);
    }
  }

  async getTransaction(txid) {
    try {
      const response = await axios.get(
        `${this.currentAPI}/tx/${txid}`,
        { timeout: 10000 }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Insight API error for tx ${txid}:`, error.message);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  async getAddressTransactions(address) {
    try {
      const response = await axios.get(
        `${this.currentAPI}/txs/?address=${address}`,
        { timeout: 10000 }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Insight API error for address txs ${address}:`, error.message);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }
}

export const insightAPI = new InsightAPI();
