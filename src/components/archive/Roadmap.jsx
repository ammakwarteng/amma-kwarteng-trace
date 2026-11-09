import { useState } from "react";
import { roadmap } from "../../data/content.js";

/*
  02 · IAM roadmap: a progression diagram.
  Laptops: the four stages sit along one hairline (solid silver up to "you are here", dotted
  beyond); selecting a stage opens its full-width panel of skills and certifications below.
  Phones: the line runs down the left and each stage opens in place.
  One DOM for both: each stage is [button, goal, panel]; on laptops the stage wrapper is
  display: contents so its parts can sit in the shared grid rows.
*/
const nowIndex = Math.max(0, roadmap.findIndex((r) => r.now));

export default function Roadmap() {
  const [open, setOpen] = useState(nowIndex);
  return (
    <div className="rm" style={{ "--stops": roadmap.length, "--now": nowIndex }}>
      <span className="rm__line rm__line--done" aria-hidden="true" />
      <span className="rm__line rm__line--todo" aria-hidden="true" />
      {roadmap.map((r, i) => {
        const isOpen = open === i;
        const panelId = `rm-panel-${i}`;
        return (
          <div key={r.phase} className={`rm__stage ${r.now ? "is-now" : ""} ${i < nowIndex ? "is-past" : ""} ${isOpen ? "is-open" : ""}`} style={{ "--i": i }}>
            <button
              type="button"
              className="rm__btn"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className="rm__mark" aria-hidden="true" />
              <span className="rm__meta mono">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="rm__when">{r.now ? "you are here" : r.when}</span>
              </span>
              <span className="rm__phase">{r.phase}</span>
              <span className="rm__cue mono" aria-hidden="true">{isOpen ? "close" : "details"}</span>
            </button>
            <p className="rm__goal">{r.goal}</p>
            <div className="rm__panel" id={panelId} role="region" aria-label={`${r.phase}: what this stage covers`} hidden={!isOpen}>
              <p className="rm__panel-label mono">stage {String(i + 1).padStart(2, "0")} · {r.phase} · {r.items.length} items</p>
              <ul className="rm__items">
                {r.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
