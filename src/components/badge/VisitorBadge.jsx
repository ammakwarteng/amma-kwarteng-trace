import { useEffect, useRef, useState } from "react";
import { track } from "../../track.js";
import { beep, buzz, installAudioUnlock, setScrapeSpeed, startScrape, stopScrape, swoosh, unlockAudio } from "./sound.js";
import AuditLog from "./AuditLog.jsx";
import "./VisitorBadge.css";

/*
  The end of the trace: a visitor ID badge you swipe through a reader to sign
  out. The card's magnetic stripe edge rides in the reader's groove; on access
  the reader beeps, its LED turns green and the card swooshes off, then the
  session audit log appears. Nothing on the site is locked behind it. Drag the card across the
  reader (mouse or finger), or use the button for keyboard and screen readers.
*/
const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

export default function VisitorBadge() {
  const [x, setX] = useState(0);              // card offset in px
  const [tilt, setTilt] = useState(0);        // degrees, follows drag direction
  const [state, setState] = useState("idle"); // idle | reading | granted
  const [locked, setLocked] = useState(false);
  const [glint, setGlint] = useState({ x: 30, y: 20 }); // highlight position on the card, %
  const drag = useRef(null);
  const trackRef = useRef(null);

  // get audio ready on the visitor's first tap anywhere, so the swipe has sound
  useEffect(() => { installAudioUnlock(); return () => stopScrape(); }, []);

  // travel along the reader's groove to its far end
  // (the card is bigger on laptops, so read its width from the page)
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(window.innerWidth > 1100 ? Math.min(1.7, Math.max(1, window.innerWidth / 1400)) : 1);
    fit(); addEventListener("resize", fit); return () => removeEventListener("resize", fit);
  }, []);
  const max = () => {
    const t = trackRef.current;
    if (!t) return 300;
    const card = t.querySelector(".badge__card")?.offsetWidth || 220;
    return t.clientWidth - card - 10;
  };

  const grant = () => {
    if (state === "granted") return;
    setState("granted");
    setTilt(0);
    beep();
    swoosh();
    buzz();
    // carry on through the reader and off the screen
    const t = trackRef.current?.getBoundingClientRect();
    setX(t ? (window.innerWidth - t.left) / scale + 40 : 1200);
    track("visitor-badge-swiped", "Visitor badge swiped at the end of the trace");
    setTimeout(() => setLocked(true), 1100);
  };

  // back from the audit log: start a fresh session (the intro plays again)
  const resume = () => {
    window.dispatchEvent(new Event("trace:new-session"));
  };

  const onDown = (e) => {
    if (state === "granted") return;
    unlockAudio();
    startScrape();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { start: e.clientX / scale - x, last: e.clientX };
    setState("reading");
  };
  const onHover = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setGlint({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onMove = (e) => {
    onHover(e);
    if (!drag.current) return;
    const dx = e.clientX - drag.current.last;
    drag.current.last = e.clientX;
    setScrapeSpeed(dx / scale);
    setTilt((t) => Math.max(-2, Math.min(2, t * 0.6 + dx * 0.25)));
    setX(Math.max(0, Math.min(max(), e.clientX / scale - drag.current.start)));
  };
  const onUp = () => {
    if (!drag.current) return;
    unlockAudio();
    stopScrape();
    drag.current = null;
    setTilt(0);
    if (x > max() * 0.85) grant();
    else { setX(0); setState("idle"); }
  };

  const status = state === "granted" ? "signing out…" : state === "reading" ? "reading badge…" : "swipe your badge to sign out";

  return (
    <section className={`badge is-${state}`} id="leave" aria-labelledby="leave-title">
      <header className="badge__intro">
        <h2 className="badge__title" id="leave-title">leave your trace.</h2>
        <p className="badge__hint mono">swipe your credential through the reader to end the session</p>
      </header>
      <div className="badge__track" ref={trackRef} style={scale > 1 ? { transform: `scale(${scale})`, marginTop: `${(scale - 1) * 244}px` } : undefined}>
        <div className="badge__groove" aria-hidden="true">
          <span className="badge__readhead" />
        </div>
        <div
          className="badge__card"
          style={{ transform: `translateX(${x}px) rotate(${tilt}deg)`, "--gx": `${glint.x}%`, "--gy": `${glint.y}%` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onTouchEnd={unlockAudio}
          role="button"
          tabIndex={state === "granted" ? -1 : 0}
          aria-label="Access card: swipe to sign out"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlockAudio(); grant(); } }}
        >
          <span aria-hidden="true" className="badge__ticks" />
          <span aria-hidden="true" className="badge__head">
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
          <span aria-hidden="true" className="badge__foot mono">
            <span>ACCESS CONTROL</span>
            <span>SWIPE TO SIGN OUT →</span>
          </span>
          <span aria-hidden="true" className="badge__stripe" />
          <span className="badge__glint" aria-hidden="true" />
          <span className="badge__shine" aria-hidden="true" />
        </div>
        <div className="badge__reader" aria-hidden="true">
          <span className="badge__trim" />
          <span className="badge__face">
            <span className="badge__light" />
            <span className="badge__screws"><i /><i /></span>
          </span>
        </div>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{state === "idle" ? "" : status}</p>
      {locked && <AuditLog onResume={resume} />}
    </section>
  );
}
