import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import SectionStub from "./components/SectionStub.jsx";
import { navItems, links } from "./data/site.js";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        {navItems.map((item, i) => (
          <SectionStub
            key={item.id}
            id={item.id}
            index={i + 1}
            title={item.label}
            note="arrives in stage 4"
          >
            {item.id === "contact" && (
              <ul className="stub__links">
                {links.map((l) => (
                  <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
                ))}
              </ul>
            )}
          </SectionStub>
        ))}
      </main>
    </>
  );
}
