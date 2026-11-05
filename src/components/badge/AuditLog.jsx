import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "../../track.js";
import "./AuditLog.css";

/*
  Session audit log: shown after the visitor badge is swiped. The visitor's
  session is closed the way an IAM system would record it: credential read,
  authenticated, authorised with least privilege, signed out, token revoked.
  Lines appear one at a time; "start a new session" (or Esc) goes back to the
  top of the site. Nothing is collected: the log is built in the browser.
*/
const pad = (n, w = 2) => String(n).padStart(w, "0");
const stamp = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
const duration = (ms) => {
  const s = Math.max(1, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? `${m}m ${pad(s % 60)}s` : `${s}s`;
};

export default function AuditLog({ onResume }) {
  const [shown, setShown] = useState(0);
  const btnRef = useRef(null);

  const { id, lines } = useMemo(() => {
    const start = Date.now();
    const at = (ms) => stamp(new Date(start + ms));
    const sessionId = Math.random().toString(16).slice(2, 8);
    return {
      id: sessionId,
      lines: [
        { t: at(0), ev: "badge.read", detail: "magnetic stripe read · credential valid", res: "ok" },
        { t: at(31), ev: "authn", detail: "visitor authenticated as guest", res: "granted" },
        { t: at(58), ev: "authz", detail: "role visitor · read-only · public pages", res: "granted" },
        { t: at(74), ev: "priv.check", detail: "admin rights requested: none", res: "ok" },
        { t: at(112), ev: "session.end", detail: `signed out after ${duration(performance.now())}`, res: "ok" },
        { t: at(139), ev: "token.revoke", detail: `session ${sessionId} token revoked`, res: "ok" },
        { t: at(170), ev: "review", detail: "least privilege upheld · 0 findings", res: "closed" },
      ],
    };
  }, []);

  const done = shown >= lines.length;

  useEffect(() => {
    document.documentElement.classList.add("is-locked");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers = reduce
      ? [setTimeout(() => setShown(lines.length), 0)]
      : lines.map((_, i) => setTimeout(() => setShown(i + 1), 450 + i * 320));
    return () => {
      document.documentElement.classList.remove("is-locked");
      timers.forEach(clearTimeout);
    };
  }, [lines]);

  useEffect(() => { if (done) btnRef.current?.focus({ preventScroll: true }); }, [done]);

  const restart = () => {
    track("session-audit-new-session", "Started a new session from the audit log");
    onResume();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") restart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div className="audit" role="dialog" aria-modal="true" aria-label="Session audit log">
      <div className="audit__panel mono">
        <header className="audit__head">
          <span>session audit · trace</span>
          <span className="audit__id">session {id}</span>
        </header>

        <ol className="audit__log" aria-live="polite">
          {lines.slice(0, shown).map((l) => (
            <li key={l.ev} className="audit__row">
              <span className="audit__t">{l.t}</span>
              <span className="audit__ev">{l.ev}</span>
              <span className="audit__detail">{l.detail}</span>
              <span className="audit__res">{l.res}</span>
            </li>
          ))}
          {!done && <li className="audit__cursor" aria-hidden="true" />}
        </ol>

        <footer className={`audit__foot ${done ? "is-done" : ""}`}>
          <p>access closed. thanks for visiting.</p>
          <button ref={btnRef} type="button" onClick={restart} disabled={!done}>
            start a new session
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
