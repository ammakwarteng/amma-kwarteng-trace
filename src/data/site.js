// Content that appears in more than one component lives here, so it is edited in one place.

export const owner = {
  name: "Amma Kwarteng",
  brand: "amma kwarteng",
  headline: "an evolving archive",
  subline: "of my projects, technical exploration, skills, and professional journey.",
  tagline: "An evolving archive of my projects, technical exploration, skills, and professional journey.",
  focus: "Cybersecurity · IT · Design",
  timeZone: "America/Toronto",
};

// Split so the full address is never written out in the built page.
export const email = { user: "ammaafram.kwarteng", domain: "gmail.com" };

export const links = [
  { label: "github", url: "https://github.com/ammakwarteng" },
];

// Professional communities, shown in the hero.
export const communities = [
  { name: "Women in CyberSecurity", short: "WiCyS", role: "Member", url: "https://www.wicys.org/" },
];

// Sections in the menu and on the page. Set ready: true once a section has
// real content; sections that are not ready stay hidden everywhere.
export const navItems = [
  { id: "about", label: "about", ready: true },
  { id: "portfolio", label: "portfolio", ready: false },
  { id: "projects", label: "projects", ready: true },
  { id: "skills", label: "skills", ready: false },
  { id: "certifications", label: "certifications", ready: true },
  { id: "resume", label: "resume", ready: true },
  { id: "contact", label: "contact", ready: true },
].filter((item) => item.ready);
