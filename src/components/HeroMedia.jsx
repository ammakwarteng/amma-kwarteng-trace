import { useEffect, useRef, useState } from "react";
import { playInline, playOnFirstGesture, prepareInline } from "../inlineVideo.js";
import { heroMedia as M } from "../data/site.js";

/*
  Background layer for the editorial hero: a black-and-white portrait behind frosted, vertically
  ribbed glass. All text stays as real HTML above it. Hero.jsx clips this
  layer (frameRef) and moves the portrait inside it (moveRef) as the visitor scrolls.
  - image / imageMobile: the photograph (set paths in src/data/site.js -> heroMedia)
  - video + poster: optional short muted loop (e.g. from Higgsfield); never autoplays with
    reduced motion, and the poster/image is the static fallback
  - glass: CSS frosted-glass ribs over the photo (turn off if the glass is in the photo itself)
  With no image set yet, it shows only the dark glass and a clearly labelled placeholder note in
  the code (no stand-in photo).
*/
export default function HeroMedia({ frameRef, moveRef }) {
  const [reduce, setReduce] = useState(false);
  const vref = useRef(null);
  useEffect(() => { setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  // the Higgsfield portrait loop plays on every screen size (reduced motion: still image)
  const useVideo = !!M.video && !reduce;
  // start it explicitly: Safari only autoplays when `muted` is an attribute on the element itself
  useEffect(() => {
    const v = vref.current; if (!useVideo || !v) return;
    prepareInline(v);
    let off = () => {};
    const go = () => playInline(v).catch(() => { off = playOnFirstGesture(v); });
    if (v.readyState >= 2) go(); else v.addEventListener("loadeddata", go, { once: true });
    v.load();
    return () => off();
  }, [useVideo]);
  const style = { "--focus": M.focus, "--focus-m": M.focusMobile };
  const hasPhoto = !!(M.image || M.poster);
  return (
    <div ref={frameRef} className={`hmedia ${hasPhoto ? "" : "is-empty"} ${M.glass ? "has-glass" : ""}`} style={style} aria-hidden="true">
      {/* the portrait moves as one piece when the hero turns into the About panel (Hero.jsx) */}
      <div className="hmedia__move" ref={moveRef}>
      {useVideo ? (
        <video ref={vref} className="hmedia__photo hmedia__video" autoPlay muted loop playsInline preload="auto" poster={M.poster || M.image || undefined}>
          <source src={M.video} type="video/mp4" />
        </video>
      ) : hasPhoto ? (
        <picture>
          {M.imageMobile && <source media="(max-width: 760px)" srcSet={M.imageMobile} />}
          <img className="hmedia__photo" src={M.image || M.poster} alt="" decoding="async" fetchpriority="high" />
        </picture>
      ) : null /* PLACEHOLDER: no portrait yet. Add it in site.js -> heroMedia.image */}
      </div>
      <span className="hmedia__glass" />
      <span className="hmedia__light" />
      <span className="hmedia__shade" />
    </div>
  );
}
