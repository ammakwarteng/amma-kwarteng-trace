/*
  Lock the coursework until it is ready to share.

  Reads the readable coursework from private/coursework/ (never committed):
    private/coursework/coursework.json   [{ code, files: [{ title, note, images: [{ src, alt }] }] }]
    private/coursework/<src>             the screenshots, e.g. syst19866/net-01.webp
  and writes one encrypted bundle, public/coursework.enc.json: the notes and the screenshots
  together, encrypted with AES-256-GCM under a key derived from the access code with
  PBKDF2-SHA-256 (600,000 rounds). The page decrypts it in the browser.

  Usage (from the project root):
    COURSEWORK_CODE='your-access-code' node scripts/lock-coursework.mjs

  To get the readable files back (e.g. in a fresh checkout), see scripts/unlock-coursework.mjs.
*/
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";

const ITERATIONS = 600_000;
const DIR = "private/coursework";
const code = process.env.COURSEWORK_CODE;

if (!code) {
  console.error("Usage: COURSEWORK_CODE='your-access-code' node scripts/lock-coursework.mjs");
  process.exit(1);
}
if (code.length < 16) {
  console.error("Use a longer access code (16+ characters, several random words).");
  process.exit(1);
}

const courses = JSON.parse(await readFile(path.join(DIR, "coursework.json"), "utf8"));
let count = 0;
for (const c of courses) {
  for (const f of c.files) {
    for (const im of f.images || []) {
      const bytes = await readFile(path.join(DIR, im.src));
      const type = im.src.endsWith(".png") ? "image/png" : im.src.endsWith(".jpg") ? "image/jpeg" : "image/webp";
      im.data = `data:${type};base64,${bytes.toString("base64")}`;
      count++;
    }
  }
}

const plain = new TextEncoder().encode(JSON.stringify(courses));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  base,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"]
);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));

const b64 = (bytes) => Buffer.from(bytes).toString("base64");
await writeFile("public/coursework.enc.json", JSON.stringify({
  v: 1,
  kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: b64(salt) },
  cipher: { name: "AES-GCM", iv: b64(iv) },
  data: b64(data),
}));
console.log(`Locked ${courses.reduce((n, c) => n + c.files.length, 0)} files and ${count} screenshots into public/coursework.enc.json`);
