import Header from "./components/Header.jsx";
import Loader from "./components/loader/Loader.jsx";
import Hero from "./components/Hero.jsx";
import Section from "./components/archive/Section.jsx";
import Roadmap from "./components/archive/Roadmap.jsx";
import Folio from "./components/archive/Folio.jsx";
import { Contact, Colophon } from "./components/archive/Colophon.jsx";
import Certifications from "./components/sections/Certifications.jsx";
import Resume from "./components/sections/Resume.jsx";
import Projects from "./components/sections/Projects.jsx";
import Skills from "./components/sections/Skills.jsx";
import Community from "./components/sections/Community.jsx";
import Volunteer from "./components/sections/Volunteer.jsx";
import { navItems, communities, volunteering } from "./data/site.js";
import { roadmap, projects, skills, certifications } from "./data/content.js";

/*
  TRACE — the living archive. The hero stage (Hero.jsx) carries 01 · about; every section
  after it is an always-open editorial section (archive/Section.jsx), numbered in menu order.
*/
const shownCerts = certifications.filter((c) => ["earned", "studying", "next"].includes(c.status)).length;
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const SECTIONS = {
  roadmap: { title: "iam roadmap", kicker: `progression · ${count(roadmap.length, "stage", "stages")}`, body: <Roadmap /> },
  projects: { title: "projects", kicker: `case files · ${count(projects.length, "entry", "entries")}`, body: <Projects /> },
  skills: { title: "skills", kicker: `index · ${count(skills.length, "category", "categories")}`, body: <Skills /> },
  certifications: { title: "certifications", kicker: `credential register · ${count(shownCerts, "record", "records")}`, body: <Certifications /> },
  community: { title: "community", kicker: `directory · ${count(communities.length, "membership", "memberships")}`, body: <Community /> },
  volunteer: { title: "volunteer", kicker: `directory · ${count(volunteering.length, "role", "roles")}`, body: <Volunteer /> },
  resume: { title: "resume", kicker: "restricted document", body: <Resume /> },
  contact: { title: "contact", kicker: "colophon", body: <Contact /> },
};

export default function App() {
  return (
    <>
      <Loader />
      <a className="skip-link" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <div className="archive">
          {navItems.map((item, i) => {
            const s = SECTIONS[item.id];
            if (!s) return null;
            return <Section key={item.id} id={item.id} n={i + 1} label={item.label} kicker={s.kicker} title={s.title}>{s.body}</Section>;
          })}
        </div>
      </main>
      <Colophon />
      <Folio />
    </>
  );
}
