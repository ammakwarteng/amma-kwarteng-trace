import { roadmap, certifications } from "../../data/content.js";

// 01 · About: a thin profile index under the introduction, built only from existing content.
const nowI = Math.max(0, roadmap.findIndex((r) => r.now));
const ROWS = [
  ["discipline", "identity & access management"],
  ["now", roadmap[nowI]?.phase],
  ["credential", certifications.filter((c) => c.status === "earned").map((c) => c.name).join(", ")],
  ["next", roadmap[nowI + 1]?.phase],
].filter(([, v]) => v);

export default function ProfileIndex() {
  return (
    <dl className="pi">
      {ROWS.map(([k, v]) => (
        <div key={k} className="pi__cell"><dt className="mono">{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}
