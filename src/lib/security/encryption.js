import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export class EncryptionService {
  static encrypt(plaintext, masterKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(masterKey, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return [
      encrypted,
      iv.toString('hex'),
      authTag.toString('hex')
    ].join(':');
  }

  static decrypt(encryptedData, masterKey) {
    const [encrypted, iv, authTag] = encryptedData.split(':');
    
    if (!encrypted || !iv || !authTag) {
      throw new Error('Invalid encrypted data format');
    }
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(masterKey, 'hex'),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateMasterKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }

  static generateHash(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
