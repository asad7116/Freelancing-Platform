/**
 * E2E Encryption utility using Web Crypto API
 *
 * Strategy: RSA-OAEP + AES-GCM hybrid encryption
 *  - Each user generates an RSA-OAEP 2048-bit key pair on first use
 *  - Private key is stored in IndexedDB (never leaves the browser)
 *  - Public key (JWK) is uploaded to the server
 *  - To send a message:
 *      1. Generate a random AES-GCM 256-bit key
 *      2. Encrypt the plaintext with AES-GCM → (ciphertext + iv)
 *      3. Encrypt the AES key with each recipient's RSA public key
 *      4. Send { ciphertext, iv, encryptedKeys: { recipientId: encryptedAESKey } }
 *  - To read a message:
 *      1. Find your encryptedKey from encryptedKeys[yourUserId]
 *      2. Decrypt AES key with your RSA private key
 *      3. Decrypt ciphertext with the AES key + iv
 */

const DB_NAME = "tixe_e2e_keys";
const DB_VERSION = 1;
const STORE_NAME = "keypair";
const KEY_ID = "user_rsa_keypair";

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeKeyPair(privateKey, publicKeyJwk) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: KEY_ID, privateKey, publicKeyJwk });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadKeyPair() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY_ID);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Generate a new RSA-OAEP 2048-bit key pair.
 * Returns { privateKey: CryptoKey, publicKeyJwk: object }
 */
async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    false, // private key NOT extractable (security)
    ["encrypt", "decrypt"]
  );

  // Export public key as JWK so we can send it to the server
  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

  return { privateKey: keyPair.privateKey, publicKeyJwk };
}

/**
 * Initialize E2E keys: load from IndexedDB or generate new ones.
 * Returns { privateKey: CryptoKey, publicKeyJwk: object, isNew: boolean }
 */
export async function initializeKeys() {
  const stored = await loadKeyPair();

  if (stored && stored.privateKey && stored.publicKeyJwk) {
    return { privateKey: stored.privateKey, publicKeyJwk: stored.publicKeyJwk, isNew: false };
  }

  // Generate new key pair
  const { privateKey, publicKeyJwk } = await generateKeyPair();
  await storeKeyPair(privateKey, publicKeyJwk);
  return { privateKey, publicKeyJwk, isNew: true };
}

/**
 * Import a public key from JWK format (received from server) into a CryptoKey.
 */
export async function importPublicKey(jwk) {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
}

// ─── Encryption ───────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext message for one or more recipients.
 *
 * @param {string} plaintext - The message text
 * @param {Object} recipientPublicKeys - { recipientUserId: publicKeyJwk, ... }
 * @param {CryptoKey} senderPrivateKey - (unused for encryption, but we include sender's copy)
 * @param {Object} senderPublicKeyJwk - Sender's own public key JWK (to encrypt a copy for sender)
 * @param {string} senderUserId - Sender's user ID
 *
 * @returns {{ ciphertext: string, iv: string, encryptedKeys: { [userId]: string } }}
 *   All binary values are base64-encoded strings.
 */
export async function encryptMessage(plaintext, recipientPublicKeys, senderPublicKeyJwk, senderUserId) {
  // 1. Generate random AES-256-GCM key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable so we can wrap it
    ["encrypt", "decrypt"]
  );

  // 2. Encrypt plaintext with AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );

  // 3. Export raw AES key so we can encrypt it with RSA
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

  // 4. Encrypt the AES key for each recipient + the sender
  const allKeys = { ...recipientPublicKeys };
  // Include sender's own public key so they can decrypt their own messages
  if (senderPublicKeyJwk && senderUserId) {
    allKeys[senderUserId] = senderPublicKeyJwk;
  }

  const encryptedKeys = {};
  for (const [userId, pubKeyJwk] of Object.entries(allKeys)) {
    const pubCryptoKey = await importPublicKey(pubKeyJwk);
    const encryptedAesKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      pubCryptoKey,
      rawAesKey
    );
    encryptedKeys[userId] = bufferToBase64(encryptedAesKey);
  }

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    encryptedKeys,
  };
}

// ─── Decryption ───────────────────────────────────────────────────────────────

/**
 * Decrypt a message using the current user's private key.
 *
 * @param {{ ciphertext: string, iv: string, encryptedKeys: { [userId]: string } }} encrypted
 * @param {CryptoKey} privateKey - Current user's RSA private key
 * @param {string} userId - Current user's ID
 *
 * @returns {string} The decrypted plaintext, or a fallback string on failure.
 */
export async function decryptMessage(encrypted, privateKey, userId) {
  try {
    const { ciphertext, iv, encryptedKeys } = encrypted;

    if (!encryptedKeys || !encryptedKeys[userId]) {
      return "[Unable to decrypt — no key for your account]";
    }

    // 1. Decrypt the AES key with our RSA private key
    const encryptedAesKeyBuffer = base64ToBuffer(encryptedKeys[userId]);
    const rawAesKey = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedAesKeyBuffer
    );

    // 2. Import the AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      rawAesKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // 3. Decrypt the ciphertext
    const ivBuffer = base64ToBuffer(iv);
    const ciphertextBuffer = base64ToBuffer(ciphertext);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      aesKey,
      ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("E2E decryption failed:", err);
    return "[Unable to decrypt message]";
  }
}

// ─── Base64 helpers ───────────────────────────────────────────────────────────

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if the browser supports the Web Crypto API features we need
 */
export function isE2ESupported() {
  return !!(window.crypto && window.crypto.subtle && window.indexedDB);
}
