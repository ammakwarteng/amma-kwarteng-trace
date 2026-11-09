import { useEffect, useRef, useState } from "react";

/*
  Text that starts scrambled and decodes letter by letter, like data being
  decrypted, the first time it scrolls into view. Screen readers always get
  the real text; with reduced motion the real text shows immediately.
*/
const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&@*$/\\";

export default function DecryptText({ text, as: Tag = "span", className = "", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => scramble(text, 0));
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) { setShown(text); setDone(true); return; }

    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const perChar = 45, lead = 220;
      timer = setInterval(() => {
        const t = performance.now() - start;
        const locked = Math.floor((t - lead) / perChar);
        if (locked >= text.length) { setShown(text); setDone(true); clearInterval(timer); return; }
        setShown(scramble(text, Math.max(0, locked)));
      }, 34);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [text]);

  return (
    <Tag ref={ref} className={`decrypt ${done ? "is-done" : ""} ${className}`} aria-label={text} {...rest}>
      <span aria-hidden="true">{shown}</span>
    </Tag>
  );
}

function scramble(text, lockedCount) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (i < lockedCount || ch === " ") out += ch;
    else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}
