import { useEffect, useMemo, useState } from "react";
import { STAGES, stageBySlug, loadRoadmap, checkOwner, setLocked, saveAndLock, supabase, fmtDate, PROJECTS, projectName } from "./data.js";
import Progress from "./Progress.jsx";
import Milestone from "./Milestone.jsx";

/*
  One career stage: its learning roadmap (milestones), progress, certification goals, linked
  projects and a history of completed milestones. Visitors only ever read. The owner, signed in
  with MFA (see /owner), sees a lock bar: Unlock, edit, then Save & Lock. The database enforces
  all of it; the bar is just the way in.
*/
export default function StagePage({ slug }) {
  const meta = stageBySlug(slug);
  const [data, setData] = useState(null);
  const [owner, setOwner] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [changes, setChanges] = useState({});   // id -> patch, not yet saved
  const [added, setAdded] = useState([]);       // new milestones, not yet saved

  const reload = async () => setData(await loadRoadmap());
  useEffect(() => { reload(); checkOwner().then(setOwner); }, [slug]);
  useEffect(() => { document.title = `${meta.title} · roadmap · TRACE`; }, [meta]);

  const stage = data?.stages.find((s) => s.slug === slug);
  const editing = owner && data?.live && stage && !stage.locked;
  const saved = useMemo(() => (data ? data.milestones.filter((m) => m.stage_slug === slug) : []), [data, slug]);
  const list = [...saved.map((m) => ({ ...m, ...(changes[m.id] || {}) })), ...added];
  const skills = list.filter((m) => m.kind !== "certification");
  const certs = list.filter((m) => m.kind === "certification");
  const history = list.filter((m) => m.status === "completed" && m.completed_on).sort((a, b) => b.completed_on.localeCompare(a.completed_on));
  const allMs = data ? data.milestones : [];
  const unsaved = Object.keys(changes).length + added.length;

  const edit = (m, patch) => {
    if (m.tmp) setAdded((a) => a.map((x) => (x.tmp === m.tmp ? { ...x, ...patch } : x)));
    else setChanges((c) => ({ ...c, [m.id]: { ...(c[m.id] || {}), ...patch } }));
  };
  const remove = (m) => setAdded((a) => a.filter((x) => x.tmp !== m.tmp));
  const add = (title, kind) => setAdded((a) => [...a, { tmp: `new-${Date.now()}`, title, kind, status: "planned", projects: [], earned_confirmed: false, position: Math.max(0, ...list.map((m) => m.position || 0)) + 1 }]);

  const run = async (label, fn) => {
    setBusy(label); setError("");
    try { await fn(); } catch (e) { setError(e.message || String(e)); }
    setBusy("");
  };
  const unlock = () => run("unlocking", async () => {
    if (!(await setLocked(slug, false))) throw new Error("The database refused to unlock this stage. Sign in again at /owner.");
    await reload();
  });
  const save = () => run("saving", async () => {
    await saveAndLock(slug, changes, added);
    setChanges({}); setAdded([]);
    await reload();
  });
  const discard = () => run("locking", async () => {
    setChanges({}); setAdded([]);
    await setLocked(slug, true);
    await reload();
  });
  const signOut = async () => { await supabase.auth.signOut(); setOwner(false); };

  const i = STAGES.indexOf(meta), prev = STAGES[i - 1], next = STAGES[i + 1];

  return (
    <main className="rm" id="main">
      {owner && data?.live && (
        <div className={`rm-lock ${editing ? "is-open" : ""}`} role="region" aria-label="Owner controls">
          <p className="rm-lock__state mono">
            <i className="rm-lock__dot" aria-hidden="true" />
            {editing ? `unlocked · editing${unsaved ? ` · ${unsaved} unsaved` : ""}` : "stage locked · read-only"}
          </p>
          <div className="rm-lock__actions">
            {editing ? (
              <>
                <button type="button" className="rm-btn rm-btn--solid" onClick={save} disabled={!!busy}>{busy === "saving" ? "saving…" : "save & lock"}</button>
                <button type="button" className="rm-btn" onClick={discard} disabled={!!busy}>discard</button>
              </>
            ) : (
              <button type="button" className="rm-btn" onClick={unlock} disabled={!!busy}>{busy === "unlocking" ? "unlocking…" : "unlock to edit"}</button>
            )}
            <button type="button" className="rm-btn rm-btn--quiet" onClick={signOut}>sign out</button>
          </div>
          {error && <p className="rm-lock__error" role="alert">{error}</p>}
        </div>
      )}

      <header className="rm-head">
        <p className="rm-kicker mono">roadmap · {String(i + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")} · {meta.when}</p>
        <h1 className="rm-title">{meta.title}</h1>
        <p className="rm-goal">{meta.goal}</p>
        {data && <Progress items={list} overall={allMs} live={data.live} />}
      </header>

      {!data && <p className="rm-note mono">loading…</p>}
      {data && !data.live && <p className="rm-note mono">live progress couldn't be loaded right now; this is the plan.</p>}

      {data && (
        <>
          <Group label="milestones" items={skills} editing={editing} edit={edit} remove={remove} add={(t) => add(t, "skill")} />
          <Group label="certification goals" items={certs} editing={editing} edit={edit} remove={remove} add={(t) => add(t, "certification")} />

          <section className="rm-sec" aria-labelledby="rm-history">
            <h2 className="rm-sec__label mono" id="rm-history">history</h2>
            {history.length ? (
              <ol className="rm-history">
                {history.map((m) => (
                  <li key={m.id || m.tmp}>
                    <time className="mono" dateTime={m.completed_on}>{fmtDate(m.completed_on)}</time>
                    <span>{m.title}</span>
                    {m.projects?.length > 0 && <span className="rm-history__proj mono">{m.projects.map(projectName).join(" · ")}</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rm-empty mono">nothing completed here yet. completed milestones are recorded here with their dates.</p>
            )}
          </section>
        </>
      )}

      <nav className="rm-pager" aria-label="Other stages">
        {prev ? <a href={`/roadmap/${prev.slug}`}><span className="mono">previous</span>{prev.title}</a> : <span />}
        {next ? <a href={`/roadmap/${next.slug}`} className="is-next"><span className="mono">next</span>{next.title}</a> : <span />}
      </nav>
    </main>
  );
}

function Group({ label, items, editing, edit, remove, add }) {
  const [title, setTitle] = useState("");
  if (!items.length && !editing) return null;
  return (
    <section className="rm-sec">
      <h2 className="rm-sec__label mono">{label}</h2>
      <ol className="rm-list">
        {items.map((m, n) => <Milestone key={m.id || m.tmp} m={m} n={n + 1} editing={editing} edit={edit} remove={remove} projects={PROJECTS} />)}
      </ol>
      {editing && (
        <form className="rm-add" onSubmit={(e) => { e.preventDefault(); if (title.trim()) { add(title.trim()); setTitle(""); } }}>
          <label className="visually-hidden" htmlFor={`add-${label}`}>New {label === "milestones" ? "milestone" : "certification"}</label>
          <input id={`add-${label}`} value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} placeholder={label === "milestones" ? "add a milestone" : "add a certification goal"} />
          <button type="submit" className="rm-btn" disabled={!title.trim()}>add</button>
        </form>
      )}
    </section>
  );
}
