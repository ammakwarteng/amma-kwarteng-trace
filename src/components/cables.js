import { seeded, between } from "../lib/random.js";

/*
  A tangle of insulated wires spilling out from under the TRACE poster.
  Drawn once into the poster's static layer. Each wire is shaded like a
  round cable: cast shadow, dark edge, body colour, thin specular highlight.
  Wires further back are darker, so the tangle has depth.

  This is a stand-in until Amma supplies a photo of a real cable tangle.
*/

const INSULATION = [
  { c: "#e46f24", w: 5 },  // orange
  { c: "#efebe3", w: 4 },  // white
  { c: "#bdbab3", w: 3 },  // light grey
  { c: "#2b63c9", w: 3 },  // blue
  { c: "#79c3e4", w: 2 },  // light blue
  { c: "#cf4a34", w: 2 },  // red
  { c: "#3a9a62", w: 1 },  // green
  { c: "#d9ad3f", w: 1 },  // yellow
  { c: "#7d55c4", w: 1 },  // purple
  { c: "#4a4844", w: 2 },  // dark grey
];

function pick(rand) {
  const total = INSULATION.reduce((a, b) => a + b.w, 0);
  let r = rand() * total;
  for (const item of INSULATION) if ((r -= item.w) <= 0) return item.c;
  return INSULATION[0].c;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex, target, t) {
  const a = hexToRgb(hex), b = hexToRgb(target);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
}

// A loose, looping path: wanders downward and sideways from a start point.
function wirePath(rand, sx, sy, area, dpr) {
  const pts = [[sx, sy]];
  let x = sx, y = sy;
  const n = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < n; i++) {
    x += between(rand, -1, 1) * area.w * 0.2;
    y += between(rand, -0.35, 1) * area.h * 0.28;
    x = Math.max(area.x - 60 * dpr, Math.min(area.x + area.w + 60 * dpr, x));
    y = Math.max(area.top, Math.min(area.bottom + 80 * dpr, y));
    // occasional tight loop, like a coiled lead
    if (rand() < 0.18) {
      const r = between(rand, 26, 60) * dpr, a0 = rand() * Math.PI * 2, dir = rand() < 0.5 ? 1 : -1;
      for (let k = 1; k <= 7; k++) pts.push([x + Math.cos(a0 + dir * k * 0.9) * r, Math.max(area.top, y + Math.sin(a0 + dir * k * 0.9) * r * 0.6)]);
    }
    pts.push([x, y]);
  }
  return pts;
}

// Smooth curve through every point (Catmull-Rom converted to Bezier).
function trace(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1]
    );
  }
}

function drawWire(ctx, pts, color, w, depth, dpr, wall) {
  const body = depth > 0 ? mix(color, wall, depth) : color;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // cast shadow
  ctx.save();
  ctx.translate(1.5 * dpr, 3 * dpr);
  ctx.filter = `blur(${Math.round(2.5 * dpr)}px)`;
  ctx.strokeStyle = `rgba(0,0,0,${0.55 - depth * 0.3})`;
  ctx.lineWidth = w + 2 * dpr;
  trace(ctx, pts); ctx.stroke();
  ctx.restore();

  // round insulation: dark rim, body, specular line
  ctx.strokeStyle = mix(color, "#000000", 0.45 + depth * 0.3);
  ctx.lineWidth = w;
  trace(ctx, pts); ctx.stroke();
  ctx.strokeStyle = body;
  ctx.lineWidth = w * 0.62;
  trace(ctx, pts); ctx.stroke();
  ctx.save();
  ctx.translate(-w * 0.14, -w * 0.18);
  ctx.strokeStyle = `rgba(255,255,255,${0.42 * (1 - depth)})`;
  ctx.lineWidth = Math.max(0.8 * dpr, w * 0.16);
  trace(ctx, pts); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/*
  layer "back": many thin wires behind the poster, darker with depth.
  layer "front": fewer wires that cross the torn bottom edge, in front.
*/
export function drawCables(ctx, { W, H, paper, dpr, layer, wall = "#121212" }) {
  const rand = seeded(layer === "back" ? 77 : 78);
  // Front wires never rise above the torn edge, so the poster's small print stays readable.
  const top = layer === "front" ? paper.y1 + 4 * dpr : paper.y1 - 40 * dpr;
  const area = { x: paper.x0, w: paper.x1 - paper.x0, top, bottom: H, h: H - top };
  const count = layer === "back" ? 64 : 18;

  for (let i = 0; i < count; i++) {
    const sx = between(rand, paper.x0 + 20 * dpr, paper.x1 - 20 * dpr);
    const sy = layer === "back" ? paper.y1 - between(rand, 10, 60) * dpr : paper.y1 + between(rand, 2, 12) * dpr;
    const pts = wirePath(rand, sx, sy, area, dpr);
    const thick = rand() < 0.08;
    const w = (thick ? between(rand, 9, 13) : between(rand, 3, 6)) * dpr;
    const color = thick ? "#1d1d1c" : pick(rand);
    const depth = layer === "back" ? between(rand, 0.15, 0.6) : between(rand, 0, 0.12);
    drawWire(ctx, pts, color, w, depth, dpr, wall);
  }

  if (layer === "front") {
    // fade the tangle into the wall at the bottom so text below stays readable
    const g = ctx.createLinearGradient(0, H * 0.78, 0, H);
    g.addColorStop(0, "rgba(18,18,18,0)");
    g.addColorStop(1, "rgba(18,18,18,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
  }
}
