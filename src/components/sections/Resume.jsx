import { useEffect, useRef, useState } from "react";
import EmailLink from "../EmailLink.jsx";
import { track } from "../../track.js";
import "./sections.css";

/*
  Employer-only resume.
  The published file (resume.enc.json) is the PDF encrypted with AES-256-GCM;
  the key comes from the access code via PBKDF2-SHA-256. Decryption happens
  here in the browser, so the code and the readable PDF never leave the
  visitor's device. See scripts/lock-resume.mjs.
*/
const FILE = `${import.meta.env.BASE_URL}resume.enc.json`;
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function unlock(code) {
  const res = await fetch(FILE, { cache: "no-store" });
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
    const pdf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(box.cipher.iv) }, key, fromB64(box.data));
    return URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  } catch {
    throw new Error("denied");
  }
}

export default function Resume() {
  const [code, setCode] = useState("");
  const [state, setState] = useState("locked"); // locked | checking | denied | unavailable | granted
  const [url, setUrl] = useState("");
  const inputRef = useRef(null);

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  async function submit(e) {
    e.preventDefault();
    if (!code.trim() || state === "checking") return;
    setState("checking");
    try {
      setUrl(await unlock(code.trim()));
      setState("granted");
      track("resume-unlocked", "Resume unlocked with the access code");
      setCode("");
    } catch (err) {
      setState(err.message === "unavailable" ? "unavailable" : "denied");
      inputRef.current?.select();
    }
  }

  if (state === "granted") {
    return (
      <div className="resume">
        <p className="resume__label mono"><i className="resume__dot is-open" aria-hidden="true" />access granted</p>
        <p className="resume__lead">thanks for your interest. my resume is ready.</p>
        <div className="resume__actions">
          <a className="resume__btn" href={url} target="_blank" rel="noopener">view resume</a>
          <a className="resume__btn resume__btn--ghost" href={url} download="Amma-Kwarteng-Resume.pdf">download pdf</a>
        </div>
      </div>
    );
  }

  const msg = {
    checking: "verifying…",
    denied: "access denied: that code didn't work. check it and try again.",
    unavailable: "the resume couldn't be loaded right now. please try again later.",
  }[state];

  return (
    <div className="resume">
      <p className="resume__label mono"><i className="resume__dot" aria-hidden="true" />restricted · employer access</p>
      <p className="resume__lead">my resume is encrypted. employers can unlock it with the access code I share.</p>
      <form className="resume__form" onSubmit={submit}>
        <label className="resume__field">
          <span className="mono">access code</span>
          <input
            ref={inputRef}
            id="resume-code"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            value={code}
            onChange={(e) => { setCode(e.target.value); if (state === "denied") setState("locked"); }}
            aria-describedby="resume-msg"
          />
        </label>
        <button className="resume__btn" type="submit" disabled={!code.trim() || state === "checking"}>unlock</button>
      </form>
      <p id="resume-msg" className={`resume__msg mono ${state === "denied" ? "is-denied" : ""}`} role="status" aria-live="polite">
        {msg || " "}
      </p>
      <p className="resume__request">no code? request one: <EmailLink variant="full" /></p>
    </div>
  );
}
