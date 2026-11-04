// Written content for the sections below the hero. Edit freely.

export const about = [
  "I'm Amma, an ISO/IEC 27001 Lead Auditor building a career in identity and access management.",
  "So many breaches come down to access: who has it, and who shouldn't. That's the problem I want to solve. This site is my trace.",
];

// Career roadmap. Set `now: true` on the phase Amma is in.
export const roadmap = [
  {
    phase: "help desk",
    when: "now",
    now: true,
    goal: "Learn how accounts and access work day to day.",
    items: ["ITIL 4 Foundation", "CompTIA Security+", "Active Directory", "Entra ID", "MFA", "PowerShell basics"],
  },
  {
    phase: "iam analyst",
    when: "next",
    goal: "Manage identities and access full time.",
    items: ["Microsoft SC-900", "Microsoft SC-300", "SSO (SAML, OIDC)", "RBAC", "least privilege", "access reviews"],
  },
  {
    phase: "pam engineer",
    when: "then",
    goal: "Protect privileged accounts with CyberArk.",
    items: ["CyberArk Trustee", "CyberArk Defender: PAM", "CyberArk Sentry: PAM", "vaulting", "password rotation", "session monitoring"],
  },
  {
    phase: "iam / devsecops",
    when: "long term",
    goal: "Automate identity and secrets across cloud and pipelines.",
    items: ["identity automation", "secrets management", "cloud IAM"],
  },
];

// status: "studying" | "next" | "planned" | "earned"
// Only move a certification to "earned" once the exam is passed.
export const certifications = [
  { name: "ISO/IEC 27001:2022 Lead Auditor", code: "ISO 27001", issuer: "Mastermind Assurance Academy", status: "earned" },
  { name: "ITIL 4 Foundation", code: "ITIL 4", issuer: "PeopleCert", status: "studying" },
  { name: "CompTIA Security+", code: "Sec+", issuer: "CompTIA", status: "next" },
  { name: "Microsoft SC-900", code: "SC-900", issuer: "Microsoft", status: "planned" },
  { name: "Microsoft SC-300", code: "SC-300", issuer: "Microsoft", status: "planned" },
  { name: "CyberArk Certified Trustee", code: "Trustee", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Defender: PAM", code: "Defender", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Sentry: PAM", code: "Sentry", issuer: "CyberArk", status: "planned" },
];

// Projects, newest first. Add a new object at the top of the list for each
// project; the section shows them in this order.
export const projects = [
  {
    name: "TRACE — this portfolio",
    year: "2026",
    status: "live",
    summary:
      "An interactive cybersecurity portfolio on my own domain, with a threat-hunt hero and an employer-only, encrypted resume.",
    points: [
      "Designed the concept and look of an interactive cybersecurity portfolio",
      "Designed the full visual identity: layout, interactions and logo",
      "Registered a custom domain and configured DNS records (A, CNAME, TXT) for GitHub Pages hosting and HTTPS",
      "Locked my resume behind an access code using AES-256 encryption, so only employers I share it with can open it",
      "Set up privacy-friendly analytics with the dashboard restricted to me only",
      "Verified domain ownership and set up automatic publishing on every update",
    ],
    image: { src: "projects/logo.svg", alt: "My logo: a tracking reticle", caption: "my logo" },
    tags: ["DNS", "HTTPS", "encryption", "access control", "GitHub", "UX/UI"],
    links: [{ label: "source code", url: "https://github.com/ammakwarteng/amma-kwarteng-trace" }],
  },
];
