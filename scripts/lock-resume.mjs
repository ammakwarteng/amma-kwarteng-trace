/*
  Lock the résumé for employer-only access.

  Encrypts a PDF with AES-256-GCM. The key is derived from an access code
  with PBKDF2-SHA-256 (600,000 rounds), so guessing codes is slow. Only the
  encrypted file (public/resume.enc.json) is published; the PDF and the code
  never go into the repository.

  Usage (run locally, from the project root):
    RESUME_CODE='your-access-code' node scripts/lock-resume.mjs path/to/resume.pdf

  To change the code or update the résumé, run it again and publish the new
  public/resume.enc.json. Old codes stop working immediately.
*/
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 600_000;
const [pdfPath] = process.argv.slice(2);
const code = process.env.RESUME_CODE;

if (!pdfPath || !code) {
  console.error("Usage: RESUME_CODE='your-access-code' node scripts/lock-resume.mjs path/to/resume.pdf");
  process.exit(1);
}
if (code.length < 16) {
  console.error("Use a longer access code (16+ characters, several random words).");
  process.exit(1);
}

const pdf = await readFile(pdfPath);
if (pdf.subarray(0, 5).toString() !== "%PDF-") {
  console.error(`${pdfPath} is not a PDF.`);
  process.exit(1);
}

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
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pdf));

const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const out = {
  v: 1,
  kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: b64(salt) },
  cipher: { name: "AES-GCM", iv: b64(iv) },
  data: b64(data),
};

await mkdir("public", { recursive: true });
await writeFile("public/resume.enc.json", JSON.stringify(out));
console.log(`Locked ${pdfPath} (${pdf.length} bytes) into public/resume.enc.json`);
