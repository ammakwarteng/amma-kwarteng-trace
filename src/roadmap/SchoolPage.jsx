import { useEffect, useRef, useState } from "react";
import { school } from "../data/content.js";
import LockWord from "../components/daylight/LockWord.jsx";

/*
  Coursework, set out like a computer's file browser: a folder per course; open a folder to see
  the files (pieces of coursework) inside; open a file to preview it. A path bar at the top
  (COURSEWORK / CODE) leads back.

  Only the folder names are public. The files (notes and screenshots) are encrypted in
  coursework.enc.json (AES-256-GCM, key from the access code via PBKDF2-SHA-256) and decrypted
  here in the browser with Amma's access code, so nothing readable is published until she
  unlocks it. See scripts/lock-coursework.mjs. Only her own work: never full assignment answers,
  classmates' names or instructor comments.
*/
const FILE = `${import.meta.env.BASE_URL}coursework.enc.json`;
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function openBox(url, code) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("unavailable");
  const box = await res.json();
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: box.kdf.hash, salt: fromB64(box.kdf.salt), iterations: box.kdf.iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  try {
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(box.cipher.iv) }, key, fromB64(box.data));
  } catch {
    throw new Error("denied");
  }
}
const unlock = async (code) => JSON.parse(new TextDecoder().decode(await openBox(FILE, code)));

// a downloadable file (e.g. the Word document), decrypted only when it's clicked
function Download({ file, code }) {
  const [busy, setBusy] = useState(false);
  const get = async () => {
    setBusy(true);
    try {
      const bytes = await openBox(`${import.meta.env.BASE_URL}${file.file}`, code);
      const url = URL.createObjectURL(new Blob([bytes]));
      const a = Object.assign(document.createElement("a"), { href: url, download: file.name });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { /* leave the button as it was */ }
    setBusy(false);
  };
  return <button type="button" className="rm-btn sch-dl" onClick={get} disabled={busy}>{busy ? "opening…" : `download ${file.label || "file"}`}</button>;
}

function Folder() {
  return (
    <svg className="sch-ico sch-ico--folder" viewBox="0 0 64 50" aria-hidden="true">
      <path className="sch-back" d="M2 8 V46 H62 V12 H28 L22 6 H4 Z" />
      <path className="sch-flap" d="M2 18 H62 V46 H2 Z" />
    </svg>
  );
}
function File() {
  return (
    <svg className="sch-ico sch-ico--file" viewBox="0 0 44 54" aria-hidden="true">
      <path d="M3 2 H30 L41 13 V52 H3 Z" />
      <path d="M30 2 V13 H41 M10 24 H34 M10 32 H34 M10 40 H26" />
    </svg>
  );
}

function LockForm({ onOpen }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState("locked"); // locked | checking | denied | unavailable
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!code.trim() || state === "checking") return;
    setState("checking");
    try {
      onOpen(await unlock(code.trim()), code.trim());
    } catch (err) {
      setState(err.message === "unavailable" ? "unavailable" : "denied");
      inputRef.current?.select();
    }
  }

  const msg = {
    locked: "This coursework is private for now. Enter the access code to open it.",
    checking: "Verifying…",
    denied: "Access denied. That code didn't work, so please check it and try again.",
    unavailable: "The coursework couldn't be loaded right now. Please try again later.",
  }[state];

  return (
    <form className="sch-lock" onSubmit={submit}>
      <p className={`sch-lock__msg ${state === "denied" ? "is-denied" : ""}`} role={state === "locked" ? undefined : "status"}>{msg}</p>
      <div className="rm-add">
        <label className="visually-hidden" htmlFor="sch-code">Access code</label>
        <input id="sch-code" ref={inputRef} type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="access code" />
        <button type="submit" className="rm-btn" disabled={!code.trim() || state === "checking"}>{state === "checking" ? "opening…" : "open"}</button>
      </div>
    </form>
  );
}

export default function SchoolPage() {
  const [files, setFiles] = useState(null);     // decrypted: { CODE: [files] }, or null while locked
  const [key, setKey] = useState("");           // the access code, kept in memory only, for downloads
  const [course, setCourse] = useState(null);   // index of the open folder
  const [file, setFile] = useState(null);       // index of the open file
  useEffect(() => { document.title = "Coursework · TRACE"; }, []);
  useEffect(() => {
    if (file === null) return;
    const onKey = (e) => { if (e.key === "Escape") setFile(null); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [file]);

  const open = (list, code) => { setKey(code); setFiles(Object.fromEntries(list.map((c) => [c.code, c.files || []]))); };
  const c = course === null ? null : school[course];
  const items = c && files ? files[c.code] || [] : [];
  const f = c && files && file !== null ? items[file] : null;

  return (
    <main className="rm sch" id="main">
      <header className="rm-head">
        <p className="rm-kicker mono">the classroom</p>
        <h1 className="rm-title"><LockWord text="Coursework" at={1} /></h1>
      </header>

      <nav className="sch-path mono" aria-label="Location">
        <button type="button" onClick={() => { setCourse(null); setFile(null); }} disabled={!c}>Coursework</button>
        {c && <><span aria-hidden="true">/</span><span aria-current="page">{c.code}</span></>}
        <span className="sch-count">{c ? (files ? `${items.length} ${items.length === 1 ? "item" : "items"}` : "locked") : `${school.length} folders`}</span>
      </nav>

      {!c && (
        <ul className="sch-grid" key="folders">
          {school.map((s, i) => (
            <li key={s.code}>
              <button type="button" className="sch-item sch-item--folder" onClick={() => setCourse(i)} aria-label={`${s.code}, ${s.name}`}>
                <Folder />
                <span className="sch-code mono">{s.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {c && (
        <section className="sch-open" key={c.code} aria-label={c.name}>
          <h2 className="sch-title">{c.name}</h2>
          {!files ? (
            <LockForm onOpen={open} />
          ) : items.length === 0 ? (
            <p className="rm-empty mono">This folder is empty for now. Coursework will be added here.</p>
          ) : (
            <ul className="sch-grid sch-grid--files">
              {items.map((x, i) => (
                <li key={x.title}>
                  <button type="button" className="sch-item" onClick={() => setFile(i)}>
                    <File />
                    <span className="sch-name">{x.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {f && (
        <div className="sch-view" role="dialog" aria-modal="true" aria-label={f.title} onClick={() => setFile(null)}>
          <div className="sch-view__card" onClick={(e) => e.stopPropagation()}>
            <div className="sch-view__bar mono">
              <span>{c.code} / {f.title}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Close">×</button>
            </div>
            {f.note && <p className="rm-goal">{f.note}</p>}
            {f.download?.file && <p className="sch-dl-row"><Download file={f.download} code={key} /></p>}
            {f.images?.length > 0 && (
              <>
                <p className="sch-hint mono">{f.images.length} screenshots · scroll sideways</p>
                <div className="sch-shots" tabIndex={0} aria-label="Screenshots">
                  {f.images.map((im, n) => (
                    <figure key={im.src} className="sch-shot">
                      <img src={im.data} alt={im.alt} />
                      <figcaption className="mono">{String(n + 1).padStart(2, "0")} / {String(f.images.length).padStart(2, "0")} · {im.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
