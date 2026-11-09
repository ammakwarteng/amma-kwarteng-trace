import { useEffect, useRef, useState } from "react";
import { projects } from "../../data/content.js";
import "./sections.css";
import AccessReview from "./AccessReview.jsx";

const url = (src) => `${import.meta.env.BASE_URL}${src}`;

// 03 · Projects as case files: a contents list, then one spread per project (file details on
// the left; title, summary, figures and the expandable case file on the right).
// Content lives in src/data/content.js. Tapping a figure opens it large.
export default function Projects() {
  const [shot, setShot] = useState(null); // { list, index }
  const [openCards, setOpenCards] = useState(() => new Set()); // cards showing full details
  const toggleCard = (name) =>
    setOpenCards((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  const dialogRef = useRef(null);
  const reviewRef = useRef(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (shot && !d.open) d.showModal();
    if (!shot && d.open) d.close();
  }, [shot]);

  useEffect(() => {
    if (!shot) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setShot((s) => ({ ...s, index: (s.index + 1) % s.list.length }));
      if (e.key === "ArrowLeft") setShot((s) => ({ ...s, index: (s.index - 1 + s.list.length) % s.list.length }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shot]);

  const current = shot && shot.list[shot.index];

  const slug = (name) => name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

  return (
    <div className="pj">
      {/* contents: one row per case file, jumps to it */}
      <ol className="pj-index" aria-label="Case files">
        {projects.map((p, n) => (
          <li key={p.name}>
            <a href={`#case-${slug(p.name)}`} className="pj-index__row">
              <span className="pj-index__no mono">PRJ-{String(n + 1).padStart(2, "0")}</span>
              <span className="pj-index__name">{p.name}</span>
              <span className="pj-index__type mono">{p.type}</span>
              <span className="pj-index__year mono">{p.year}</span>
              <span className={`pj-index__status mono is-${p.status.replace(/\s+/g, "-")}`}><i aria-hidden="true" />{p.status}</span>
            </a>
          </li>
        ))}
      </ol>

      {projects.map((p, n) => {
        const isOpen = openCards.has(p.name);
        const detailsId = `case-details-${slug(p.name)}`;
        const no = `PRJ-${String(n + 1).padStart(2, "0")}`;
        return (
          <article key={p.name} id={`case-${slug(p.name)}`} className={`case ${isOpen ? "is-open" : ""}`} aria-labelledby={`case-title-${slug(p.name)}`}>
            <aside className="case__meta mono" aria-label={`${p.name}: file details`}>
              <p className="case__no">{no}</p>
              <dl>
                <div><dt>type</dt><dd>{p.type}</dd></div>
                <div><dt>year</dt><dd>{p.year}</dd></div>
                <div><dt>status</dt><dd className={`case__status is-${p.status.replace(/\s+/g, "-")}`}><i aria-hidden="true" />{p.status}</dd></div>
              </dl>
              <ul className="case__tags" aria-label="Skills used">
                {p.tags.map((t) => <li key={t}>{t}</li>)}
              </ul>
              {p.image && (
                <figure className="case__figure">
                  <img src={url(p.image.src)} alt={p.image.alt} width="56" height="56" loading="lazy" />
                  <figcaption>{p.image.caption}</figcaption>
                </figure>
              )}
            </aside>

            <div className="case__main">
              <h3 className="case__title" id={`case-title-${slug(p.name)}`}>{p.name}</h3>
              <p className="case__summary">{p.summary}</p>

              {p.gallery?.length > 0 && (
                <>
                  <ul
                    className="project__gallery case__gallery"
                    aria-label={`${p.name} screenshots`}
                    onScroll={(e) => {
                      const g = e.currentTarget;
                      g.classList.toggle("is-end", g.scrollLeft + g.clientWidth >= g.scrollWidth - 4);
                    }}
                  >
                    {p.gallery.map((g, i) => (
                      <li key={g.src}>
                        <button type="button" onClick={() => setShot({ list: p.gallery, index: i })} aria-label={`Open screenshot: ${g.caption}`}>
                          <img src={url(g.src)} alt="" width="1120" height="630" loading="lazy" />
                        </button>
                        <span className="case__shot-no mono" aria-hidden="true">fig. {String(i + 1).padStart(2, "0")}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="project__gallery-hint mono" aria-hidden="true">{p.gallery.length} figures · scroll sideways, tap to enlarge</p>
                </>
              )}

              <div className="case__actions">
                <button
                  type="button"
                  className="case__toggle mono"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => toggleCard(p.name)}
                >
                  <span className="case__toggle-icon" aria-hidden="true" />
                  {isOpen ? "close case file" : `open case file · ${p.points.length} entries`}
                </button>
                {p.demo === "access-review" && (
                  <button type="button" className="case__try mono" onClick={() => reviewRef.current?.showModal()}>open the review queue →</button>
                )}
                {p.links?.map((l) => (
                  <a key={l.url} className="case__try mono" href={l.url} {...(/^https?:/.test(l.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label} →</a>
                ))}
              </div>

              <div className="case__details" id={detailsId} hidden={!isOpen}>
                <ol className="case__points">
                  {p.points.map((pt, i) => (
                    <li key={pt}><span className="mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{pt}</li>
                  ))}
                </ol>
                {p.next && <p className="case__next mono">{p.next}</p>}
              </div>
            </div>
          </article>
        );
      })}

      <dialog ref={reviewRef} className="ar-dialog" aria-label="Access request review" onClick={(e) => { if (e.target === reviewRef.current) reviewRef.current.close(); }}>
        <div className="ar-dialog__top"><h3>access request review</h3><button type="button" onClick={() => reviewRef.current?.close()}>close</button></div>
        <AccessReview />
        <p className="ar-dialog__note">fictional people and systems · simulated decisions and audit events · nothing is sent anywhere</p>
      </dialog>

      <dialog
        ref={dialogRef}
        className="shot"
        onClose={() => setShot(null)}
        onClick={(e) => { if (e.target === dialogRef.current) setShot(null); }}
      >
        {current && (
          <figure className="shot__figure">
            <img src={url(current.src)} alt={current.caption} />
            <figcaption>
              <span className="mono">{String(shot.index + 1).padStart(2, "0")} / {String(shot.list.length).padStart(2, "0")}</span>
              {current.caption}
            </figcaption>
            <div className="shot__nav">
              <button type="button" onClick={() => setShot((s) => ({ ...s, index: (s.index - 1 + s.list.length) % s.list.length }))}>previous</button>
              <button type="button" onClick={() => setShot((s) => ({ ...s, index: (s.index + 1) % s.list.length }))}>next</button>
              <button type="button" onClick={() => setShot(null)}>close</button>
            </div>
          </figure>
        )}
      </dialog>
    </div>
  );
}
