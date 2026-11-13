import Header from "./components/Header.jsx";
import { useCallback, useState } from "react";
import IntroFilm from "./components/intro/IntroFilm.jsx";
import Loader from "./components/loader/Loader.jsx";
import HeroDaylight from "./components/daylight/HeroDaylight.jsx";
import { AboutText, Roadmap } from "./components/sections/About.jsx";
import Trail from "./components/trail/Trail.jsx";
import EmailLink from "./components/EmailLink.jsx";
import Certifications from "./components/sections/Certifications.jsx";
import Resume from "./components/sections/Resume.jsx";
import Projects from "./components/sections/Projects.jsx";
import Skills from "./components/sections/Skills.jsx";
import Community from "./components/sections/Community.jsx";
import Volunteer from "./components/sections/Volunteer.jsx";
import { navItems, links } from "./data/site.js";

// Each section that is ready (see navItems in site.js). About is part of the hero stage
// (Hero.jsx), so the numbered sections below it start at 02.
const sections = navItems.map((item) => ({
  ...item,
  body:
    item.id === "about" ? (
      <div className="about"><AboutText /><Roadmap /></div>
    ) : item.id === "projects" ? (
      <Projects />
    ) : item.id === "skills" ? (
      <Skills />
    ) : item.id === "certifications" ? (
      <Certifications />
    ) : item.id === "community" ? (
      <Community />
    ) : item.id === "volunteer" ? (
      <Volunteer />
    ) : item.id === "resume" ? (
      <Resume />
    ) : item.id === "contact" ? (
      <div className="trail__contact">
        <EmailLink variant="full" />
        <ul className="trail__links">
          {links.map((l) => (
            <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
          ))}
        </ul>
      </div>
    ) : null,
}));

// The intro film plays on the first visit in a browser session. It is skipped for visitors who prefer
// reduced motion and for links straight to a section (like #projects); "replay intro" brings it back.
const SEEN = "trace-intro-seen";
const seen = () => { try { return sessionStorage.getItem(SEEN) === "1"; } catch { return false; } };
const markSeen = (v) => { try { v ? sessionStorage.setItem(SEEN, "1") : sessionStorage.removeItem(SEEN); } catch { /* storage blocked */ } };

export default function App() {
  const [intro, setIntro] = useState(() =>
    !seen() && !location.hash && !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const done = useCallback(() => markSeen(true), []);
  const replay = () => {
    markSeen(false);
    setIntro(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  };
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      {!intro && <Loader />}
      <a className="skip-link" href="#about">Skip to content</a>
      <main>
        {intro && <IntroFilm onDone={done} />}
        <div className={intro ? "after-intro" : undefined} style={{ position: "relative" }}>
          <Header />
          <HeroDaylight onReplay={reduce ? undefined : replay} />
        </div>
        <Trail sections={sections} />
      </main>
      <footer className="site-footer mono">
        {/* back to the hero (not the page top: while the intro is on the page, that is the film's start) */}
        <a className="site-footer__top" href="#top" onClick={(e) => { e.preventDefault(); document.getElementById("top")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}>back to top</a>
        <a className="site-footer__school" href="/school">Schoolwork</a>
        <span>© {new Date().getFullYear()} Amma Kwarteng. All rights reserved.</span>
        <span className="site-footer__updated">last updated {__UPDATED__.toLowerCase()}</span>
      </footer>
    </>
  );
}
