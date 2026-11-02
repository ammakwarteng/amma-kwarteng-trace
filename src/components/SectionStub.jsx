import "./SectionStub.css";

// Holds each nav destination so every link lands somewhere real during the
// staged build. Stage 4 replaces these with the finished sections.
export default function SectionStub({ id, index, title, note }) {
  return (
    <section className="stub" id={id} aria-labelledby={`${id}-title`}>
      <span className="mono stub__no">{String(index).padStart(2, "0")}</span>
      <h2 id={`${id}-title`} className="stub__title">{title}</h2>
      <p className="mono stub__note">{note}</p>
    </section>
  );
}
