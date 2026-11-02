import { useMemo } from "react";
import { seeded, between } from "../lib/random.js";
import "./Wall.css";

// Remnants of older posters peeled off the wall, like the paste-up wall in the
// reference. Pure CSS shapes from a fixed seed: no images involved.
function scraps(count) {
  const rand = seeded(9);
  return Array.from({ length: count }, (_, i) => {
    const pts = Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * Math.PI * 2;
      const r = between(rand, 38, 50);
      return `${(50 + Math.cos(a) * r).toFixed(1)}% ${(50 + Math.sin(a) * r).toFixed(1)}%`;
    });
    return {
      id: i,
      left: between(rand, -6, 94),
      top: between(rand, -4, 92),
      w: between(rand, 6, 22),
      h: between(rand, 4, 16),
      rot: between(rand, -40, 40),
      alpha: between(rand, 0.025, 0.07),
      clip: `polygon(${pts.join(",")})`,
    };
  });
}

export default function Wall() {
  const pieces = useMemo(() => scraps(16), []);
  return (
    <div className="wall" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="wall__scrap"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.w}vw`,
            height: `${p.h}vw`,
            transform: `rotate(${p.rot}deg)`,
            opacity: p.alpha,
            clipPath: p.clip,
          }}
        />
      ))}
    </div>
  );
}
