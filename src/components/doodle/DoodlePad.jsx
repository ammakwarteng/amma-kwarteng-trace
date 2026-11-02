import { useEffect, useRef, useState } from "react";
import "./DoodlePad.css";

/*
  "leave your trace": a small drawing pad in the hero.
  - Draw with a finger or mouse in the site's colours.
  - Undo / redo.
  - Wipe: a quick sweep clears the pad.
  - Check: pins the doodle to the page as a floating sticker (onPin).
*/

const COLORS = [
  { id: "white", value: "#ffffff", label: "White" },
  { id: "pink", value: "#ff7eb6", label: "Pink" },
  { id: "orange", value: "#ff9f43", label: "Orange" },
  { id: "yellow", value: "#ffe066", label: "Yellow" },
  { id: "green", value: "#5ef0a0", label: "Green" },
  { id: "blue", value: "#5cc8ff", label: "Blue" },
  { id: "purple", value: "#b18cff", label: "Purple" },
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
  const wrapRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [redo, setRedo] = useState([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [wipe, setWipe] = useState(null); // snapshot being swept away
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

  // Wipe: the drawing is swept off left to right.
  const wipeIt = () => {
    if (!strokes.length || wipe) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      setWipe(canvasRef.current.toDataURL("image/png"));
      setTimeout(() => setWipe(null), 450);
    }
    setStrokes([]);
    setRedo([]);
    setPinned(false);
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
        {empty && !wipe && <span className="doodle__placeholder" aria-hidden="true">draw something</span>}
        {wipe && (
          <>
            <img className="doodle__wiping" src={wipe} alt="" />
            <span className="doodle__sweep" aria-hidden="true" />
          </>
        )}
      </div>

      <div className="doodle__tools">
        <button type="button" className="doodle__tool" onClick={undo} disabled={empty} aria-label="Undo">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5L3.5 8.5 7 12M4 8.5h8a4.5 4.5 0 0 1 0 9H9" /></svg>
        </button>
        <button type="button" className="doodle__tool" onClick={wipeIt} disabled={empty} aria-label="Wipe the pad clean">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 4.5l4 4-7 7H5l-1.5-1.5a1.4 1.4 0 0 1 0-2zM7.5 8.5l4 4M8.5 15.5H16" /></svg>
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
