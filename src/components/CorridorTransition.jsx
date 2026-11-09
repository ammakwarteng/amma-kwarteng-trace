import { useEffect, useRef, useState } from "react";
import { leaveTrace } from "../trace.js";
import "./CorridorTransition.css";

/*
  Cinematic transition between the hero and About: a Higgsfield corridor clip walks up to the
  security door. It plays once (muted) when it scrolls into view. When it ends, the reader beside
  the door verifies the visitor and the door reads "unlocked" - then the frame dissolves into the
  page below, rather than faking a door-opening the clip doesn't show.
  Reduced motion: no video, just the final frame with the door already unlocked.
*/
const SRC = `${import.meta.env.BASE_URL}videos/trace-corridor.mp4`;
const POSTER = `${import.meta.env.BASE_URL}videos/trace-corridor-poster.jpg`;
const END = `${import.meta.env.BASE_URL}videos/trace-corridor-end.jpg`;

export default function CorridorTransition() {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [state, setState] = useState("locked"); // locked -> verifying -> unlocked
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const r = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (r) { setState("unlocked"); return; }
    const v = vid.current, el = wrap.current;
    if (!v || !el) return;
    let played = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.45 && !played) {
        played = true;
        v.play().catch(() => setState("unlocked"));   // autoplay blocked: show the end state
      }
    }, { threshold: [0, 0.45, 0.8] });
    io.observe(el);
    const onEnd = () => {
      setState("verifying");
      setTimeout(() => { setState("unlocked"); leaveTrace("door.unlock", "secure area door unlocked for the visitor", "granted"); }, 1100);
    };
    v.addEventListener("ended", onEnd);
    return () => { io.disconnect(); v.removeEventListener("ended", onEnd); };
  }, []);

  return (
    <section className={`corridor is-${state}`} ref={wrap} aria-label="Entering the secure area">
      {reduce ? (
        <img className="corridor__media" src={END} alt="" />
      ) : (
        <video ref={vid} className="corridor__media" src={SRC} poster={POSTER} muted playsInline preload="metadata" aria-hidden="true" />
      )}
      <span className="corridor__fade" aria-hidden="true" />
      <p className="corridor__status mono" role="status" aria-live="polite">
        <i aria-hidden="true" />
        {state === "locked" ? "secure area · locked" : state === "verifying" ? "verifying credential…" : "access granted · door unlocked"}
      </p>
    </section>
  );
}
