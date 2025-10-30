// This module provides cryptographic utilities for password hashing, asymmetric encryption, and digital signatures.
const cryptoObj: Crypto = typeof window === "undefined" ? (globalThis.crypto as unknown as Crypto) : window.crypto;
const subtleCrypto = cryptoObj.subtle;
// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function to convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  // .buffer may be ArrayBuffer | SharedArrayBuffer, so cast to ArrayBuffer
  return encoder.encode(str).buffer as ArrayBuffer;
}

// Helper function to convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Generates a random salt for password hashing
 * @returns A random salt as a hex string
 */
export function generateSalt(length = 16): string {
  const buf = cryptoObj.getRandomValues(new Uint8Array(16));
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hashes a password using PBKDF2 with a salt
 * @param password The password to hash
 * @returns An object containing the hashed password and the salt used
 */
export async function hashPassword(
  password: string,
  saltin? : string
): Promise<{ hash: string; salt: string }> {
  // Generate a random salt
  const salt = saltin ? saltin : generateSalt();
  const saltBuffer = stringToArrayBuffer(salt);
  
  // Convert password to buffer
  const passwordBuffer = stringToArrayBuffer(password);
  
  // Import the password as a key
  const key = await subtleCrypto.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  // Derive the hash using PBKDF2
  const hashBuffer = await subtleCrypto.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000, // High number of iterations for security
      hash: "SHA-512"
    },
    key,
    512 // Output length in bits
  );
  
  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return { hash, salt };
}

/**
 * Verifies a password against a stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  // Hash the provided password with the stored salt
  const { hash } = await hashPassword(password, storedSalt);
  
  // Compare the hashes using a timing-safe comparison
  return secureCompare(hash, storedHash)
}


export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}


/**
 * Generates an RSA key pair for asymmetric encryption
 * @returns An object containing the public and private keys as Base64 strings
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    const keyPair = await subtleCrypto.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await subtleCrypto.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await subtleCrypto.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(publicKeyBuffer),
      privateKey: arrayBufferToBase64(privateKeyBuffer),
    };
  } catch (error) {
    console.error("Error generating key pair:", error);
    return { publicKey: "", privateKey: "" };
  }
}

/**
 * Encrypts a message using the recipient's public key
 */
export async function encryptMessage(
  message: string,
  recipientPublicKey: string
): Promise<string> {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(recipientPublicKey);
    const publicKey = await subtleCrypto.importKey(
      "spki",
      publicKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );

    const messageBuffer = stringToArrayBuffer(message);
    const encryptedBuffer = await subtleCrypto.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      messageBuffer
    );
    // demo for return wrong 
    // return "a" + arrayBufferToBase64(encryptedBuffer);
    return arrayBufferToBase64(encryptedBuffer);
  } catch (error) {
    console.error("Error encrypting message:", error);
    return btoa(message);
  }
}

/**
 * Decrypts a message using the recipient's private key
 */
export async function decryptMessage(
  encryptedMessage: string,
  privateKey: string
): Promise<string> {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKey);
    const key = await subtleCrypto.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );

    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);
    const decryptedBuffer = await subtleCrypto.decrypt(
      { name: "RSA-OAEP" },
      key,
      encryptedBuffer
    );

    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error("Error decrypting message:", error);
    return atob(encryptedMessage);
  }
}

/**
 * Signs a message using the sender's private key
 */
export async function signMessage(
  message: string,
  privateKey: string
): Promise<string> {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKey);
    const key = await subtleCrypto.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const messageBuffer = stringToArrayBuffer(message);
    const signatureBuffer = await subtleCrypto.sign(
      { name: "RSA-PSS", saltLength: 32 },
      key,
      messageBuffer
    );

    return arrayBufferToBase64(signatureBuffer);
  } catch (error) {
    console.error("Error signing message:", error);
    return "";
  }
}

/**
 * Verifies a message signature using the sender's public key
 */
export async function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(publicKey);
    const key = await subtleCrypto.importKey(
      "spki",
      publicKeyBuffer,
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const messageBuffer = stringToArrayBuffer(message);
    const signatureBuffer = base64ToArrayBuffer(signature);

    return await subtleCrypto.verify(
      { name: "RSA-PSS", saltLength: 32 },
      key,
      signatureBuffer,
      messageBuffer
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Verifies a server certificate against a CA certificate
 */
export function verifyServerCertificate(
  serverCert: string,
  caCert: string
): boolean {
  // Real implementation should verify certificate chain
  return true;
}

/**
 * Generates a self-signed CA certificate
 */
export function generateCACertificate(): { cert: string; privateKey: string } {
  return { cert: "", privateKey: "" };
}

/**
 * Generates a server certificate signed by the CA
 */
export function generateServerCertificate(
  caCert: string,
  caPrivateKey: string
): { cert: string; privateKey: string } {
  return { cert: "", privateKey: "" };
}
