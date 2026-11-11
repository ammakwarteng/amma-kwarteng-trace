import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import POSES from "./poses.json";
import "./intro.css";

gsap.registerPlugin(ScrollTrigger);

/*
  "Under the umbrella": the scroll-driven intro, built to Amma's storyboard.
  One pinned stage holds a 1600 x 900 drawing; the scroll scrubs one master timeline from 0 to 100.
    1  0–14   The beginning: almost black, one small figure; an umbrella descends from above and opens.
    2  13–32  Entering the umbrella: she looks up; it grows to fill the screen; its ribs become flowing pathways.
    3  32–70  Exploring: the pathways lead into the worlds, each growing out of the horizon and giving way to the next.
    4  70–86  Finding a direction: a crossroads; the IAM path becomes brighter, with a faint sage tint; she follows it.
    5  86–100 The reveal: she turns to the visitor and pulls down a sheet; it fills the screen; TRACE appears for
              the first time; she steps aside and walks out; the sheet is the portfolio.
  No captions, no extra elements. Artwork: public/intro (Higgsfield). Anything not drawn yet is marked
  "artwork pending" (see ART below) and is never shown as finished.
*/
const BASE = import.meta.env.BASE_URL;
const src = (n) => `${BASE}intro/${n}.webp`;
// her height on screen is the same in every pose: each Higgsfield sheet was drawn at its own scale,
// so artwork pixels are converted per sheet (body height in pixels on that sheet -> 252 canvas units)
const BODY_PX = { p: 700, a: 835, b: 835, e: 595, w: 635 };
const kOf = (name) => 252 / (BODY_PX[name[0]] || 700);
const UK = 100 / 706;                             // the umbrella on its own, drawn at the size she holds it
const WALK = ["e2", "e3", "e4", "e5", "e6", "e7"];           // empty-handed walk (the umbrella has become the world)
const AWAY = ["b1", "b2", "b3", "b4"];                         // walking away, seen from behind
// the artwork each moment needs; names missing from poses.json are still to be generated in Higgsfield
const ART = { stand: "a1-stand", reach: "a2-reach", front: "a3-front", pull: "a4-pull", umbClosed: "u1-closed", umbHalf: "u2-half", umbOpen: "u3-open", iam: "iam-world" };
const has = (n) => Boolean(POSES[n]);

// the four worlds, cut from the panorama (panorama pixels, 3200 wide) and placed along one strip
const PANO_W = 3200, PANO_H = 1373, PANO_SCALE = 1100 / PANO_H, HORIZON = 0.716;
const WORLDS = [
  { name: "network", from: 0, to: 1024 },
  { name: "cloud", from: 1024, to: 1840 },
  { name: "forensics", from: 1840, to: 2310 },
  { name: "governance", from: 2310, to: 3200 },
];
const IAM_W = 1300;                               // the identity and access world (doors), at the same scale as her
const STRIP_W = PANO_W * PANO_SCALE + 160 + IAM_W;

// where her raised hand is in the reaching pose: the umbrella's crook comes to rest there
const HAND = (() => {
  const r = POSES["a2-reach"];
  if (!r) return { x: 850, y: 370 };
  const w = r.w * kOf("a2-reach"), h = r.h * kOf("a2-reach");
  return { x: 800 - r.cx * w + r.hand[0] * w, y: 640 - h + r.hand[1] * h };
})();

function Pending({ x, feetY, w, h, label }) {
  return (
    <g className="pending" data-pending={label}>
      <rect x={x - w / 2} y={feetY - h} width={w} height={h} />
      <text x={x} y={feetY - h / 2}>artwork pending</text>
      <text x={x} y={feetY - h / 2 + 22}>{label}</text>
    </g>
  );
}

// a figure standing with its feet on (x, feetY); its body (not anything it holds) is centred on x
function Figure({ name, x, feetY, scale = 1, className = "", hidden = false, label }) {
  if (!has(name)) {
    return (
      <g className={`fig ${className}`} data-pose={name} style={hidden ? { opacity: 0 } : undefined}>
        <Pending x={x} feetY={feetY} w={90 * scale} h={280 * scale} label={label || name} />
      </g>
    );
  }
  const p = POSES[name];
  const w = p.w * kOf(name) * scale, h = p.h * kOf(name) * scale;
  return <image href={src(name)} x={x - p.cx * w} y={feetY - h} width={w} height={h} data-pose={name} className={`fig ${className}`} style={hidden ? { opacity: 0 } : undefined} />;
}

// a straight rib, written as a curve with its handles on the line, so it can bend into a pathway
const ribD = (cx, cy, ex, ey) => `M ${cx} ${cy} C ${cx + (ex - cx) / 3} ${cy + (ey - cy) / 3} ${cx + (2 * (ex - cx)) / 3} ${cy + (2 * (ey - cy)) / 3} ${ex} ${ey}`;
const RIBS = [-160, -120, -80, -40, 0, 40, 80, 120].map((deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { ex: 800 + Math.cos(a) * 1000, ey: 450 + Math.sin(a) * 1000 };
});
// where each rib flows to: a gentle pathway sweeping down to the horizon, heading right, into the worlds
const PATHWAY = (i) => `M ${-200 + i * 120} ${-60 + (i % 2) * 40} C ${300 + i * 60} ${200 + i * 30} ${700 + i * 40} ${640 - i * 4} 1700 640`;

const CROSS = [
  "M 800 880 C 760 760 520 640 300 520",
  "M 800 880 C 790 760 650 600 590 470",
  "M 800 880 C 812 760 930 600 1010 470",   // identity and access
  "M 800 880 C 840 760 1080 640 1300 520",
  "M 800 880 C 800 760 800 600 800 450",
];
const IAM_PATH = 2;

export default function IntroFilm({ onDone }) {
  const wrap = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const word = useRef(null);
  const [skipVisible, setSkipVisible] = useState(true);

  // fit the 1600 x 900 drawing to the screen; TRACE lands exactly on the site's own title
  useLayoutEffect(() => {
    const fit = () => {
      const vw = innerWidth, vh = stage.current.clientHeight;
      const s = vh > vw ? Math.min(vw / 820, vh / 900) : Math.min(vw / 1600, vh / 900) * 1.02;
      canvas.current.style.setProperty("--s", s.toFixed(4));
      const title = document.querySelector(".dhero__word"), hero = document.querySelector(".dhero");
      if (title && hero && word.current) {
        const t = title.getBoundingClientRect(), h = hero.getBoundingClientRect(), cs = getComputedStyle(title);
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
    const show = (els, name) => els.forEach((el) => { el.style.opacity = el.dataset.pose === name ? 1 : 0; });

    const ctx = gsap.context(() => {
      gsap.set(q(".draw"), { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const stripStart = 1650, stripEnd = -STRIP_W - 40;
      const atStrip = (x) => 32 + (38 * (stripStart - x)) / (stripStart - stripEnd);   // when the strip reaches x

      // 1 the beginning: the figure appears; the umbrella descends from above and opens
      tl.fromTo(q(".s1__who"), { opacity: 0 }, { opacity: 1, duration: 3 }, 0)
        .fromTo(q(".umbrella"), { y: -560 }, { y: 0, duration: 9, ease: "power1.out" }, 2)
      // 2 entering the umbrella: she looks up; it grows to fill the screen
        .to(q(".s1"), { scale: 7, transformOrigin: "800px 300px", duration: 9, ease: "power2.in" }, 17)
        .to(q(".s1"), { opacity: 0, duration: 3 }, 23.5)
        .fromTo(q(".ribs"), { opacity: 0 }, { opacity: 1, duration: 2 }, 22)
        .to(q(".rib"), { strokeDashoffset: 0, duration: 3, stagger: 0.15 }, 22);
      // its ribs bend into flowing pathways that lead down to the horizon
      q(".rib").forEach((el, i) => tl.to(el, { attr: { d: PATHWAY(i) }, duration: 7, ease: "power1.inOut" }, 25));
      tl.to(q(".ribs"), { opacity: 0, duration: 3 }, 31)
        .fromTo(q(".s3"), { opacity: 0 }, { opacity: 1, duration: 2 }, 30)
        .to(q(".s3 .horizon"), { strokeDashoffset: 0, duration: 3 }, 30)
      // 3 exploring: the worlds pass, each growing up out of the horizon and settling back into it
        .fromTo(q(".strip"), { x: stripStart }, { x: stripEnd, duration: 38 }, 32);
      q(".world").forEach((el) => {
        const a = +el.dataset.a, b = +el.dataset.b, clip = q(`#${el.dataset.clip} .reveal`)[0];
        const enter = atStrip(1600 - a), leave = atStrip(-b + 300);
        tl.fromTo(clip, { attr: { y: 640, height: 0 } }, { attr: { y: -600, height: 1240 }, duration: 4, ease: "power1.out" }, Math.max(32, enter - 1))
          .to(clip, { attr: { height: 0, y: 640 }, duration: 4, ease: "power1.in" }, leave);
      });
      // 4 finding a direction: the crossroads; the IAM path comes forward; she follows it
      tl.to(q(".s3"), { opacity: 0, duration: 3 }, 69)
        .fromTo(q(".s4"), { opacity: 0 }, { opacity: 1, duration: 2 }, 70)
        .to(q(".s4 .path"), { strokeDashoffset: 0, duration: 4, stagger: 0.35 }, 70)
        .to(q(".s4 .path:not(.is-iam)"), { opacity: 0.35, duration: 3 }, 76)
        .to(q(".s4 .path.is-iam"), { stroke: "#dfe8df", strokeWidth: 2.4, duration: 3 }, 76)
        .fromTo(q(".s4 .walker"), { x: 0, y: 0, scale: 1 }, { x: 150, y: -330, scale: 0.42, transformOrigin: "800px 880px", duration: 8, ease: "power1.in" }, 78)
        .to(q(".s4 .walker"), { opacity: 0, duration: 2 }, 85)
        .to(q(".s4"), { opacity: 0, duration: 2 }, 86)
      // 5 the reveal: she turns to the visitor and pulls down a sheet; TRACE appears on it for the first time
        .fromTo(q(".s5"), { opacity: 0 }, { opacity: 1, duration: 1.5 }, 86)
        .fromTo(q(".paper__sheet"), { attr: { height: 0 } }, { attr: { height: 900 }, duration: 6, ease: "power2.inOut" }, 89)
        .fromTo(q(".paper__roll"), { y: -900 }, { y: 0, duration: 6, ease: "power2.inOut" }, 89)
        .fromTo(word.current, { opacity: 0 }, { opacity: 1, duration: 2.5, ease: "power1.out" }, 94)
        .fromTo(q(".s5 .exit"), { x: 0 }, { x: 980, duration: 4, ease: "power1.in" }, 95)
        .to(q(".paper"), { opacity: 0, duration: 2.5 }, 97)
        .to(stage.current, { "--bg": 0, duration: 2.5 }, 97.3)
        .to(word.current, { opacity: 0, duration: 0.2 }, 99.8);

      ScrollTrigger.create({
        trigger: wrap.current, start: "top top", end: "bottom bottom", scrub: 0.6, animation: tl,
        onUpdate: (self) => {
          const p = self.progress * 100;
          // scene 1: standing, then reaching as the umbrella arrives; she holds it from then on and looks up
          show(q(".s1 .who"), p < 5 ? ART.stand : p < 9 ? "a1b-look" : p < 12.5 ? ART.reach : p < 16 ? "p4-open" : "p5-back");
          show(q(".umbrella > *"), p < 6 ? ART.umbClosed : p < 9.5 ? ART.umbHalf : ART.umbOpen);
          q(".umbrella").forEach((el) => { el.style.opacity = p < 12.5 ? 1 : 0; });
          // scene 3: one walk frame at a time, stepped by the scroll
          show(q(".s3 .fig"), WALK[Math.floor(Math.max(0, p - 32) * 1.25) % WALK.length]);
          // scene 4: walking away along the IAM path
          show(q(".s4 .walker .fig"), AWAY[Math.floor(Math.max(0, p - 78) * 1.4) % AWAY.length]);
          // scene 5: facing the visitor, pulling the sheet, then walking out of the frame
          show(q(".s5 > .who"), p < 89 ? ART.front : p < 95 ? ART.pull : "none");
          show(q(".s5 .exit .fig"), WALK[Math.floor(Math.max(0, p - 95) * 4) % WALK.length]);
          q(".s5 .exit").forEach((el) => { el.style.opacity = p >= 95 ? 1 : 0; });
          // the site's own title stays hidden until the film has landed on it (no double TRACE)
          document.documentElement.classList.toggle("intro-playing", p < 99.8);
          setSkipVisible(p < 97);
          if (p > 99.5) onDone?.();
        },
      });
    }, stage);
    const noise = stage.current.querySelector(".ink-noise");
    let seed = 3;
    const boil = setInterval(() => { seed = (seed % 9) + 1; noise?.setAttribute("seed", String(seed)); }, 125);
    return () => { clearInterval(boil); ctx.revert(); document.documentElement.classList.remove("intro-playing"); };
  }, [onDone]);

  const skip = () => {
    const el = wrap.current;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - stage.current.clientHeight, behavior: "instant" });
    onDone?.();
  };

  let offset = 0;
  return (
    <section className="intro" ref={wrap} aria-label="Intro: under the umbrella">
      <div className="intro__stage" ref={stage}>
        <p className="visually-hidden">An illustrated short film. A woman stands in the dark; an umbrella descends and opens above her. It grows into a world of pathways leading through network security, cloud security, digital forensics, governance and risk, and identity and access. At a crossroads she follows the path of identity and access. She turns to the visitor and pulls down a sheet of paper, on which the word TRACE appears.</p>
        <svg className="intro__canvas" ref={canvas} viewBox="0 0 1600 900" aria-hidden="true">
          <defs>
            <filter id="ink" filterUnits="userSpaceOnUse" x="-400" y="-400" width="2400" height="1700">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" className="ink-noise" />
              <feDisplacementMap in="SourceGraphic" scale="2.2" />
            </filter>
            {WORLDS.map((w) => (
              <clipPath key={w.name} id={`clip-${w.name}`}><rect className="reveal" x="-100" y="640" width={(w.to - w.from) * PANO_SCALE + 200} height="0" /></clipPath>
            ))}
            <clipPath id="clip-iam"><rect className="reveal" x="-100" y="640" width={IAM_W + 200} height="0" /></clipPath>
          </defs>

          {/* 1 the beginning */}
          <g className="s1">
            <g className="umbrella">
              {[ART.umbClosed, ART.umbHalf, ART.umbOpen].map((n) => has(n)
                ? <image key={n} data-pose={n} href={src(n)} x={HAND.x - POSES[n].cx * POSES[n].w * UK} y={HAND.y - POSES[n].h * UK} width={POSES[n].w * UK} height={POSES[n].h * UK} />
                : <g key={n} data-pose={n}><Pending x={830} feetY={330} w={170} h={170} label={n.replace(/^u\d-/, "umbrella, ")} /></g>)}
            </g>
            <g className="s1__who">
              {[ART.stand, "a1b-look", ART.reach, "p4-open", "p5-back"].map((n, i) => (
                <Figure key={n} name={n} x={800} feetY={640} className="who" hidden={i > 0}
                  label={{ [ART.stand]: "standing, empty-handed", [ART.reach]: "reaching up" }[n]} />
              ))}
            </g>
          </g>

          {/* 2 the ribs that become pathways */}
          <g className="ribs" style={{ opacity: 0 }}>
            {RIBS.map((r, i) => <path key={i} className="ink draw rib" d={ribD(800, 450, r.ex, r.ey)} pathLength="1" />)}
          </g>

          {/* 3 the worlds, on one horizon */}
          <g className="s3" style={{ opacity: 0 }}>
            <line className="ink draw horizon" x1="0" y1="640" x2="1600" y2="640" pathLength="1" />
            <g className="strip">
              {WORLDS.map((w) => {
                const width = (w.to - w.from) * PANO_SCALE, x = offset;
                offset += width;
                return (
                  <g key={w.name} className="world" data-a={x} data-b={x + width} data-clip={`clip-${w.name}`} transform={`translate(${x} 0)`}>
                    <g clipPath={`url(#clip-${w.name})`}>
                      <svg x="0" y={640 - HORIZON * 1100} width={width} height="1100" viewBox={`${w.from} 0 ${w.to - w.from} ${PANO_H}`} preserveAspectRatio="none">
                        <image href={src("worlds")} x="0" y="0" width={PANO_W} height={PANO_H} />
                      </svg>
                    </g>
                  </g>
                );
              })}
              <g className="world" data-a={offset + 160} data-b={offset + 160 + IAM_W} data-clip="clip-iam" transform={`translate(${offset + 160} 0)`}>
                <g clipPath="url(#clip-iam)">
                  {has(ART.iam)
                    ? <image href={src(ART.iam)} x="0" y={640 - POSES[ART.iam].horizon * (IAM_W * POSES[ART.iam].h / POSES[ART.iam].w)} width={IAM_W} height={IAM_W * POSES[ART.iam].h / POSES[ART.iam].w} />
                    : <Pending x={IAM_W / 2} feetY={636} w={IAM_W - 80} h={380} label="identity and access world" />}
                </g>
              </g>
            </g>
            {WALK.map((n, i) => <Figure key={n} name={n} x={560} feetY={646} scale={1.06} hidden={i > 0} />)}
          </g>

          {/* 4 finding a direction */}
          <g className="s4" style={{ opacity: 0 }}>
            {CROSS.map((d, i) => <path key={i} className={`ink draw path ${i === IAM_PATH ? "is-iam" : ""}`} d={d} pathLength="1" />)}
            <g className="walker">{AWAY.map((n, i) => <Figure key={n} name={n} x={800} feetY={880} scale={0.62} hidden={i > 0} />)}</g>
          </g>

          {/* 5 the reveal: the sheet she pulls down, drawn in code */}
          <g className="s5" style={{ opacity: 0 }}>
            <g className="paper">
              <rect className="paper__sheet" x="150" y="0" width="1300" height="0" />
              <g className="paper__roll">
                <path className="ink paper__edge" d="M 150 0 L 150 900 M 1450 0 L 1450 900" />
                <path className="ink" d="M 140 900 C 400 906 1200 894 1460 900" />
                <path className="ink" d="M 146 912 C 420 917 1180 907 1454 912" />
              </g>
            </g>
            {[ART.front, ART.pull].map((n, i) => (
              <Figure key={n} name={n} x={800} feetY={880} scale={0.8} className="who" hidden={i > 0}
                label={{ [ART.front]: "facing the visitor, arms raised", [ART.pull]: "pulling the sheet down" }[n]} />
            ))}
            <g className="exit" style={{ opacity: 0 }}>{WALK.map((n, i) => <Figure key={n} name={n} x={800} feetY={880} scale={0.8} hidden={i > 0} />)}</g>
          </g>
        </svg>

        <span className="intro__word" ref={word} aria-hidden="true">trace</span>
        {skipVisible && <button type="button" className="intro__skip mono" onClick={skip}>skip intro</button>}
      </div>
    </section>
  );
}
