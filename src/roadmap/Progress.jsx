/*
  Progress, counted from milestones (never a made-up percentage): one fine tick per milestone,
  filled once completed, half-drawn while learning. Only this stage is counted (Amma's choice).
*/
export default function Progress({ items }) {
  const done = items.filter((m) => m.status === "completed").length;
  const learning = items.filter((m) => m.status === "learning").length;
  const pad = (v) => String(v).padStart(2, "0");
  return (
    <div className="rm-progress" aria-label={`${done} of ${items.length} milestones completed in this stage${learning ? `, ${learning} in progress` : ""}`}>
      <div className="rm-progress__ticks" aria-hidden="true">
        {items.map((m, i) => <i key={m.id || m.tmp} className={`is-${m.status}`} style={{ "--i": i }} />)}
      </div>
      <p className="rm-progress__count mono">
        <b>{pad(done)}</b> / {pad(items.length)} completed{learning ? ` · ${learning} learning` : ""}
      </p>
    </div>
  );
}
