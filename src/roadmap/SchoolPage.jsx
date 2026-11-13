import { useEffect, useState } from "react";
import { school } from "../data/content.js";

/*
  Schoolwork: a quiet page (/school), linked only from the footer. Each course opens to show
  what it covered, the skills used and any pieces of work. Content lives in content.js
  (`school`); only Amma's own work and descriptions go here, never full assignment answers.
*/
export default function SchoolPage() {
  const [open, setOpen] = useState(() => new Set());
  useEffect(() => { document.title = "Schoolwork · TRACE"; }, []);
  const toggle = (k) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <main className="rm" id="main">
      <header className="rm-head">
        <p className="rm-kicker mono">the coursework</p>
        <h1 className="rm-title">Schoolwork</h1>
        <p className="rm-goal">Courses I've taken and the work I've done in them.</p>
      </header>

      {school.length === 0 ? (
        <p className="rm-empty mono">Courses will be listed here soon.</p>
      ) : (
        <section className="rm-sec">
          <h2 className="rm-sec__label mono">courses</h2>
          <ol className="rm-list">
            {school.map((c, n) => {
              const key = c.code || c.name, isOpen = open.has(key), id = `course-${n}`;
              return (
                <li key={key} className={`ms ${isOpen ? "is-open" : ""} is-completed`}>
                  <button type="button" className="ms__row" aria-expanded={isOpen} aria-controls={id} onClick={() => toggle(key)}>
                    <span className="ms__mark" aria-hidden="true" />
                    <span className="ms__no mono" aria-hidden="true">{String(n + 1).padStart(2, "0")}</span>
                    <span className="ms__title">{c.name}</span>
                    <span className="ms__status mono">{[c.code, c.term].filter(Boolean).join(" · ")}</span>
                  </button>
                  <div className="ms__detail" id={id}>
                    <div className="ms__inner">
                      {c.about && <p className="rm-goal">{c.about}</p>}
                      {c.skills?.length > 0 && (
                        <ul className="road__items school__skills">
                          {c.skills.map((s) => <li key={s}>{s}</li>)}
                        </ul>
                      )}
                      {c.work?.length > 0 && (
                        <ul className="school__work">
                          {c.work.map((w) => (
                            <li key={w.title}>
                              <span>{w.title}</span>
                              {w.note && <span className="mono school__note">{w.note}</span>}
                              {w.image && <img src={`/${w.image}`} alt={w.title} loading="lazy" />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
