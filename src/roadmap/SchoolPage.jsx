import { useEffect, useState } from "react";
import { school } from "../data/content.js";

/*
  Schoolwork, set out like a computer's file browser: a folder per course; open a folder to see
  the files (pieces of coursework) inside; open a file to preview it. A path bar at the top
  (SCHOOLWORK / CODE) leads back. Content lives in content.js (`school`): only Amma's own work and
  descriptions, never full assignment answers, classmates' names or instructor comments.
*/
function Folder() {
  return (
    <svg className="sch-ico sch-ico--folder" viewBox="0 0 64 50" aria-hidden="true">
      <path className="sch-back" d="M2 8 V46 H62 V12 H28 L22 6 H4 Z" />
      <path className="sch-flap" d="M2 18 H62 V46 H2 Z" />
    </svg>
  );
}
function File() {
  return (
    <svg className="sch-ico sch-ico--file" viewBox="0 0 44 54" aria-hidden="true">
      <path d="M3 2 H30 L41 13 V52 H3 Z" />
      <path d="M30 2 V13 H41 M10 24 H34 M10 32 H34 M10 40 H26" />
    </svg>
  );
}

export default function SchoolPage() {
  const [course, setCourse] = useState(null);   // index of the open folder
  const [file, setFile] = useState(null);       // index of the open file
  useEffect(() => { document.title = "Schoolwork · TRACE"; }, []);
  useEffect(() => {
    if (file === null) return;
    const onKey = (e) => { if (e.key === "Escape") setFile(null); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [file]);

  const c = course === null ? null : school[course];
  const f = c && file !== null ? c.files[file] : null;

  return (
    <main className="rm sch" id="main">
      <header className="rm-head">
        <p className="rm-kicker mono">the coursework</p>
        <h1 className="rm-title">Schoolwork</h1>
      </header>

      <nav className="sch-path mono" aria-label="Location">
        <button type="button" onClick={() => { setCourse(null); setFile(null); }} disabled={!c}>Schoolwork</button>
        {c && <><span aria-hidden="true">/</span><span aria-current="page">{c.code}</span></>}
        <span className="sch-count">{c ? `${c.files.length} ${c.files.length === 1 ? "item" : "items"}` : `${school.length} folders`}</span>
      </nav>

      {!c && (
        <ul className="sch-grid" key="folders">
          {school.map((s, i) => (
            <li key={s.code}>
              <button type="button" className="sch-item" onClick={() => setCourse(i)}>
                <Folder />
                <span className="sch-code mono">{s.code}</span>
                <span className="sch-name">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {c && (
        <section className="sch-open" key={c.code} aria-label={c.name}>
          <h2 className="sch-title">{c.name}</h2>
          {c.files.length === 0 ? (
            <p className="rm-empty mono">This folder is empty for now. Coursework will be added here.</p>
          ) : (
            <ul className="sch-grid sch-grid--files">
              {c.files.map((x, i) => (
                <li key={x.title}>
                  <button type="button" className="sch-item" onClick={() => setFile(i)}>
                    <File />
                    <span className="sch-name">{x.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {f && (
        <div className="sch-view" role="dialog" aria-modal="true" aria-label={f.title} onClick={() => setFile(null)}>
          <div className="sch-view__card" onClick={(e) => e.stopPropagation()}>
            <div className="sch-view__bar mono">
              <span>{c.code} / {f.title}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Close">×</button>
            </div>
            {f.image && <img src={`/${f.image}`} alt={f.title} />}
            {f.note && <p className="rm-goal">{f.note}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
