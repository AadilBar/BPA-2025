import CryptoJS from 'crypto-js';

/**
 * Encrypt data using AES encryption
 * @param data - The plain text to encrypt
 * @param key - The encryption key (user's UID)
 * @returns Encrypted string
 */
export const encryptData = (data: string, key: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypt data using AES decryption
 * @param encryptedData - The encrypted string
 * @param key - The decryption key (user's UID)
 * @returns Decrypted plain text
 */
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption fails, return original (for backwards compatibility)
    if (!decrypted) {
      console.warn('Decryption resulted in empty string for:', encryptedData);
      return '';
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Encrypt an array of strings (e.g., triggers)
 * @param items - Array of strings to encrypt
 * @param key - The encryption key
 * @returns Array of encrypted strings
 */
export const encryptArray = (items: string[], key: string): string[] => {
  return items.map(item => encryptData(item, key));
};

/**
 * Decrypt an array of strings
 * @param items - Array of encrypted strings
 * @param key - The decryption key
 * @returns Array of decrypted strings
 */
export const decryptArray = (items: string[], key: string): string[] => {
  return items.map(item => decryptData(item, key));
};
