import { useEffect, useRef } from "react";

/*
  The Daylight signature: the trace crosshair locks onto one letter of a word (the first vowel
  after its first letter, or the letter chosen with `at`). The brackets snap in the first time the
  word comes into view. Screen readers get the plain word.
*/
export default function LockWord({ text, at, className = "" }) {
  const ref = useRef(null);
  const i = at ?? Math.max(1, [...text].findIndex((c, k) => k > 0 && /[aeiou]/i.test(c)));
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={`lockword ${className}`} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, i)}<span className="lock">{text[i]}<i /></span>{text.slice(i + 1)}</span>
    </span>
  );
}
