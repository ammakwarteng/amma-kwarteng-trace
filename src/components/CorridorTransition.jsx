import { useEffect, useRef, useState } from "react";
import { leaveTrace } from "../trace.js";
import { corridorMedia } from "../data/site.js";
import "./CorridorTransition.css";

/*
  The TRACE cinematic transition, as a full-screen layer (not a section on the page):
    hero -> scroll past it -> a full-viewport corridor fades in over everything and plays
    -> verifying credential -> access granted -> the door opens
    -> behind the still-covered screen the page moves to About, then the layer fades away.
  A spacer one screen tall gives the scroll its room; it collapses once the visitor is through,
  so About follows the hero directly afterwards. Scrolling back up before it plays returns to the
  hero; "skip" goes straight in. Reduced motion: no layer at all (hero, then About).
*/
const BASE = import.meta.env.BASE_URL;
const DOOR = corridorMedia.doorOpen ? `${BASE}${corridorMedia.doorOpen}` : "";

export default function CorridorTransition() {
  const spacer = useRef(null);
  const vid = useRef(null);
  const door = useRef(null);
  const [reduce] = useState(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [phase, setPhase] = useState("idle");   // idle | corridor | verifying | granted | opening | leaving | done
  const [show, setShow] = useState(false);       // the full-screen layer is visible
  const [progress, setProgress] = useState(0);
  const [lineX, setLineX] = useState("50%");
  const timers = useRef([]);
  const phaseRef = useRef(phase); phaseRef.current = phase;

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  // finish: cover stays up, the page jumps to About underneath, then the layer fades out
  const finish = (skipped) => {
    if (phaseRef.current === "leaving" || phaseRef.current === "done") return;
    setPhase("leaving");
    leaveTrace("door.unlock", skipped ? "visitor skipped into the secure area" : "secure area door opened for the visitor", "granted");
    later(() => {
      setPhase("done");                                   // spacer collapses
      requestAnimationFrame(() => {
        const about = document.getElementById("about");
        if (about) window.scrollTo({ top: about.getBoundingClientRect().top + scrollY - 70, behavior: "instant" });
        later(() => setShow(false), 60);
      });
    }, 350);
  };

  const start = () => {
    if (phaseRef.current !== "idle") return;
    setPhase("corridor"); setShow(true);
    const v = vid.current;
    if (door.current) door.current.preload = "auto";
    v.currentTime = 0;
    later(() => v.play().catch(() => authenticate()), 650);   // starts once the hero has faded out
  };
  const authenticate = () => {
    setProgress(1); setPhase("verifying");
    later(() => setPhase("granted"), 1200);
    if (DOOR && door.current) {
      later(() => {
        door.current.play().then(() => setPhase("opening")).catch(() => finish(false));
      }, 2000);
    } else later(() => finish(false), 2600);
  };

  // place the trace line where the route continues (centre on laptops, the first node on phones)
  useEffect(() => {
    const place = () => {
      const node = document.querySelector("#about [data-node]");
      setLineX(innerWidth < 761 && node ? `${node.getBoundingClientRect().left + node.offsetWidth / 2}px` : "50%");
    };
    place(); addEventListener("resize", place); const t = setTimeout(place, 900);
    return () => { removeEventListener("resize", place); clearTimeout(t); };
  }, []);

  // scroll trigger: once the hero has mostly scrolled away, take over the screen
  useEffect(() => {
    if (reduce) return;
    const onScroll = () => {
      const s = spacer.current; if (!s) return;
      const r = s.getBoundingClientRect(), p = phaseRef.current;
      if (p === "idle" && r.top < innerHeight * 0.9) start();   // as soon as the hero starts to leave, it dissolves into the corridor
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { removeEventListener("scroll", onScroll); timers.current.forEach(clearTimeout); };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const v = vid.current, d = door.current;
    const onTime = () => setProgress(v.duration ? v.currentTime / v.duration : 0);
    v.addEventListener("timeupdate", onTime); v.addEventListener("ended", authenticate);
    d?.addEventListener("ended", () => finish(false));
    return () => { v.removeEventListener("timeupdate", onTime); v.removeEventListener("ended", authenticate); };
  }, [reduce]);

  // while the layer is up, the page underneath doesn't scroll
  useEffect(() => {
    document.documentElement.classList.toggle("is-cinema", show && phase !== "idle");
    return () => document.documentElement.classList.remove("is-cinema");
  }, [show, phase]);

  if (reduce) return null;
  const rows = phase === "verifying" ? [["verifying credential", "active"]]
    : ["granted", "opening", "leaving"].includes(phase) ? [["verifying credential", "done"], ["access granted", "done"]] : [];
  return (
    <>
      <div ref={spacer} className={`cinema-spacer ${phase === "done" ? "is-collapsed" : ""}`} aria-hidden="true" />
      <div className={`cinema ${show ? "is-on" : ""} is-${phase}`} style={{ "--line-x": lineX, "--progress": progress }} role="region" aria-label="Entering the secure area" aria-hidden={!show}>
        <video ref={vid} className="cinema__media" src={`${BASE}videos/trace-corridor.mp4`} poster={`${BASE}videos/trace-corridor-poster.jpg`} muted playsInline preload="auto" aria-hidden="true" />
        {DOOR && <video ref={door} className={`cinema__media cinema__door ${["opening", "leaving"].includes(phase) ? "is-on" : ""}`} src={DOOR} muted playsInline preload="metadata" aria-hidden="true" />}
        <span className="cinema__shade" aria-hidden="true" />
        <span className="cinema__line" aria-hidden="true" />
        <div className="cinema__auth mono" role="status" aria-live="polite">
          {rows.map(([t, s]) => <p key={t} className={`cinema__row is-${s}`}><i aria-hidden="true" />{t}</p>)}
        </div>
        <button type="button" className="cinema__skip mono" onClick={() => finish(true)} tabIndex={show ? 0 : -1}>skip →</button>
      </div>
    </>
  );
}
