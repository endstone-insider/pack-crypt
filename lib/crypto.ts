import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

import JSZip from "jszip";

export const KEY_LENGTH = 32;
export const VERSION = 0;
export const FILE_SIGNATURE = Uint8Array.from([0xfc, 0xb9, 0xcf, 0x9b]);
export const EXCLUDES = ["manifest.json", "pack_icon.png", "bug_pack_icon.png"];

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
  const iv = key.substring(0, 16);
  const cipher = createCipheriv("aes-256-cfb8", key, iv);

  cipher.setAutoPadding(false);

  return Buffer.concat([cipher.update(data), cipher.final()]);
}

/** AES-CFB8 decryption */
export function decryptData(data: Uint8Array, key: string): Uint8Array {
  const iv = key.substring(0, 16);
  const decipher = createDecipheriv("aes-256-cfb8", key, iv);

  decipher.setAutoPadding(false);

  return Buffer.concat([decipher.update(Buffer.from(data)), decipher.final()]);
}

/** Encrypt a pack buffer, returning zip */
export async function encryptPack(
  buffer: ArrayBuffer,
  key: string,
): Promise<Blob> {
  const zipIn = await JSZip.loadAsync(buffer);
  const zipOut = new JSZip();
  const manifest = JSON.parse(
    await zipIn.file("manifest.json")!.async("string"),
  );
  const contentId: string = manifest.header.uuid;
  const entries: { path: string; key: string | null }[] = [];

  for (const path of Object.keys(zipIn.files)) {
    const f = zipIn.files[path]!;

    if (f.dir) {
      zipOut.folder(path);
      continue;
    }

    const raw = await f.async("uint8array");

    if (EXCLUDES.includes(path)) {
      zipOut.file(path, raw);
      entries.push({ path, key: null });
    } else {
      const entryKey = randomKey();
      const enc = encryptData(raw, entryKey);

      zipOut.file(path, enc);
      entries.push({ path, key: entryKey });
    }
  }

  const header = new Uint8Array(0x100);
  const cid = new TextEncoder().encode(contentId);

  new DataView(header.buffer).setUint32(0, VERSION);
  header.set(FILE_SIGNATURE, 4);
  header[0x10] = cid.length;
  header.set(cid, 0x11);

  const payload = new TextEncoder().encode(
    JSON.stringify({ content: entries }),
  );
  const encPayload = encryptData(payload, key);
  const blobContents = new Uint8Array(header.length + encPayload.length);

  blobContents.set(header);
  blobContents.set(encPayload, header.length);
  zipOut.file("contents.json", blobContents);

  const outArr = await zipOut.generateAsync({ type: "uint8array" });

  return new Blob([outArr], { type: "application/zip" });
}

/** Decrypt a pack buffer using contents.json + key */
export async function decryptPack(
  buffer: ArrayBuffer,
  key: string,
): Promise<Blob> {
  const zipIn = await JSZip.loadAsync(buffer);
  const zipOut = new JSZip();
  const raw = await zipIn.file("contents.json")!.async("uint8array");
  const encPayload = raw.slice(0x100);
  const decPayload = decryptData(encPayload, key);
  const meta = JSON.parse(new TextDecoder().decode(decPayload));

  for (const entry of meta.content) {
    const f = zipIn.files[entry.path]!;
    const data = await f.async("uint8array");

    if (entry.key) {
      const dec = decryptData(data, entry.key);

      zipOut.file(entry.path, dec);
    } else {
      zipOut.file(entry.path, data);
    }
  }
  for (const name of EXCLUDES) {
    if (!meta.content.find((x: any) => x.path === name) && zipIn.file(name)) {
      zipOut.file(name, await zipIn.file(name)!.async("uint8array"));
    }
  }

  const outArr = await zipOut.generateAsync({ type: "uint8array" });

  return new Blob([outArr], { type: "application/zip" });
}
