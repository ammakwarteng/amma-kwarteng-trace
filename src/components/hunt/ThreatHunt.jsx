import { useEffect, useRef, useState } from "react";
import { createHunt } from "./huntEngine.js";
import "./ThreatHunt.css";

/*
  Mounts the threat-hunt canvas over the hero.
  surfaceRef: the element that receives pointer input (the hero section).
*/
export default function ThreatHunt({ surfaceRef }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState({ text: "Hunting", tone: null });
  const [count, setCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const destroy = createHunt({
      canvas,
      surface,
      reducedMotion,
      getBounds: () => ({ top: 110, bottom: canvas.clientHeight - 40 }),
      onStatus: (text, tone) => setStatus({ text, tone }),
      onCount: setCount,
    });
    return destroy;
  }, [surfaceRef]);

  return (
    <>
      <canvas ref={canvasRef} className="hunt__canvas" aria-hidden="true" />
      <div className="hunt__readout" aria-hidden="true">
        <span className={`hunt__status ${status.tone ? `is-${status.tone}` : ""}`}>
          <i />
          {status.text.toLowerCase()} · quarantined {String(count).padStart(2, "0")}
        </span>
        <span className="hunt__hint">del / backspace — clear trace · double-click — lunge</span>
      </div>
      <p className="visually-hidden">
        Interactive background: moving the pointer steers a tracking reticle that hunts a fragment of
        malware around the page, leaving a trace of lines, and quarantines it when caught.
      </p>
    </>
  );
}
