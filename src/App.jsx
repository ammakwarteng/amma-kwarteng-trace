import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Trail from "./components/trail/Trail.jsx";
import EmailLink from "./components/EmailLink.jsx";
import About from "./components/sections/About.jsx";
import Certifications from "./components/sections/Certifications.jsx";
import { navItems, links } from "./data/site.js";

// Each nav destination is a hop on the trace. Sections without content yet show "coming soon".
const sections = navItems.map((item) => ({
  ...item,
  body:
    item.id === "about" ? (
      <About />
    ) : item.id === "certifications" ? (
      <Certifications />
    ) : item.id === "contact" ? (
      <div className="trail__contact">
        <EmailLink variant="full" />
        <ul className="trail__links">
          {links.map((l) => (
            <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="mono">coming soon</p>
    ),
}));

export default function App() {
  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <Trail sections={sections} />
      </main>
    </>
  );
}
