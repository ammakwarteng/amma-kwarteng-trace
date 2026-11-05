import { useRef, useState } from "react";
import { track } from "../../track.js";
import { beep, buzz, swoosh } from "./sound.js";
import LockScreen from "./LockScreen.jsx";
import "./VisitorBadge.css";

/*
  The end of the trace: a visitor ID badge you swipe through a reader to sign
  out. The card's magnetic stripe edge rides in the reader's groove; on access
  the reader beeps, its white LED lights and the card swooshes off, then the
  TRACE-VM lock screen
  appears. Nothing on the site is locked behind it. Drag the card across the
  reader (mouse or finger), or use the button for keyboard and screen readers.
*/
const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

export default function VisitorBadge() {
  const [x, setX] = useState(0);              // card offset in px
  const [tilt, setTilt] = useState(0);        // degrees, follows drag direction
  const [state, setState] = useState("idle"); // idle | reading | granted
  const [locked, setLocked] = useState(false);
  const drag = useRef(null);
  const trackRef = useRef(null);

  // travel along the reader's groove to its far end
  const CARD = 220;
  const max = () => (trackRef.current ? trackRef.current.clientWidth - CARD - 10 : 300);

  const grant = () => {
    if (state === "granted") return;
    setState("granted");
    setTilt(0);
    beep();
    swoosh();
    buzz();
    // carry on through the reader and off the screen
    const t = trackRef.current?.getBoundingClientRect();
    setX(t ? window.innerWidth - t.left + 40 : 1200);
    track("visitor-badge-swiped", "Visitor badge swiped at the end of the trace");
    setTimeout(() => setLocked(true), 1100);
  };

  // back from TRACE-VM: reset the badge and return to the top of the trace
  const resume = () => {
    setLocked(false);
    setX(0);
    setState("idle");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
  };

  const onDown = (e) => {
    if (state === "granted") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { start: e.clientX - x, last: e.clientX };
    setState("reading");
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.last;
    drag.current.last = e.clientX;
    setTilt((t) => Math.max(-2, Math.min(2, t * 0.6 + dx * 0.25)));
    setX(Math.max(0, Math.min(max(), e.clientX - drag.current.start)));
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setTilt(0);
    if (x > max() * 0.85) grant();
    else { setX(0); setState("idle"); }
  };

  const status = state === "granted" ? "signing out…" : state === "reading" ? "reading badge…" : "swipe your badge to sign out";

  return (
    <section className={`badge is-${state}`} aria-label="Visitor badge">
      <div className="badge__track" ref={trackRef}>
        <div className="badge__groove" aria-hidden="true" />
        <div
          className="badge__card"
          style={{ transform: `translateX(${x}px) rotate(${tilt}deg)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-hidden="true"
        >
          <span className="badge__ticks" />
          <span className="badge__head">
            <span className="badge__brand">
              <span className="badge__org">TRACE</span>
              <span className="badge__sub mono">SECURE ACCESS CREDENTIAL</span>
            </span>
            <svg className="badge__mark" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="9" />
              <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
              <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
            </svg>
          </span>
          <span className="badge__foot mono">
            <span>ACCESS CONTROL</span>
            <span>SWIPE TO SIGN OUT →</span>
          </span>
          <span className="badge__stripe" />
          <span className="badge__shine" />
        </div>
        <div className="badge__reader" aria-hidden="true">
          <span className="badge__trim" />
          <span className="badge__face">
            <span className="badge__light" />
            <span className="badge__label mono">TRACE</span>
            <span className="badge__screws"><i /><i /></span>
          </span>
        </div>
      </div>
      <p className="badge__status mono" role="status" aria-live="polite">{status}</p>
      {state !== "granted" && (
        <button type="button" className="badge__btn mono" onClick={grant}>swipe badge</button>
      )}
      {locked && <LockScreen onResume={resume} />}
    </section>
  );
}
