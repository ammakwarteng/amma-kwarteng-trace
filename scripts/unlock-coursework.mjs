/*
  Recover the readable coursework from public/coursework.enc.json into private/coursework/,
  so it can be edited and locked again (or published openly once the semester is over).

  Usage (from the project root):
    COURSEWORK_CODE='your-access-code' node scripts/unlock-coursework.mjs
*/
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";

const DIR = "private/coursework";
const code = process.env.COURSEWORK_CODE;
if (!code) {
  console.error("Usage: COURSEWORK_CODE='your-access-code' node scripts/unlock-coursework.mjs");
  process.exit(1);
}

const box = JSON.parse(await readFile("public/coursework.enc.json", "utf8"));
const from = (s) => Uint8Array.from(Buffer.from(s, "base64"));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", hash: box.kdf.hash, salt: from(box.kdf.salt), iterations: box.kdf.iterations },
  base,
  { name: "AES-GCM", length: 256 },
  false,
  ["decrypt"]
);
let plain;
try {
  plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: from(box.cipher.iv) }, key, from(box.data));
} catch {
  console.error("That code doesn't open public/coursework.enc.json.");
  process.exit(1);
}

const courses = JSON.parse(new TextDecoder().decode(plain));
async function open(boxPath) {
  const b = JSON.parse(await readFile(boxPath, "utf8"));
  const k = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: b.kdf.hash, salt: from(b.kdf.salt), iterations: b.kdf.iterations }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  return Buffer.from(await crypto.subtle.decrypt({ name: "AES-GCM", iv: from(b.cipher.iv) }, k, from(b.data)));
}
let count = 0;
for (const c of courses) {
  for (const f of c.files) {
    if (f.download?.file) {
      const out = path.join(DIR, f.download.src);
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, await open(`public/${f.download.file}`));
      f.download = { src: f.download.src, name: f.download.name, label: f.download.label };
    }
    for (const im of f.images || []) {
      const out = path.join(DIR, im.src);
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, Buffer.from(im.data.split(",")[1], "base64"));
      delete im.data;
      count++;
    }
  }
}
await mkdir(DIR, { recursive: true });
await writeFile(path.join(DIR, "coursework.json"), JSON.stringify(courses, null, 2));
console.log(`Restored ${count} screenshots and coursework.json into ${DIR}/`);
