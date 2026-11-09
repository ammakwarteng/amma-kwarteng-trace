import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import VisitorBadge from "./components/badge/VisitorBadge.jsx";
import Loader from "./components/loader/Loader.jsx";
import Hero from "./components/Hero.jsx";
import CorridorTransition from "./components/CorridorTransition.jsx";
import Trail from "./components/trail/Trail.jsx";
import EmailLink from "./components/EmailLink.jsx";
import About from "./components/sections/About.jsx";
import Certifications from "./components/sections/Certifications.jsx";
import Resume from "./components/sections/Resume.jsx";
import Projects from "./components/sections/Projects.jsx";
import Skills from "./components/sections/Skills.jsx";
import Community from "./components/sections/Community.jsx";
import Volunteer from "./components/sections/Volunteer.jsx";
import { navItems, links, showRoute } from "./data/site.js";

// Each section that is ready (see navItems in site.js) is a hop on the trace.
const sections = navItems.map((item) => ({
  ...item,
  body:
    item.id === "about" ? (
      <About />
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

export default function App() {
  // "start a new session" in the audit log replays the intro: the whole site
  // is rebuilt from scratch, starting with the loader, at the top of the page.
  const [session, setSession] = useState(0);
  useEffect(() => {
    const restart = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      setSession((n) => n + 1);
    };
    window.addEventListener("trace:new-session", restart);
    return () => window.removeEventListener("trace:new-session", restart);
  }, []);

  useEffect(() => { document.documentElement.classList.toggle("no-route", !showRoute); }, []);

  return (
    <div key={session} style={{ display: "contents" }}>
      <Loader />
      <a className="skip-link" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <CorridorTransition />
        <Trail sections={sections} />
        <VisitorBadge />
      </main>
      <footer className="site-footer mono">© {new Date().getFullYear()} amma kwarteng. all rights reserved.</footer>
    </div>
  );
}
