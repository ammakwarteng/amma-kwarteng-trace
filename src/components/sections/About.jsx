import { about } from "../../data/content.js";
import "./sections.css";

// the About introduction (all paragraphs, or a range of them): shown beside the portrait at the
// end of the hero transformation (see Hero.jsx)
export function AboutText({ from = 0, to }) {
  return (
    <div className={`about__text ${from ? "about__text--rest" : ""}`}>
      {about.slice(from, to).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}
