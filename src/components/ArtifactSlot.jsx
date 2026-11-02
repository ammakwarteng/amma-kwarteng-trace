import "./ArtifactSlot.css";

// A clearly labelled placeholder for a photographic cutout.
// Each one is replaced by Amma's real photo once it is supplied.
export default function ArtifactSlot({ index, label, className = "" }) {
  return (
    <figure className={`art ${className}`} aria-hidden="true">
      <div className="art__inner">
        <span className="mono">artifact {String(index).padStart(2, "0")}</span>
        <figcaption className="mono">
          {label}
          <br />
          photo needed
        </figcaption>
      </div>
    </figure>
  );
}
