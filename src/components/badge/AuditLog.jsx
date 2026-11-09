import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "../../track.js";
import { readTrace, clearTrace } from "../../trace.js";
import "./AuditLog.css";

/*
  Session audit log: shown after the visitor badge is swiped. Laid out like
  the event viewer of an identity platform or SIEM: a toolbar, filter chips,
  a table of events (time, event id, level, event, details, result) that
  stream in, a summary bar, and the raw record of the sign-out event.
  Everything is built in the browser from this visit (session length, browser
  and system); nothing is collected or sent anywhere, and no IP is shown.
*/
const pad = (n, w = 2) => String(n).padStart(w, "0");
const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const iso = (d) => d.toISOString().replace("Z", "z");
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
const duration = (ms) => {
  const s = Math.max(1, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? `${m}m ${pad(s % 60)}s` : `${s}s`;
};

// a short, general description of the visitor's browser and system (no version numbers)
function client() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "edge" : /Firefox\//.test(ua) ? "firefox" : /Chrome\//.test(ua) ? "chrome" : /Safari\//.test(ua) ? "safari" : "browser";
  const os = /iPhone|iPad/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : /Windows/.test(ua) ? "windows" : /Mac OS X/.test(ua) ? "macos" : /Linux/.test(ua) ? "linux" : "unknown os";
  return `${browser} · ${os}`;
}

export default function AuditLog({ onResume }) {
  const [shown, setShown] = useState(0);
  const btnRef = useRef(null);

  const log = useMemo(() => {
    const start = Date.now();
    const at = (ms) => new Date(start + ms);
    const session = hex(6);
    const badge = `${hex(4)}-${hex(4)}`;
    const jti = hex(8);
    const corr = `${hex(8)}-${hex(4)}-${hex(4)}`;
    const visit = Math.round(performance.now() / 1000);
    const who = client();
    // what this visitor actually did, grouped so the log stays short
    const tr = readTrace(), visitStart = new Date(Date.now() - performance.now());
    const mine = [{ t: visitStart, id: "TR-1000", ev: "session.start", detail: `visitor (guest) · scope read:public · ${who}`, res: "success" }];
    const reads = tr.filter((e) => e.key === "section");
    if (reads.length) {
      const names = [...new Set(reads.map((e) => e.detail))];
      mine.push({ t: new Date(reads[0].t), id: "TR-1100", ev: "access.read", detail: `${names.length} section${names.length > 1 ? "s" : ""} · ${names.join(", ")}`, res: "allow" });
    }
    const denied = tr.filter((e) => e.ev === "authn.code_attempt");
    if (denied.length) mine.push({ t: new Date(denied[denied.length - 1].t), id: "TR-1400", ev: "authn.code_attempt", detail: `resume access code rejected ×${denied.length} · stayed restricted`, res: "denied" });
    tr.filter((e) => !e.key && e.ev !== "authn.code_attempt").forEach((e, i) => mine.push({ t: new Date(e.t), id: `TR-15${i}0`, ev: e.ev, detail: e.detail, res: e.res }));
    mine.sort((x, y) => x.t - y.t);
    const findings = denied.length;
    const events = [
      ...mine,
      { t: at(0), id: "AC-4101", ev: "device.badge_read", detail: `badge ${badge} · magnetic stripe · track 2 · checksum ok`, res: "success" },
      { t: at(31), id: "AC-4624", ev: "authn.session", detail: "actor visitor (guest) · method badge · mfa not required for guest", res: "success" },
      { t: at(58), id: "AC-4672", ev: "authz.policy_eval", detail: "role visitor · scope read:public · policy least-privilege", res: "allow" },
      { t: at(74), id: "AC-4673", ev: "priv.check", detail: "elevation requested: none · admin rights: none", res: "pass" },
      { t: at(112), id: "AC-4634", ev: "authn.sign_out", detail: `user-initiated · session ${duration(visit * 1000)} · ${who}`, res: "success" },
      { t: at(139), id: "AC-4769", ev: "token.revoke", detail: `access token ${jti} · refresh token ${hex(8)}`, res: "revoked" },
      { t: at(170), id: "AC-5001", ev: "review.complete", detail: findings ? `least privilege upheld · ${findings} failed code attempt${findings > 1 ? "s" : ""} logged` : "least privilege upheld · 0 findings", res: "closed" },
    ];
    const raw = {
      eventId: "AC-4634",
      event: "authn.sign_out",
      time: iso(at(112)),
      level: "info",
      correlationId: corr,
      session,
      actor: { type: "visitor", role: "visitor" },
      client: who,
      durationSeconds: visit,
      reason: "user_initiated_badge_swipe",
      result: "success",
    };
    return { session, corr, events, raw, warnings: findings };
  }, []);

  const done = shown >= log.events.length;

  useEffect(() => {
    document.documentElement.classList.add("is-locked");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers = reduce
      ? [setTimeout(() => setShown(log.events.length), 0)]
      : log.events.map((_, i) => setTimeout(() => setShown(i + 1), 500 + i * 260));
    return () => {
      document.documentElement.classList.remove("is-locked");
      timers.forEach(clearTimeout);
    };
  }, [log]);

  useEffect(() => { if (done) btnRef.current?.focus({ preventScroll: true }); }, [done]);

  const restart = () => {
    track("session-audit-new-session", "Started a new session from the audit log");
    clearTrace();
    onResume();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") restart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div className="audit" role="dialog" aria-modal="true" aria-label="Session audit log">
      <div className="audit__panel mono tf">
        {/* toolbar */}
        <header className="audit__bar">
          <span className="audit__title">trace · <span className="audit__title-long">identity </span>audit log</span>
          <span className={`audit__live ${done ? "is-closed" : ""}`}>
            <i aria-hidden="true" />{done ? "session closed" : "live"}
          </span>
        </header>

        {/* search bar with the query, and filter chips, as a log viewer shows them */}
        <div className="audit__query">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
          <code>source=&quot;access-control&quot; session=&quot;{log.session}&quot;</code>
          <span className="audit__count">{shown} {shown === 1 ? "event" : "events"}</span>
        </div>
        <div className="audit__filters">
          <span>source: <b>access-control</b></span>
          <span>range: <b>this session</b></span>
          <span>level: <b>all</b></span>
          <span className="audit__corr">correlation id: <b>{log.corr}</b></span>
        </div>

        {/* events */}
        <div className="audit__table" role="table" aria-label="Audit events">
          <div className="audit__row audit__row--head" role="row">
            <span role="columnheader">time</span>
            <span role="columnheader">event id</span>
            <span role="columnheader">level</span>
            <span role="columnheader">event</span>
            <span role="columnheader">details</span>
            <span role="columnheader" className="audit__res">result</span>
          </div>
          {log.events.slice(0, shown).map((e) => (
            <div key={e.id} className="audit__row" role="row">
              <span className="audit__t" role="cell" title={iso(e.t)}>{clock(e.t)}</span>
              <span className="audit__id" role="cell">{e.id}</span>
              <span className="audit__lvl" role="cell"><span className="audit__pill audit__pill--info">INFO</span></span>
              <span className="audit__ev" role="cell">{e.ev}</span>
              <span className="audit__detail" role="cell">{e.detail}</span>
              <span className="audit__res" role="cell"><span className={`audit__pill ${e.res === "denied" ? "audit__pill--deny" : "audit__pill--ok"}`}>{e.res}</span></span>
            </div>
          ))}
          {!done && <div className="audit__cursor" aria-hidden="true" />}
        </div>

        {/* summary + raw record of the sign-out */}
        <div className={`audit__after ${done ? "is-done" : ""}`}>
          <p className="audit__summary">
            <span className="audit__pill audit__pill--ok">{log.events.length} events</span>
            <span className={`audit__pill ${log.warnings ? "audit__pill--deny" : ""}`}>{log.warnings} warning{log.warnings === 1 ? "" : "s"}</span>
            <span className="audit__pill">0 errors</span>
            <span>access closed</span>
          </p>
          <details className="audit__raw">
            <summary>raw event · AC-4634 authn.sign_out</summary>
            <pre>{JSON.stringify(log.raw, null, 2)}</pre>
          </details>
          <div className="audit__foot">
            <p>Thanks for visiting.</p>
            <div className="audit__actions">
              <a
                className="audit__hq"
                href="hq/"
                tabIndex={done ? 0 : -1}
                onClick={() => track("session-audit-enter-hq", "Entered TRACE HQ from the audit log")}
              >
                enter TRACE HQ
              </a>
              <button ref={btnRef} type="button" onClick={restart} disabled={!done}>
                start a new session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
