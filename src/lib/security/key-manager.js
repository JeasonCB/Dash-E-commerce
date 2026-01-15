import { EncryptionService } from './encryption.js';

class KeyManager {
  constructor() {
    this.masterKey = process.env.ENCRYPTION_MASTER_KEY;
    
    if (!this.masterKey) {
      throw new Error('CRITICAL: ENCRYPTION_MASTER_KEY not found');
    }
    
    if (this.masterKey.length !== 64) {
      throw new Error('CRITICAL: ENCRYPTION_MASTER_KEY must be 64 hex chars');
    }
    
    this.cache = new Map();
    this.cacheEnabled = process.env.NODE_ENV === 'production';
  }

  getKey(keyName) {
    if (this.cacheEnabled && this.cache.has(keyName)) {
      return this.cache.get(keyName);
    }

    const encryptedEnvVar = `${keyName}_ENC`;
    const encryptedValue = process.env[encryptedEnvVar];

    if (!encryptedValue) {
      throw new Error(`Missing encrypted key: ${encryptedEnvVar}`);
    }

    let decrypted;
    try {
      decrypted = EncryptionService.decrypt(encryptedValue, this.masterKey);
    } catch (error) {
      throw new Error(`Failed to decrypt ${keyName}: ${error.message}`);
    }

    this.validateIntegrity(keyName, decrypted);

    if (this.cacheEnabled) {
      this.cache.set(keyName, decrypted);
    }

    return decrypted;
  }

  validateIntegrity(keyName, decryptedValue) {
    const hashEnvVar = `${keyName}_HASH`;
    const expectedHash = process.env[hashEnvVar];

    if (!expectedHash) {
      console.warn(`⚠️  No integrity hash for ${keyName}`);
      return true;
    }

    const actualHash = EncryptionService.generateHash(decryptedValue);

    if (actualHash !== expectedHash) {
      throw new Error(`Integrity check failed for ${keyName}`);
    }

    return true;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const keyManager = new KeyManager();
