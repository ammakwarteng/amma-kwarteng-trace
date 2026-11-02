import "./ArtifactSlot.css";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/*
  A floating artifact around the word.
  With a photo (src), it shows the cutout with a soft shadow.
  Without one, it shows a clearly labelled placeholder until the photo arrives.
*/
export default function ArtifactSlot({ index, label, src, width, height, className = "" }) {
  if (src) {
    return (
      <figure className={`art art--photo ${className}`}>
        <img src={asset(src)} alt={label} width={width} height={height} loading="eager" decoding="async" draggable="false" />
      </figure>
    );
  }
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
