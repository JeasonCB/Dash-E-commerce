import { HDPublicKey, Address, Networks } from '@dashevo/dashcore-lib';
import { keyManager } from '../security/key-manager.js';
import { DASH_CONFIG } from '@/utils/constants.js';

export class DashWallet {
  constructor() {
    this.network = DASH_CONFIG.NETWORK === 'testnet' ? Networks.testnet : Networks.livenet;
  }

  getHDPublicKey() {
    const xpub = keyManager.getKey('DASH_XPUB');
    return HDPublicKey.fromString(xpub);
  }

  generateAddress(index) {
    try {
      const hdPublicKey = this.getHDPublicKey();
      const derivedKey = hdPublicKey.deriveChild(`m/0/${index}`);
      const address = new Address(derivedKey.publicKey, this.network);
      
      return address.toString();
    } catch (error) {
      throw new Error(`Failed to generate address at index ${index}: ${error.message}`);
    }
  }

  validateAddress(address) {
    try {
      Address.fromString(address, this.network);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getNextAddressIndex(getAdminClient) {
    try {
      const supabase = getAdminClient();
      
      const { data, error } = await supabase
        .from('address_generation_logs')
        .select('derivation_index')
        .order('derivation_index', { ascending: false })
        .limit(1);

      if (error) throw error;

      const lastIndex = data && data.length > 0 ? data[0].derivation_index : -1;
      return lastIndex + 1;
    } catch (error) {
      console.error('Error getting next address index:', error);
      throw new Error('Failed to generate unique address index');
    }
  }
}

export const dashWallet = new DashWallet();
