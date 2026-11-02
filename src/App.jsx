import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import SectionStub from "./components/SectionStub.jsx";
import { navItems } from "./data/site.js";

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
          />
        ))}
      </main>
    </>
  );
}
