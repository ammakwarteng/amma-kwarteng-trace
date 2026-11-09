import { useEffect, useState } from "react";
import { heroMedia as M } from "../data/site.js";

/*
  Background layer for the editorial hero: a black-and-white portrait behind frosted, vertically
  ribbed glass. All text stays as real HTML above it.
  - image / imageMobile: the photograph (set paths in src/data/site.js -> heroMedia)
  - video + poster: optional short muted loop (e.g. from Higgsfield); never autoplays with
    reduced motion, and the poster/image is the static fallback
  - glass: CSS frosted-glass ribs over the photo (turn off if the glass is in the photo itself)
  With no image set yet, it shows only the dark glass and a clearly labelled placeholder note in
  the code (no stand-in photo).
*/
export default function HeroMedia() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => { setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const style = { "--focus": M.focus, "--focus-m": M.focusMobile };
  const hasPhoto = !!(M.image || M.poster);
  return (
    <div className={`hmedia ${hasPhoto ? "" : "is-empty"} ${M.glass ? "has-glass" : ""}`} style={style} aria-hidden="true">
      {M.video && !reduce ? (
        <video className="hmedia__photo" autoPlay muted loop playsInline preload="metadata" poster={M.poster || M.image || undefined}>
          <source src={M.video} type="video/mp4" />
        </video>
      ) : hasPhoto ? (
        <picture>
          {M.imageMobile && <source media="(max-width: 760px)" srcSet={M.imageMobile} />}
          <img className="hmedia__photo" src={M.image || M.poster} alt="" decoding="async" fetchpriority="high" />
        </picture>
      ) : null /* PLACEHOLDER: no portrait yet. Add it in site.js -> heroMedia.image */}
      <span className="hmedia__glass" />
      <span className="hmedia__light" />
      <span className="hmedia__shade" />
    </div>
  );
}
