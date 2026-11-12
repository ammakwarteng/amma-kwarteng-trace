import { useState } from "react";
import { fmtDate, projectName, cap } from "./data.js";

const STATUSES = ["planned", "learning", "completed"];
const today = () => new Date().toLocaleDateString("en-CA");   // YYYY-MM-DD, local

/*
  One milestone: a row that opens to its dates and linked projects. In the owner's editing mode
  it also holds the status switch, the completion date, project links and (for certifications)
  the explicit "I passed this exam" confirmation the database requires.
*/
export default function Milestone({ m, n, editing, edit, remove, projects }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const isCert = m.kind === "certification";
  const id = `ms-${m.id || m.tmp}`;

  const status = (s) => {
    if (s === m.status) return;
    if (s === "completed" && isCert && !m.earned_confirmed) { setConfirming(true); return; }
    edit(m, s === "completed" ? { status: s, completed_on: m.completed_on || today() } : { status: s, completed_on: null });
  };
  const toggleProject = (slug) => {
    const has = (m.projects || []).includes(slug);
    edit(m, { projects: has ? m.projects.filter((p) => p !== slug) : [...(m.projects || []), slug] });
  };

  const label =
    m.status === "completed" ? `completed · ${fmtDate(m.completed_on) || "today"}` :
    m.status === "learning" ? `learning${m.started_on ? ` · since ${fmtDate(m.started_on)}` : ""}` : "planned";

  return (
    <li className={`ms is-${m.status} ${isCert ? "is-cert" : ""} ${open || editing ? "is-open" : ""}`}>
      <button type="button" className="ms__row" aria-expanded={open || editing} aria-controls={id} onClick={() => setOpen((v) => !v)} disabled={editing}>
        <span className="ms__mark" aria-hidden="true" />
        <span className="ms__no mono" aria-hidden="true">{String(n).padStart(2, "0")}</span>
        <span className="ms__title">{cap(m.title)}</span>
        <span className="ms__status mono">{label}</span>
      </button>

      <div className="ms__detail" id={id}>
        <div className="ms__inner">
          {!editing && (
            <dl className="ms__facts mono">
              <div><dt>status</dt><dd>{m.status}{isCert && m.status === "completed" && m.earned_confirmed ? " · earned" : ""}</dd></div>
              {m.started_on && <div><dt>started</dt><dd>{fmtDate(m.started_on)}</dd></div>}
              {m.completed_on && <div><dt>completed</dt><dd>{fmtDate(m.completed_on)}</dd></div>}
              <div><dt>projects</dt><dd>{m.projects?.length ? m.projects.map((p) => <a key={p} href="/#projects">{projectName(p)}</a>) : "none linked yet"}</dd></div>
            </dl>
          )}

          {editing && (
            <div className="ms__edit">
              <div className="ms__seg" role="radiogroup" aria-label={`Status of ${m.title}`}>
                {STATUSES.map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={m.status === s} className={m.status === s ? "is-on" : ""} onClick={() => status(s)}>{s}</button>
                ))}
              </div>

              {confirming && (
                <div className="ms__confirm" role="alertdialog" aria-label="Confirm certification">
                  <p>Mark <b>{m.title}</b> as earned? Only do this once you've passed the exam.</p>
                  <button type="button" className="rm-btn rm-btn--solid" onClick={() => { edit(m, { status: "completed", earned_confirmed: true, completed_on: m.completed_on || today() }); setConfirming(false); }}>yes, I passed it</button>
                  <button type="button" className="rm-btn" onClick={() => setConfirming(false)}>cancel</button>
                </div>
              )}

              {m.status === "completed" && (
                <label className="ms__field mono">
                  completed on
                  <input type="date" value={m.completed_on || today()} max={today()} onChange={(e) => edit(m, { completed_on: e.target.value || today() })} />
                </label>
              )}

              {projects.length > 0 && (
                <fieldset className="ms__projects">
                  <legend className="mono">linked projects</legend>
                  {projects.map((p) => (
                    <label key={p.slug}>
                      <input type="checkbox" checked={(m.projects || []).includes(p.slug)} onChange={() => toggleProject(p.slug)} />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              {m.tmp && <button type="button" className="rm-btn rm-btn--quiet" onClick={() => remove(m)}>remove (not saved yet)</button>}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
