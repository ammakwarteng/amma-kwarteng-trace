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
  { label: "linkedin", url: "https://www.linkedin.com/in/amma-kwarteng-8b1b98a3" },
  { label: "github", url: "https://github.com/ammakwarteng" },
];



// Professional communities, shown in the community section. Add one only
// once joined; add events under a community only once attended.
export const communities = [
  { name: "Women in CyberSecurity", short: "WiCyS", role: "Member", url: "https://www.wicys.org/",
    about: "a nonprofit dedicated to recruiting, retaining and advancing women in cybersecurity" },
  { name: "Women in Security and Privacy", short: "WISP", role: "Member", url: "https://www.wisporg.com/",
    about: "advancing women and underrepresented communities to lead the future of privacy and security" },
  { name: "Rewriting the Code", role: "Member", url: "https://rewritingthecode.org/",
    about: "a community supporting women in tech, from students to early career" },
  { name: "Women's Society of Cyberjutsu", short: "WSC", role: "Member", url: "https://www.womenscyberjutsu.org/",
    about: "a nonprofit helping women advance in cybersecurity through hands-on training, mentoring and community" },
];

// Volunteer roles, shown in the volunteer section (hidden until it's switched on in navItems).
// Add one only once you've actually done it. Example:
//   { org: "CyberX", role: "Volunteer", when: "2027", url: "https://...", what: "helped run the student CTF" },
export const volunteering = [];

// Sections in the menu and on the page. Set ready: true once a section has
// real content; sections that are not ready stay hidden everywhere.
export const navItems = [
  { id: "about", label: "about", ready: true },
  { id: "portfolio", label: "portfolio", ready: false },
  { id: "projects", label: "projects", ready: true },
  { id: "skills", label: "skills", ready: true },
  { id: "certifications", label: "certifications", ready: true },
  { id: "community", label: "community", ready: true },
  { id: "volunteer", label: "volunteer", ready: false }, // switch to true once there's a role in volunteering below
  { id: "resume", label: "resume", ready: true },
  { id: "contact", label: "contact", ready: true },
].filter((item) => item.ready);
