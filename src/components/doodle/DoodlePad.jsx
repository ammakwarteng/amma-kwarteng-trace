import { useEffect, useRef, useState } from "react";
import "./DoodlePad.css";

/*
  "leave your trace": a small drawing pad in the hero.
  - Draw with a finger or mouse in the site's colours.
  - Undo / redo.
  - Bin: the doodle crumples into a ball and drops into the bin.
  - Check: pins the doodle to the page as a floating sticker (onPin).
*/

const COLORS = [
  { id: "white", value: "#ffffff", label: "White" },
  { id: "grey", value: "#8a8a8a", label: "Grey" },
  { id: "red", value: "#ff2b2b", label: "Red" },
  { id: "green", value: "#57e389", label: "Green" },
];
const W = 236, H = 168;

function drawStroke(ctx, s) {
  const p = s.points;
  if (!p.length) return;
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (p.length === 1) {
    ctx.beginPath(); ctx.arc(p[0][0], p[0][1], 1.6, 0, Math.PI * 2); ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
  }
  const last = p[p.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
}

export default function DoodlePad({ onPin, onClose }) {
  const canvasRef = useRef(null);
  const binRef = useRef(null);
  const wrapRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [redo, setRedo] = useState([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [crumple, setCrumple] = useState(null); // { src, dx, dy }
  const [binHit, setBinHit] = useState(false);
  const [pinned, setPinned] = useState(false);
  const live = useRef(null);

  // size the canvas for sharp lines on high-density screens
  useEffect(() => {
    const c = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    c.width = W * dpr; c.height = H * dpr;
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // redraw whenever the strokes change
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    strokes.forEach((s) => drawStroke(ctx, s));
  }, [strokes]);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };

  const onDown = (e) => {
    e.stopPropagation();
    canvasRef.current.setPointerCapture(e.pointerId);
    live.current = { color, points: [pos(e)] };
    setPinned(false);
    drawStroke(canvasRef.current.getContext("2d"), live.current);
  };
  const onMove = (e) => {
    e.stopPropagation();
    if (!live.current) return;
    live.current.points.push(pos(e));
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    strokes.forEach((s) => drawStroke(ctx, s));
    drawStroke(ctx, live.current);
  };
  const onUp = (e) => {
    e.stopPropagation();
    if (!live.current) return;
    const s = live.current;
    live.current = null;
    setStrokes((prev) => [...prev, s]);
    setRedo([]);
  };

  const undo = () => {
    if (!strokes.length) return;
    setRedo((r) => [...r, strokes[strokes.length - 1]]);
    setStrokes((s) => s.slice(0, -1));
  };
  const redoStroke = () => {
    if (!redo.length) return;
    setStrokes((s) => [...s, redo[redo.length - 1]]);
    setRedo((r) => r.slice(0, -1));
  };

  // Crumple the doodle into a ball and drop it in the bin.
  const binIt = () => {
    if (!strokes.length || crumple) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setStrokes([]); setRedo([]); return; }
    const c = canvasRef.current.getBoundingClientRect();
    const b = binRef.current.getBoundingClientRect();
    setCrumple({
      src: canvasRef.current.toDataURL("image/png"),
      dx: b.left + b.width / 2 - (c.left + c.width / 2),
      dy: b.top + b.height / 2 - (c.top + c.height / 2),
    });
    setStrokes([]);
    setRedo([]);
    setTimeout(() => { setBinHit(true); setTimeout(() => setBinHit(false), 450); }, 820);
    setTimeout(() => setCrumple(null), 1000);
  };

  const pin = () => {
    if (!strokes.length) return;
    onPin?.(canvasRef.current.toDataURL("image/png"));
    setPinned(true);
  };

  const empty = strokes.length === 0;

  return (
    <section className="doodle" ref={wrapRef} aria-label="Doodle pad: leave your trace">
      <div className="doodle__head">
        <span className="doodle__title">leave your trace</span>
        <span className="doodle__spacer" />
        <button type="button" className={`doodle__pin ${pinned ? "is-done" : ""}`} onClick={pin} disabled={empty} aria-label="Pin your doodle to the page">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3.2L15 6.8" /></svg>
        </button>
        {onClose && (
          <button type="button" className="doodle__pin doodle__close" onClick={onClose} aria-label="Close the doodle pad">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8" /></svg>
          </button>
        )}
      </div>

      <div className="doodle__paper">
        <canvas
          ref={canvasRef}
          className="doodle__canvas"
          style={{ width: W, height: H }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label={empty ? "Empty drawing area" : "Your doodle"}
        />
        {empty && !crumple && <span className="doodle__placeholder" aria-hidden="true">draw something</span>}
        {crumple && (
          <img
            className="doodle__ball"
            src={crumple.src}
            alt=""
            style={{ "--dx": `${crumple.dx}px`, "--dy": `${crumple.dy}px` }}
          />
        )}
      </div>

      <div className="doodle__tools">
        <button type="button" className="doodle__tool" onClick={undo} disabled={empty} aria-label="Undo">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5L3.5 8.5 7 12M4 8.5h8a4.5 4.5 0 0 1 0 9H9" /></svg>
        </button>
        <button type="button" ref={binRef} className={`doodle__tool doodle__bin ${binHit ? "is-hit" : ""}`} onClick={binIt} disabled={empty && !crumple} aria-label="Crumple and bin the doodle">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2M5.5 6l.8 10.5h7.4L14.5 6M8.5 9v5M11.5 9v5" /></svg>
        </button>
        <button type="button" className="doodle__tool" onClick={redoStroke} disabled={!redo.length} aria-label="Redo">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 5l3.5 3.5L13 12M16 8.5H8a4.5 4.5 0 0 0 0 9h3" /></svg>
        </button>
      </div>

      <div className="doodle__colors" role="radiogroup" aria-label="Pen colour">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={color === c.value}
            aria-label={c.label}
            className={`doodle__swatch ${color === c.value ? "is-on" : ""}`}
            style={{ "--c": c.value }}
            onClick={() => setColor(c.value)}
          />
        ))}
      </div>
    </section>
  );
}
