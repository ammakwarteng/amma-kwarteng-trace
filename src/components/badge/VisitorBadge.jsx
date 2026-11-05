import { useRef, useState } from "react";
import { track } from "../../track.js";
import "./VisitorBadge.css";

/*
  The end of the trace: a visitor badge you swipe through a reader to sign
  out. The card flies off, the light turns green, then the visitor is sent
  to Google. Nothing is locked behind it. Drag the card across the reader
  (mouse or finger), or use the button for keyboard and screen readers.
*/
const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

export default function VisitorBadge() {
  const [x, setX] = useState(0);          // card offset in px while dragging
  const [state, setState] = useState("idle"); // idle | reading | granted
  const drag = useRef(null);
  const trackRef = useRef(null);

  // stop with the card half-way into the reader so its light stays visible
  const CARD = 196, READER = 64;
  const max = () => (trackRef.current ? trackRef.current.clientWidth - READER - CARD + 22 : 300);

  const grant = () => {
    if (state === "granted") return;
    setState("granted");
    // carry on through the reader and off the screen
    const t = trackRef.current?.getBoundingClientRect();
    setX(t ? window.innerWidth - t.left + 40 : 1200);
    track("visitor-badge-swiped", "Visitor badge swiped at the end of the trace");
    // signed out: leave the site once the card has gone (google.com shows
    // each visitor their own country's results)
    setTimeout(() => window.location.assign("https://www.google.com/"), 1600);
  };

  const onDown = (e) => {
    if (state === "granted") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { start: e.clientX - x };
    setState("reading");
  };
  const onMove = (e) => {
    if (!drag.current) return;
    setX(Math.max(0, Math.min(max(), e.clientX - drag.current.start)));
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (x > max() * 0.85) grant();
    else { setX(0); setState("idle"); }
  };

  const status = state === "granted" ? "signing out…" : state === "reading" ? "reading badge…" : "swipe your badge to sign out";

  return (
    <section className={`badge is-${state}`} aria-label="Visitor badge">
      <div className="badge__track" ref={trackRef}>
        <div className="badge__reader" aria-hidden="true">
          <span className="badge__light" />
          <span className="badge__slot" />
        </div>
        <div
          className="badge__card"
          style={{ transform: `translateX(${x}px)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-hidden="true"
        >
          <span className="badge__chip" />
          <span className="badge__role mono">visitor</span>
          <span className="badge__name">guest</span>
          <span className="badge__meta mono">access · guest<br />{today}</span>
          <svg className="badge__mark" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="9" />
            <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
            <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
          </svg>
        </div>
      </div>
      <p className="badge__status mono" role="status" aria-live="polite">{status}</p>
      {state !== "granted" && (
        <button type="button" className="badge__btn mono" onClick={grant}>swipe badge</button>
      )}
    </section>
  );
}
