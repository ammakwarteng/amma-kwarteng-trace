import "./ArtifactSlot.css";

// A clearly labelled placeholder for a photographic cutout.
// Stage 2 replaces each slot with the real photo once it is supplied.
export default function ArtifactSlot({ index, label, className = "" }) {
  return (
    <figure className={`slot ${className}`} aria-hidden="true">
      <span className="slot__no mono">Artifact {String(index).padStart(2, "0")}</span>
      <figcaption className="slot__label mono">
        {label}
        <br />
        Photo needed
      </figcaption>
    </figure>
  );
}
