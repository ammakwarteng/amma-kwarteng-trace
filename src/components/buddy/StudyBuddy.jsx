import { useEffect, useMemo, useRef, useState } from "react";
import { studyGoal } from "../../data/site.js";
import "./StudyBuddy.css";

/*
  A tiny pixel analyst at a laptop, keeping Amma on track.
  Shows the current study goal and (with a start date) which day she is on.
  Click him for a nudge. When studyGoal.passed is true, he celebrates.
*/

// 18 x 14 pixel sprite. W white, D grey, K black (eyes), G green (screen).
const SPRITE = [
  ".....WWWW.........",
  "....WWWWWW........",
  "....WKWWKW........",
  "....WWWWWW........",
  ".....WWWW.........",
  "....DDDDDD...GGGG.",
  "...DDDDDDDD..GGGG.",
  "...DDDDDDDDD.GGGG.",
  "...DDDDDDWWW.GGGG.",
  "...DDDDDD...WWWWWW",
  "...DDDDDD.........",
  "...WW..WW.........",
  "...WW..WW.........",
  "..WWW..WWW........",
];

const NUDGES = [
  "one section of the syllabus today.",
  "15 focused minutes still counts.",
  "consistency beats intensity.",
  "review yesterday's notes first.",
  "the 7 guiding principles. say them out loud.",
  "40 questions, 60 minutes. you've got this.",
  "practice question, then explain the answer.",
  "small sessions, every day.",
];
const CHEERS = ["certified. so proud of you.", "itil 4: done. security+ next.", "told you you'd get it."];

function dayCount(start) {
  if (!start) return null;
  const s = new Date(`${start}T00:00:00`);
  if (Number.isNaN(s.getTime())) return null;
  const days = Math.floor((Date.now() - s.getTime()) / 86400000) + 1;
  return days > 0 ? days : null;
}

export default function StudyBuddy() {
  const day = useMemo(() => dayCount(studyGoal.startDate), []);
  const passed = Boolean(studyGoal.passed);
  const [blink, setBlink] = useState(false);
  const [frame, setFrame] = useState(0);
  const [say, setSay] = useState("");
  const pick = useRef(Math.floor(Math.random() * NUDGES.length));
  const hideTimer = useRef(0);

  // idle animation: blink now and then, screen flickers like typing
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = setInterval(() => setFrame((f) => f + 1), 260);
    const blinker = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 3400);
    return () => { clearInterval(tick); clearInterval(blinker); };
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const status = passed
    ? `${studyGoal.label} · certified`
    : day ? `studying ${studyGoal.label} · day ${day}` : `studying ${studyGoal.label}`;

  function talk() {
    const list = passed ? CHEERS : NUDGES;
    pick.current = (pick.current + 1) % list.length;
    setSay(list[pick.current]);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setSay(""), 3800);
  }

  const px = 4;
  const rects = [];
  SPRITE.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      let cls = { W: "w", D: "d", K: "k", G: "g" }[c];
      if (c === "K" && blink) cls = "w";
      // typing flicker: a few screen pixels dim in a moving pattern
      if (c === "G" && !passed && (x + y + frame) % 5 === 0) cls = "g2";
      rects.push(<rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} className={`px-${cls}`} />);
    });
  });

  return (
    <div className={`buddy ${passed ? "is-passed" : ""}`}>
      <p className={`buddy__say ${say ? "is-on" : ""}`} aria-live="polite">{say}</p>
      <button type="button" className="buddy__btn" onClick={talk} aria-label={`Study buddy: ${status}. Press for a study nudge.`}>
        <svg className="buddy__sprite" viewBox={`0 0 ${18 * px} ${14 * px}`} width={18 * px} height={14 * px} aria-hidden="true">
          {rects}
        </svg>
      </button>
      <p className="buddy__status mono">
        <i aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}
