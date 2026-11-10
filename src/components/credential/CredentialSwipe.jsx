import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { leaveTrace } from "../../trace.js";
import { track } from "../../track.js";
import "./CredentialSwipe.css";

/*
  TRACE credential swipe.
  The hero wordmark (passed in as children, unchanged) is printed on a thin black credential
  whose magnetic-stripe edge rides in the slot of a slim reader. Drag it to the right through the
  reader (mouse or finger): the reader's head and light respond while the stripe passes, and a
  completed swipe shows VERIFYING CREDENTIAL… then ACCESS GRANTED and the card comes back to rest
  in the hero (the page does not move). An incomplete swipe springs back.
  - Nothing is locked: this is an interaction, not a login.
  - Keyboard / screen readers: the "swipe the credential" button does the same swipe.
  - Reduced motion: no dragging or travel; the button shows the messages.
  - Vertical touch gestures still scroll the page; once a horizontal swipe has started, the page
    stays put until the finger lifts.
*/
const VERIFY_MS = 950;
const GRANT_MS = 1000;

export default function CredentialSwipe({ children }) {
  const reduce = useReducedMotion();
  const track$ = useRef(null);
  const card = useRef(null);
  const x = useMotionValue(0);
  const [range, setRange] = useState({ out: 900, threshold: 160, back: 900 });
  const [phase, setPhase] = useState("idle"); // idle | reading | verifying | granted
  const [hinted, setHinted] = useState(false);  // the rest-position nudge runs until first touch
  const dragging = useRef(false);
  const busy = phase === "verifying" || phase === "granted";

  // how far the card travels: from rest until its trailing edge has passed the end of the reader
  useEffect(() => {
    const measure = () => {
      const t = track$.current?.getBoundingClientRect(), c = card.current?.getBoundingClientRect();
      if (!t || !c) return;
      const restLeft = c.left - x.get();                 // card position at rest
      const out = innerWidth - restLeft + 24;           // fully off the right edge of the screen
      const back = restLeft + c.width + 24;             // fully off the left edge, for the return
      setRange({ out, back, threshold: Math.min(out * 0.42, Math.max(120, c.width * 0.55)) });
    };
    measure();
    addEventListener("resize", measure);
    document.fonts?.ready?.then(measure);
    return () => removeEventListener("resize", measure);
  }, [x]);

  // the reader reacts while the stripe passes over its head
  useMotionValueEvent(x, "change", (v) => {
    if (busy) return;
    const reading = v > 6;
    setPhase((p) => (p === "idle" && reading ? "reading" : p === "reading" && !reading ? "idle" : p));
  });
  const progress = useTransform(x, [0, range.threshold], [0, 1], { clamp: true });
  const headGlow = useTransform(progress, [0, 0.15, 1], [0, 0.55, 1]);

  // keep the page from scrolling under a horizontal swipe on touch screens
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const block = (e) => { if (dragging.current) e.preventDefault(); };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  const complete = async () => {
    if (busy) return;
    setHinted(true);
    setPhase("verifying");
    leaveTrace("authn.credential_swipe", "trace credential swiped at the hero reader", "granted");
    track("hero-credential-swiped", "TRACE credential swiped in the hero");
    if (!reduce) await animate(x, range.out, { duration: 0.45, ease: [0.4, 0, 0.9, 0.6] });
    await new Promise((r) => setTimeout(r, VERIFY_MS));
    setPhase("granted");
    await new Promise((r) => setTimeout(r, reduce ? GRANT_MS : 450));
    if (!reduce) {
      x.set(-range.back);                                   // the card comes back in from the left, at rest
      await animate(x, 0, { type: "spring", stiffness: 120, damping: 20, mass: 0.9 });
    }
    // stays in the hero: visitors scroll on to the portfolio when they are ready
    setTimeout(() => setPhase("idle"), reduce ? 1200 : 1400);
  };

  const onDragStart = () => { dragging.current = true; setHinted(true); };
  const onDragEnd = () => {
    dragging.current = false;
    if (x.get() >= range.threshold) complete();
    else animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });   // incomplete: back to rest
  };

  const message = { verifying: "verifying credential…", granted: "access granted" }[phase] || "";

  return (
    <div className={`cred is-${phase} ${reduce ? "is-still" : ""}`} ref={track$}>
      <div className="cred__foot">
        <p className="cred__status" role="status" aria-live="polite">{message}</p>
        <button type="button" className="cred__key" onClick={complete} disabled={busy}>
          swipe the credential
        </button>
      </div>
      <div className="cred__stage">
        <motion.div
          ref={card}
          className="cred__card"
          style={{ x }}
          drag={reduce || busy ? false : "x"}
          dragDirectionLock
          dragConstraints={{ left: 0, right: range.out }}
          dragElastic={{ left: 0.06, right: 0 }}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className={`cred__body ${!hinted && !reduce ? "is-hinting" : ""}`}>
          <div className="cred__face">
            <p className="cred__top" aria-hidden="true">
              <span>trace · access credential</span>
              <svg viewBox="0 0 32 32" className="cred__mark"><circle cx="16" cy="16" r="9" /><path d="M16 3v7M16 22v7M3 16h7M22 16h7" /><path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" /></svg>
            </p>
            <div className="cred__word">{children}</div>
            <p className="cred__bottom" aria-hidden="true">
              <span>holder · amma kwarteng</span>
              <span className="cred__cue">swipe →</span>
            </p>
          </div>
          <span className="cred__stripe" aria-hidden="true" />
          </div>
        </motion.div>

        {/* the reader: the card's stripe edge sits in its slot */}
        <div className="cred__reader" aria-hidden="true">
          <span className="cred__slot" />
          <motion.span className="cred__head" style={{ opacity: headGlow }} />
          <span className="cred__light" />
        </div>
      </div>

    </div>
  );
}
