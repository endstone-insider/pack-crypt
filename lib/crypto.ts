import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

export const KEY_LENGTH = 32;
export const VERSION = 0;
export const FILE_SIGNATURE = Uint8Array.from([0xfc, 0xb9, 0xcf, 0x9b]);

/** Generate a random alphanumeric key of length KEY_LENGTH */
export function randomKey(): string {
  const bytes = randomBytes(KEY_LENGTH);

  return Array.from(bytes)
    .map(
      (b) =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          b % 62
        ],
    )
    .join("");
}

/** AES-CFB8 encryption */
export function encryptData(data: Uint8Array, key: string): Uint8Array {
  const keyBuf = Buffer.from(key, "utf8");
  const iv = Buffer.from(key.slice(0, 16), "utf8");
  const cipher = createCipheriv("aes-256-cfb8", keyBuf, iv);

  return Buffer.concat([cipher.update(data), cipher.final()]);
}

/** AES-CFB8 decryption */
export function decryptData(data: Uint8Array, key: string): Uint8Array {
  const keyBuf = Buffer.from(key, "utf8");
  const iv = Buffer.from(key.slice(0, 16), "utf8");
  const decipher = createDecipheriv("aes-256-cfb8", keyBuf, iv);

  return Buffer.concat([decipher.update(Buffer.from(data)), decipher.final()]);
}
