import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import POSES from "./poses.json";
import "./intro.css";

gsap.registerPlugin(ScrollTrigger);

/*
  "Under the umbrella": the scroll-driven intro film (rough version).
  One pinned stage holds a 1600 x 900 drawing; the scroll scrubs one master timeline from 0 to 100.
    01  0–14   the beginning: ground line, she opens the umbrella, rain
    →   12–21  the camera rises into the canopy; its ribs become the arches of a hall
    02  20–31  beneath the umbrella: a hall of arches, she looks up
    →   29–35  the floor becomes one horizon line
    03  35–69  different worlds: the panorama passes while she walks (walk frames follow the scroll)
    →   66–72  the horizon frays into paths
    04  72–86  finding a direction: gates glint red, the fingerprint doorway turns green, she reaches
    →   86–92  the camera pulls back
    05  90–100 the reveal: TRACE lands exactly on the site's own title, the stage fades, the site remains
  Artwork: public/intro (Higgsfield originals, cleaned and cut). Everything else is drawn here.
*/
const BASE = import.meta.env.BASE_URL;
const src = (n) => `${BASE}intro/${n}.webp`;
const K = 0.43;                      // canvas units per artwork pixel: every pose came off one sheet at one scale
const WALK = ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"];
const RAIN = Array.from({ length: 14 }, (_, i) => ({ x: 160 + i * 97 + (i % 3) * 23, d: (i * 0.37) % 1.4, h: 70 + (i % 4) * 22 }));
const GATES = [{ x: 300, y: 430 }, { x: 560, y: 380 }, { x: 1040, y: 380 }, { x: 1300, y: 430 }];
const DOOR = { x: 800, y: 330 };

// a figure standing with its feet on (x, feetY); its body (not its umbrella) is centred on x
function Figure({ name, x, feetY, scale = 1, className = "", hidden = false }) {
  const p = POSES[name];
  const w = p.w * K * scale, h = p.h * K * scale;
  return (
    <image href={src(name)} x={x - p.cx * w} y={feetY - h} width={w} height={h}
      className={`fig ${className}`} data-pose={name} style={hidden ? { opacity: 0 } : undefined} />
  );
}

function ridges(cx, cy, rx, ry, n) {
  return Array.from({ length: n }, (_, i) => {
    const k = (i + 1) / n;
    return <ellipse key={i} cx={cx} cy={cy + (1 - k) * ry * 0.18} rx={rx * k} ry={ry * k} pathLength="1" className="ink draw door__ridge" />;
  });
}

export default function IntroFilm({ onDone }) {
  const wrap = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const word = useRef(null);
  const [skipVisible, setSkipVisible] = useState(true);

  // fit the 1600 x 900 drawing to the screen: whole frame on laptops, the centre 800 units on phones
  useLayoutEffect(() => {
    const fit = () => {
      const vw = innerWidth, vh = stage.current.clientHeight;
      const portrait = vh > vw;
      const s = portrait ? Math.min(vw / 820, vh / 900) : Math.min(vw / 1600, vh / 900) * 1.02;
      canvas.current.style.setProperty("--s", s.toFixed(4));
      // TRACE lands where the site's own title is (the hero sits right under the last frame)
      const title = document.querySelector(".dhero__word");
      const hero = document.querySelector(".dhero");
      if (title && hero && word.current) {
        const t = title.getBoundingClientRect(), h = hero.getBoundingClientRect();
        const cs = getComputedStyle(title);
        Object.assign(word.current.style, { top: `${t.top - h.top}px`, fontSize: cs.fontSize, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight });
      }
    };
    fit();
    addEventListener("resize", fit);
    document.fonts?.ready?.then(fit);
    return () => removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const q = gsap.utils.selector(stage.current);
    const show = (el, on) => { if (el) el.style.opacity = on ? 1 : 0; };
    const poses = { s1: q(".s1 .fig"), s3: q(".s3 .fig") };

    const ctx = gsap.context(() => {
      gsap.set(q(".draw, .probe"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".probe:not(.is-chosen)"), { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: "none" } });

      // 01 the beginning
      tl.to(q(".s1 .ground"), { strokeDashoffset: 0, duration: 4 }, 0)
        .fromTo(q(".s1"), { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
        .fromTo(q(".cap1"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 3 }, 2)
        .to(q(".cap1"), { opacity: 0, duration: 2 }, 11)
        .fromTo(q(".rain"), { opacity: 0 }, { opacity: 1, duration: 4 }, 6)
      // → up into the canopy
        .to(q(".s1"), { scale: 6.5, transformOrigin: "800px 300px", duration: 8, ease: "power2.in" }, 12)
        .to(q(".s1, .rain"), { opacity: 0, duration: 3 }, 17)
        .fromTo(q(".s2"), { opacity: 0, scale: 0.45, transformOrigin: "800px 330px" }, { opacity: 1, scale: 1, duration: 6, ease: "power2.out" }, 16)
        .to(q(".s2 .rib"), { strokeDashoffset: 0, duration: 4, stagger: 0.3 }, 16)
      // 02 beneath the umbrella
        .fromTo(q(".s2 .arch"), { scale: 0.2, transformOrigin: "800px 330px", opacity: 0 }, { scale: 1.6, opacity: 1, duration: 10, stagger: 1.6 }, 20)
        .fromTo(q(".s2 .fig"), { opacity: 0 }, { opacity: 1, duration: 2 }, 21)
        .fromTo(q(".cap2"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2 }, 22)
        .to(q(".cap2"), { opacity: 0, duration: 2 }, 28)
      // → the floor becomes the horizon
        .to(q(".s2"), { opacity: 0, duration: 4 }, 29)
        .fromTo(q(".s3"), { opacity: 0 }, { opacity: 1, duration: 2 }, 31)
        .to(q(".s3 .horizon"), { strokeDashoffset: 0, duration: 4 }, 31)
      // 03 different worlds
        .fromTo(q(".pano"), { x: 1650 }, { x: -2620, duration: 36 }, 33)
        .fromTo(q(".cap3"), { opacity: 0 }, { opacity: 1, duration: 2 }, 40)
        .to(q(".cap3"), { opacity: 0, duration: 2 }, 58)
      // → the horizon frays into paths
        .to(q(".s3"), { opacity: 0, duration: 3 }, 68)
        .fromTo(q(".s4"), { opacity: 0 }, { opacity: 1, duration: 2 }, 69)
        .to(q(".s4 .path"), { strokeDashoffset: 0, duration: 4, stagger: 0.4 }, 69)
        .to(q(".s4 .gate"), { strokeDashoffset: 0, duration: 3, stagger: 0.4 }, 71)
        .to(q(".s4 .door__ridge"), { strokeDashoffset: 0, duration: 4, stagger: 0.15 }, 71)
        .fromTo(q(".cap4"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2 }, 74)
        .to(q(".cap4"), { opacity: 0, duration: 2 }, 85);
      // 04 the light tries each path: red at the gates, green at the fingerprint doorway
      q(".s4 .probe:not(.is-chosen)").forEach((el, i) => {
        tl.fromTo(el, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 1.4 }, 75 + i * 1.3)
          .to(q(".s4 .gate")[i], { stroke: "var(--threat)", duration: 0.4 }, 76.3 + i * 1.3)
          .to([el, q(".s4 .gate")[i]], { opacity: 0.35, stroke: "var(--white)", duration: 0.8 }, 77 + i * 1.3);
      });
      tl.fromTo(q(".s4 .probe.is-chosen"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2 }, 80.5)
        .to(q(".s4 .door__ridge"), { stroke: "var(--secure)", duration: 1.5, stagger: 0.08 }, 82)
        .to(q(".s4 .door__ridge"), { attr: { rx: (i, el) => +el.getAttribute("rx") * 1.25 }, opacity: 0.4, duration: 3 }, 84)
      // → the camera pulls back
        .to(q(".world"), { scale: 0.28, transformOrigin: "800px 450px", duration: 6, ease: "power2.inOut" }, 86)
        .to(q(".world"), { opacity: 0, duration: 3 }, 88)
      // 05 the reveal: the first time the word appears
        .fromTo(word.current, { opacity: 0, letterSpacing: "0.12em" }, { opacity: 1, letterSpacing: () => getComputedStyle(document.querySelector(".dhero__word")).letterSpacing, duration: 4, ease: "power2.out" }, 88.5)
        .fromTo(q(".cap5"), { opacity: 0 }, { opacity: 1, duration: 2 }, 92)
        .to(q(".cap5"), { opacity: 0, duration: 2 }, 96.5)
        .to(stage.current, { "--bg": 0, duration: 3 }, 96.5)
        .to(word.current, { opacity: 0, duration: 0.6 }, 99.4);

      ScrollTrigger.create({
        trigger: wrap.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => {
          const p = self.progress * 100;
          // she changes pose with the scroll (only one image of her is ever visible)
          const s1 = p < 5 ? "p1-shoulder" : p < 7.5 ? "p2-lift" : p < 10 ? "p3-half" : "p4-open";
          poses.s1.forEach((el) => show(el, el.dataset.pose === s1));
          const f = Math.floor(Math.max(0, p - 33) * 1.25) % WALK.length;
          poses.s3.forEach((el) => show(el, el.dataset.pose === WALK[f]));
          const s4 = p < 82 ? "p6-pause" : "p7-reach";
          q(".s4 .fig").forEach((el) => show(el, el.dataset.pose === s4));
          setSkipVisible(p < 96);
          if (p > 99.5) onDone?.();
        },
      });
    }, stage);
    // the ink "boils" like hand-drawn animation: a new noise seed eight times a second
    const noise = stage.current.querySelector(".ink-noise");
    let seed = 3;
    const boil = setInterval(() => { seed = (seed % 9) + 1; noise?.setAttribute("seed", String(seed)); }, 125);
    return () => { clearInterval(boil); ctx.revert(); };
  }, [onDone]);

  const skip = () => {
    const el = wrap.current;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - stage.current.clientHeight, behavior: "instant" });
    onDone?.();
  };

  return (
    <section className="intro" ref={wrap} aria-label="Intro film: under the umbrella">
      <div className="intro__stage" ref={stage}>
        <p className="visually-hidden">A short illustrated film. A woman with an umbrella walks through worlds of cybersecurity (network security, cloud security, digital forensics, governance and risk), chooses the path of identity and access management, and the paths she walked spell TRACE.</p>
        <svg className="intro__canvas" ref={canvas} viewBox="0 0 1600 900" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="ink" filterUnits="userSpaceOnUse" x="-400" y="-400" width="2400" height="1700">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" className="ink-noise" />
              <feDisplacementMap in="SourceGraphic" scale="2.2" />
            </filter>
          </defs>
          <g className="world">
            {/* 01 the beginning */}
            <g className="s1">
              <line className="ink draw ground" x1="0" y1="640" x2="1600" y2="640" pathLength="1" />
              {["p1-shoulder", "p2-lift", "p3-half", "p4-open"].map((n, i) => <Figure key={n} name={n} x={800} feetY={640} hidden={i > 0} />)}
            </g>
            <g className="rain">{RAIN.map((r, i) => <line key={i} className="ink rain__line" x1={r.x} y1={-r.h} x2={r.x - 8} y2={0} style={{ animationDelay: `${r.d}s` }} />)}</g>

            {/* 02 beneath the umbrella: the canopy's eight ribs become a hall of arches */}
            <g className="s2" style={{ opacity: 0 }}>
              {[[0, 0], [400, 0], [1200, 0], [1600, 0], [0, 900], [1600, 900], [0, 450], [1600, 450]].map(([x, y], i) => (
                <line key={i} className="ink draw rib" x1="800" y1="330" x2={x} y2={y} pathLength="1" />
              ))}
              {[0, 1, 2, 3, 4].map((i) => <path key={i} className="ink arch" d="M 560 900 L 560 380 A 240 240 0 0 1 1040 380 L 1040 900" />)}
              <Figure name="p5-back" x={800} feetY={870} scale={0.8} />
            </g>

            {/* 03 different worlds, on one horizon line */}
            <g className="s3" style={{ opacity: 0 }}>
              <line className="ink draw horizon" x1="0" y1="640" x2="1600" y2="640" pathLength="1" />
              <image className="pano" href={src("worlds")} x="0" y={640 - 0.716 * 1100} width={2564} height={1100} />
              {WALK.map((n, i) => <Figure key={n} name={n} x={560} feetY={646} scale={1.06} hidden={i > 0} />)}
            </g>

            {/* 04 finding a direction */}
            <g className="s4" style={{ opacity: 0 }}>
              {GATES.map((g, i) => <path key={`p${i}`} className="ink draw path" d={`M 800 840 Q ${(800 + g.x) / 2} ${640} ${g.x} ${g.y + 60}`} pathLength="1" />)}
              <path className="ink draw path" d={`M 800 840 L ${DOOR.x} ${DOOR.y + 150}`} pathLength="1" />
              {GATES.map((g, i) => <path key={`g${i}`} className="ink draw gate" d={`M ${g.x - 22} ${g.y + 60} L ${g.x - 22} ${g.y + 8} A 22 22 0 0 1 ${g.x + 22} ${g.y + 8} L ${g.x + 22} ${g.y + 60}`} pathLength="1" />)}
              {GATES.map((g, i) => <path key={`l${i}`} className="probe" d={`M 800 840 Q ${(800 + g.x) / 2} ${640} ${g.x} ${g.y + 60}`} pathLength="1" />)}
              <path className="probe is-chosen" d={`M 800 840 L ${DOOR.x} ${DOOR.y + 150}`} pathLength="1" />
              <g className="door">{ridges(DOOR.x, DOOR.y, 70, 120, 11)}</g>
              <Figure name="p6-pause" x={800} feetY={880} scale={0.62} />
              <Figure name="p7-reach" x={800} feetY={880} scale={0.62} hidden />
            </g>
          </g>
        </svg>

        {/* captions: real text, set into the frame */}
        <p className="cap cap1">cybersecurity is not one thing.</p>
        <p className="cap cap2">it is a shelter with many rooms.</p>
        <p className="cap cap3">four of the many rooms.</p>
        <p className="cap cap4">I chose the path of identity.</p>
        <p className="cap cap5">trace · my cybersecurity learning archive.</p>
        <span className="intro__word" ref={word} aria-hidden="true">trace</span>

        {skipVisible && <button type="button" className="intro__skip mono" onClick={skip}>skip intro</button>}
      </div>
    </section>
  );
}
