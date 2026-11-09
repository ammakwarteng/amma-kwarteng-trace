// The TRACE HQ project card, as it appeared in src/data/content.js before it was archived.
// To bring it back: move ../site to public/hq, ../screenshots to public/projects/hq,
// and paste this object back at the top of the projects array.
export const traceHqCard =
{
    name: "TRACE HQ — an IAM engineer's workday",
    type: "simulation",
    year: "2026",
    status: "in progress",
    summary:
      "A first-person 3D walkthrough of an IAM engineer's day at a fictional headquarters: arrive, prove who you are, get in, and process joiner, mover and leaver requests.",
    points: [
      "Designed a first-person walkthrough of an IAM engineer's workday, from the building entrance to the end of the shift",
      "Built the scenes in 3D: exterior, revolving door, lobby, security checkpoint, secured corridor, elevator and an IAM workstation",
      "Used a licensed 3D revolving-door model (CC BY 4.0, credited on the page) and turned its painted glass into real see-through glass",
      "Modelled two-factor entry: an access-card check, then a simulated 68-point facial verification with no camera and no biometric data",
      "Kept authentication and authorization separate: the verified employee gets the secure area but is still denied the server room because it's not in their role",
      "Walked through joiner, mover and leaver workflows step by step, with access granted, removed and revoked, and every action recorded in an audit log",
      "Added a cinematic mode with play, pause and replay, plus a free-walk mode for keyboard, mouse and touch",
      "Made free walk playable: badge in, pass the face scan, and the security door only unlocks after both; then call the elevator, ride to floor 4 and sit at the workstation to work the queue",
      "Wrote an IAM handbook that sits on the desk as a 3D book: open it to flip through the four pillars, RBAC, joiner-mover-leaver, access policies, access reviews and IAM governance mapped to ISO/IEC 27001",
    ],
    next: "Next: let visitors click through each joiner, mover and leaver step themselves instead of watching the queue run.",
    links: [{ label: "enter the simulation", url: "hq/" }],
    gallery: [
      { src: "projects/hq/01.webp", caption: "Arriving at TRACE headquarters" },
      { src: "projects/hq/02.webp", caption: "Walking through the revolving door into the lobby" },
      { src: "projects/hq/03.webp", caption: "Presenting the access credential at the card reader" },
      { src: "projects/hq/04.webp", caption: "Simulated facial verification: 68 / 68 landmarks, access granted" },
      { src: "projects/hq/05.webp", caption: "The elevator to the IAM floor" },
      { src: "projects/hq/06.webp", caption: "The IAM console: a mover request removing outdated access" },
    ],
    tags: ["IAM", "joiner / mover / leaver", "RBAC", "least privilege", "authentication", "audit logging", "3D", "UX/UI"],
  };
