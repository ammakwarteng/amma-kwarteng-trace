// Content that appears in more than one component lives here, so it is edited in one place.

export const owner = {
  name: "Amma Kwarteng",
  brand: "Amma Kwarteng",
  headline: "Tracing my path through cybersecurity:",
  subline: "what I build, what breaks, how I fix it, and what I learn along the way.",
  tagline: "Tracing my path through cybersecurity: what I build, what breaks, how I fix it, and what I learn along the way.",
  focus: "Cybersecurity · IT · Design",
  timeZone: "America/Toronto",
};

// Split so the full address is never written out in the built page.
export const email = { user: "ammaafram.kwarteng", domain: "gmail.com" };

export const links = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/amma-kwarteng-8b1b98a3" },
  { label: "GitHub", url: "https://github.com/ammakwarteng" },
];

// Homepage hero media (the frosted-glass editorial portrait).
// Put the final photograph in public/hero/ and set its path here, e.g. image: "hero/portrait.jpg".
// Optional: a separate crop for phones, and a short muted loop (Higgsfield export) with a poster frame.
// glass: true lays a CSS frosted, vertically ribbed glass over the photo; set it to false if the
// glass is already part of the photograph. layout: "editorial" = centred hero; "classic" = the
// previous hero layout (fully reversible).
export const heroMedia = {
  layout: "editorial",
  image: "hero/portrait.jpg",   // e.g. "hero/portrait.jpg"   (2400×1600 or larger, black and white)
  imageMobile: "hero/portrait-mobile.jpg",   // e.g. "hero/portrait-mobile.jpg" (1080×1920, portrait crop)
  video: "videos/trace-portrait.mp4",   // Higgsfield portrait, played forward then back for a seamless loop   (muted, 6-12 s seamless loop, H.264, under ~4 MB)
  videoMobile: "",      // optional 9:16 Higgsfield clip for phones (from the tall portrait)
  poster: "videos/trace-portrait-poster.jpg",   // first frame of the video
  glass: false,         // the ribbed glass is already in the photograph
  focus: "50% 38%",     // which part of the photo stays in view on wide screens
  focusMobile: "50% 30%",
};


// Professional communities, shown in the community section. Add one only
// once joined; add events under a community only once attended.
export const communities = [
  { name: "Women in CyberSecurity", short: "WiCyS", role: "Member", url: "https://www.wicys.org/",
    about: "A nonprofit dedicated to recruiting, retaining and advancing women in cybersecurity." },
  { name: "Women in Security and Privacy", short: "WISP", role: "Member", url: "https://www.wisporg.com/",
    about: "Advancing women and underrepresented communities to lead the future of privacy and security." },
  { name: "Rewriting the Code", role: "Member", url: "https://rewritingthecode.org/",
    about: "A community supporting women in tech, from students to early career." },
  { name: "Women's Society of Cyberjutsu", short: "WSC", role: "Member", url: "https://www.womenscyberjutsu.org/",
    about: "A nonprofit helping women advance in cybersecurity through hands-on training, mentoring and community." },
  { name: "ISC2 Toronto Chapter", role: "Member", url: "https://isc2chapter-toronto.ca/",
    about: "The Toronto chapter of ISC2, the global association of cybersecurity professionals behind the CISSP." },
];

// Volunteer roles, shown in the volunteer section.
// Add one only once you've actually done it. Example:
//   { org: "CyberX", role: "Volunteer", status: "", url: "https://...", what: "Helped run the student CTF." },
export const volunteering = [
  {
    org: "Cyber-Seniors",
    role: "Tech Mentor",
    url: "https://cyberseniors.org",
    what: "A Canadian nonprofit connecting generations through technology. Trained to support older adults one-on-one with their devices, apps and accounts.",
  },
];

// Sections in the menu and on the page. Set ready: true once a section has
// real content; sections that are not ready stay hidden everywhere.
export const navItems = [
  { id: "about", label: "About", kicker: "the profile", ready: true },
  { id: "portfolio", label: "Portfolio", kicker: "the portfolio", ready: false },
  { id: "projects", label: "Projects", kicker: "the work", ready: true },
  { id: "skills", label: "Skills", kicker: "the craft", ready: true },
  { id: "certifications", label: "Certifications", kicker: "the credentials", ready: true },
  { id: "community", label: "Community", kicker: "the community", ready: true },
  { id: "volunteer", label: "Volunteer", kicker: "giving back", ready: true },
  { id: "resume", label: "Resume", kicker: "the record", ready: true },
  { id: "contact", label: "Contact", kicker: "get in touch", ready: true },
].filter((item) => item.ready);
