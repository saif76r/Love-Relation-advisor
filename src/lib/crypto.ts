/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Utility to convert ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Utility to convert Hex string to ArrayBuffer
function hexToBuf(hexString: string): ArrayBuffer {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) {
    return new Uint8Array(0).buffer;
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16))).buffer;
}

// Hash password/passcode using SHA-256 for quick validation checks
export async function hashPasscode(passcode: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode + saltHex);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufToHex(hashBuffer);
}

// Generate a cryptographic salt as hex
export function generateSaltHex(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return bufToHex(array.buffer);
}

// Key Derivation from password using PBKDF2
async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBuf(saltHex);

  // Import password as raw key material
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive an AES-GCM 256-bit key
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string using AES-GCM and a passcode-derived key
 */
export async function encryptData(
  plainText: string,
  passcode: string,
  saltHex: string
): Promise<{ ciphertext: string; iv: string }> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(plainText);
    
    // Generate a secure 12-byte IV for AES-GCM
    const ivArray = new Uint8Array(12);
    window.crypto.getRandomValues(ivArray);
    
    const key = await deriveKey(passcode, saltHex);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      dataBuffer
    );
    
    return {
      ciphertext: bufToHex(encryptedBuffer),
      iv: bufToHex(ivArray.buffer),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt private vault data.');
  }
}

/**
 * Decrypts a ciphertext hex string using AES-GCM and a passcode-derived key
 */
export async function decryptData(
  ciphertextHex: string,
  ivHex: string,
  passcode: string,
  saltHex: string
): Promise<string> {
  try {
    const decoder = new TextDecoder();
    const ciphertextBuffer = hexToBuf(ciphertextHex);
    const ivBuffer = hexToBuf(ivHex);
    
    const key = await deriveKey(passcode, saltHex);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );
    
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Incorrect passcode or corrupted encrypted store.');
  }
}
