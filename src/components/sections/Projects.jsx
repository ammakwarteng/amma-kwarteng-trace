import { projects } from "../../data/content.js";
import "./sections.css";

// Projects, newest first. Content lives in src/data/content.js.
export default function Projects() {
  return (
    <div className="projects">
      {projects.map((p) => (
        <article key={p.name} className="project">
          <p className="project__meta mono">
            <span><i className="project__dot" aria-hidden="true" />{p.status}</span>
            <span>{p.year}</span>
          </p>
          <h3 className="project__name">{p.name}</h3>
          <p className="project__summary">{p.summary}</p>
          <ul className="project__points">
            {p.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
          {p.image && (
            <figure className="project__figure">
              <img src={`${import.meta.env.BASE_URL}${p.image.src}`} alt={p.image.alt} width="72" height="72" loading="lazy" />
              <figcaption className="mono">{p.image.caption}</figcaption>
            </figure>
          )}
          <ul className="project__tags" aria-label="Skills used">
            {p.tags.map((t) => <li key={t} className="mono">{t}</li>)}
          </ul>
          {p.links?.length > 0 && (
            <p className="project__links">
              {p.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
              ))}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
