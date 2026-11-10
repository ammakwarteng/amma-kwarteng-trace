import { useEffect, useRef, useState } from "react";
import { projects } from "../../data/content.js";
import "./sections.css";

const url = (src) => `${import.meta.env.BASE_URL}${src}`;

// Projects, newest first. Content lives in src/data/content.js.
// A project's gallery shows thumbnails; tapping one opens it large.
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

  return (
    <div className="projects-wrap">
    {projects.length > 1 && <p className="projects-hint projects-hint--phone mono" aria-hidden="true">{projects.length} projects · swipe sideways</p>}
    <div className="projects" aria-label="Projects">
      {projects.map((p, n) => {
        const isOpen = openCards.has(p.name);
        const detailsId = `project-details-${p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
        return (
        <article key={p.name} className={`project tf tf-hover ${isOpen ? "is-open" : ""}`}>
          <p className="project__meta mono">
            <span className="project__status idl">
              <b>PRJ-{String(n + 1).padStart(2, "0")}</b>
              {p.type && <span>· {p.type} ·</span>}
              <i className={`project__dot is-${p.status.replace(/\s+/g, "-")}`} aria-hidden="true" />
              <span className={`st ${p.status === "live" ? "is-secure" : ""}`}>{p.status}</span>
            </span>
            <span>{p.year}</span>
          </p>
          <h3 className="project__name">{p.name}</h3>
          {/* the lead picture, set like a magazine figure with its caption */}
          {p.gallery?.length > 0 && (
            <figure className="project__lead">
              <button type="button" onClick={() => setShot({ list: p.gallery, index: 0 })} aria-label={`Open screenshot: ${p.gallery[0].caption}`}>
                <img src={url(p.gallery[0].src)} alt="" width="1120" height="630" loading="lazy" />
              </button>
              <figcaption><span className="mono">fig. {n + 1}</span>{p.gallery[0].caption}</figcaption>
            </figure>
          )}
          <p className="project__summary">{p.summary}</p>
          {p.gallery?.length > 1 && (
            <ul
              className="project__gallery"
              aria-label={`${p.name} screenshots`}
              onScroll={(e) => {
                const g = e.currentTarget;
                g.classList.toggle("is-end", g.scrollLeft + g.clientWidth >= g.scrollWidth - 4);
              }}
            >
              {p.gallery.map((g, i) => i === 0 ? null : (
                <li key={g.src}>
                  <button type="button" onClick={() => setShot({ list: p.gallery, index: i })} aria-label={`Open screenshot: ${g.caption}`}>
                    <img src={url(g.src)} alt="" width="1024" height="768" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {p.gallery?.length > 1 && (
            <p className="project__gallery-hint mono" aria-hidden="true">{p.gallery.length - 1} more · scroll sideways, tap to enlarge</p>
          )}
          {p.image && (
            <figure className="project__figure">
              <img src={url(p.image.src)} alt={p.image.alt} width="72" height="72" loading="lazy" />
              <figcaption className="mono">{p.image.caption}</figcaption>
            </figure>
          )}
          <div className="project__details" id={detailsId} hidden={!isOpen}>
            <ul className="project__points">
              {p.points.map((pt) => <li key={pt}>{pt}</li>)}
            </ul>
            {p.next && <p className="project__next mono">{p.next}</p>}
          </div>
          <button
            type="button"
            className="project__more mono"
            aria-expanded={isOpen}
            aria-controls={detailsId}
            onClick={() => toggleCard(p.name)}
          >
            {isOpen ? "show less" : `read more · ${p.points.length} details`}
          </button>
          <ul className="project__tags" aria-label="Skills used">
            {p.tags.map((t) => <li key={t} className="mono">{t}</li>)}
          </ul>
          {p.links?.length > 0 && (
            <p className="project__links">
              {p.links.map((l) => (
                <a key={l.url} href={l.url} {...(/^https?:/.test(l.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}</a>
              ))}
            </p>
          )}
        </article>
        );
      })}
    </div>


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
