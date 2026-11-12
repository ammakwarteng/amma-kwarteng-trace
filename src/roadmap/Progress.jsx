/*
  Progress, counted from milestones (never a made-up percentage): one fine tick per milestone,
  filled once completed, half-drawn while learning. A second, quieter line counts the whole
  roadmap across all four stages.
*/
export default function Progress({ items, overall, live }) {
  const done = items.filter((m) => m.status === "completed").length;
  const learning = items.filter((m) => m.status === "learning").length;
  const allDone = overall.filter((m) => m.status === "completed").length;
  const pad = (v) => String(v).padStart(2, "0");
  return (
    <div className="rm-progress" aria-label={`${done} of ${items.length} milestones completed in this stage${learning ? `, ${learning} in progress` : ""}`}>
      <div className="rm-progress__ticks" aria-hidden="true">
        {items.map((m, i) => <i key={m.id || m.tmp} className={`is-${m.status}`} style={{ "--i": i }} />)}
      </div>
      <p className="rm-progress__count mono">
        <b>{pad(done)}</b> / {pad(items.length)} completed{learning ? ` · ${learning} learning` : ""}
        {live && <span className="rm-progress__all"> · whole roadmap {pad(allDone)} / {pad(overall.length)}</span>}
      </p>
    </div>
  );
}
