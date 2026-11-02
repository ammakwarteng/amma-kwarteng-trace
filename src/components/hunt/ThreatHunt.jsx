import { useEffect, useRef, useState } from "react";
import { createHunt } from "./huntEngine.js";
import "./ThreatHunt.css";

/*
  Mounts the threat-hunt canvas over the hero.
  surfaceRef: the element that receives pointer input (the hero section).
  footRef:    the hero footer; the malware stays above it so text stays readable.
*/
export default function ThreatHunt({ surfaceRef, footRef }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState({ text: "Hunting", alert: false });
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
      getBounds: () => {
        const top = 96;
        const foot = footRef.current;
        const bottom = foot ? foot.offsetTop - 24 : canvas.clientHeight - 140;
        return { top, bottom: Math.max(top + 160, bottom) };
      },
      onStatus: (text, alert) => setStatus({ text, alert }),
      onCount: setCount,
    });
    return destroy;
  }, [surfaceRef, footRef]);

  return (
    <>
      <canvas ref={canvasRef} className="hunt__canvas" aria-hidden="true" />
      <div className="hunt__readout mono" aria-hidden="true">
        <span className={`hunt__status ${status.alert ? "is-alert" : ""}`}>
          <i />
          {status.text}
        </span>
        <span className="hunt__count">Quarantined {String(count).padStart(2, "0")}</span>
      </div>
      <p className="visually-hidden">
        Interactive background: moving the pointer steers a tracking reticle that hunts a fragment of
        malware across the poster and quarantines it when caught.
      </p>
    </>
  );
}
