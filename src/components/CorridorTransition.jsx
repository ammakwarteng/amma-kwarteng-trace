import { useEffect, useRef, useState } from "react";
import { leaveTrace } from "../trace.js";
import "./CorridorTransition.css";

/*
  02-04 of the TRACE sequence: after the hero, the Higgsfield corridor clip walks up to the security
  door (plays once, muted, when it scrolls into view). The trace line runs down through the corridor
  as you approach. When the clip ends, authentication runs on its own:
    verifying credential -> access granted -> door unlocked
  then the door dissolves into the existing About section (and the page eases down to it, unless the
  visitor has scrolled away). No fake door-opening. Reduced motion: final frame, already unlocked.
*/
const BASE = import.meta.env.BASE_URL;
const STEPS = ["verifying credential", "access granted", "door unlocked"];

export default function CorridorTransition() {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [step, setStep] = useState(-1);          // -1 locked, 0..2 auth steps
  const [progress, setProgress] = useState(0);   // 0..1, the trace line's length
  const [reduce, setReduce] = useState(false);
  const [lineX, setLineX] = useState("50%");

  // the line sits where the trace continues below (centre on laptops, the first node on phones)
  useEffect(() => {
    const place = () => {
      const node = document.querySelector("#about [data-node]"), el = wrap.current;
      if (!node || !el) return;
      setLineX(innerWidth < 761 ? `${node.getBoundingClientRect().left + node.offsetWidth / 2 - el.getBoundingClientRect().left}px` : "50%");
    };
    place(); addEventListener("resize", place); const t = setTimeout(place, 800);
    return () => { removeEventListener("resize", place); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const r = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (r) { setStep(2); setProgress(1); return; }
    const v = vid.current, el = wrap.current;
    if (!v || !el) return;
    let played = false, userMoved = false, timers = [];
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.45 && !played) {
        played = true;
        v.play().catch(() => authenticate());
      }
    }, { threshold: [0, 0.45, 0.8] });
    io.observe(el);
    const onTime = () => setProgress(v.duration ? v.currentTime / v.duration : 0);
    const markMoved = () => { userMoved = true; };
    const authenticate = () => {
      setProgress(1);
      setStep(0);
      timers.push(setTimeout(() => setStep(1), 1200));
      timers.push(setTimeout(() => { setStep(2); leaveTrace("door.unlock", "secure area door unlocked for the visitor", "granted"); }, 2000));
      // enter the portfolio: ease down to About, unless the visitor has already scrolled on
      userMoved = false;
      addEventListener("wheel", markMoved, { passive: true, once: true });
      addEventListener("touchmove", markMoved, { passive: true, once: true });
      timers.push(setTimeout(() => {
        const b = el.getBoundingClientRect();
        if (!userMoved && b.top < innerHeight * 0.5 && b.bottom > innerHeight * 0.4) document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 3100));
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", authenticate);
    return () => { io.disconnect(); v.removeEventListener("timeupdate", onTime); v.removeEventListener("ended", authenticate); timers.forEach(clearTimeout); removeEventListener("wheel", markMoved); removeEventListener("touchmove", markMoved); };
  }, []);

  const state = step < 0 ? "locked" : step < 2 ? "verifying" : "unlocked";
  return (
    <section className={`corridor is-${state}`} ref={wrap} aria-label="Entering the secure area" style={{ "--line-x": lineX, "--progress": progress }}>
      {reduce ? (
        <img className="corridor__media" src={`${BASE}videos/trace-corridor-end.jpg`} alt="" />
      ) : (
        <video ref={vid} className="corridor__media" src={`${BASE}videos/trace-corridor.mp4`} poster={`${BASE}videos/trace-corridor-poster.jpg`} muted playsInline preload="metadata" aria-hidden="true" />
      )}
      <span className="corridor__fade" aria-hidden="true" />
      <span className="corridor__line" aria-hidden="true" />
      <div className="corridor__auth mono" role="status" aria-live="polite">
        {step < 0 ? (
          <p className="corridor__row is-locked"><i aria-hidden="true" />secure area · locked</p>
        ) : (
          STEPS.map((s, i) => i <= step && (
            <p key={s} className={`corridor__row ${i < step || step === 2 ? "is-done" : "is-active"}`}><i aria-hidden="true" />{s}</p>
          ))
        )}
      </div>
    </section>
  );
}
