import { stageBySlug } from "./data.js";
import StagePage from "./StagePage.jsx";
import OwnerPage from "./OwnerPage.jsx";
import "./roadmap.css";

// The career roadmap pages: /roadmap/<stage> for everyone, /owner for the owner's sign-in.
export default function RoadmapApp({ path }) {
  const m = path.match(/^\/roadmap\/([a-z0-9-]+)\/?$/);
  const slug = m && stageBySlug(m[1]) ? m[1] : null;
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="rm-bar">
        <a className="rm-bar__home" href="/">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5.5" /><path d="M12 3v5M12 16v5M3 12h5M16 12h5" /></svg>
          amma kwarteng
        </a>
        <a className="rm-bar__back mono" href="/#about">← about · roadmap</a>
      </header>
      {path.replace(/\/$/, "") === "/owner" ? <OwnerPage /> : slug ? <StagePage slug={slug} /> : (
        <main className="rm" id="main">
          <header className="rm-head">
            <p className="rm-kicker mono">404 · not found</p>
            <h1 className="rm-title">lost the trace</h1>
            <p className="rm-goal">This page doesn't exist. <a href="/">Back to the portfolio</a>.</p>
          </header>
        </main>
      )}
    </>
  );
}
