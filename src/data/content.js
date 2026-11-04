// Written content for the sections below the hero. Edit freely.

export const about = [
  "I'm Amma. I got into cybersecurity because I like understanding how things work, and how they break.",
  "My focus is identity & access management (IAM) and privileged access management (PAM): making sure the right people have the right access, and protecting the accounts that hold the keys to everything. I'm starting in IT support and building toward that one certification and one lab at a time.",
  "I also love UX/UI and graphic design, so I care about making security clear and human. This site is my trace: an evolving record of what I'm learning and building.",
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
      "An interactive cybersecurity portfolio on my own domain, with a threat-hunt hero and an employer-only, encrypted résumé.",
    points: [
      "Set up a custom domain with DNS records (A, CNAME, TXT), GitHub Pages hosting and HTTPS",
      "Encrypted my résumé with AES-256-GCM; employers unlock it in their own browser with an access code",
      "Added privacy-friendly analytics (no cookies) with a dashboard only I can access",
      "Publishes automatically with GitHub Actions on every update",
      "Built with React and Vite, using AI-assisted development",
    ],
    tags: ["DNS", "HTTPS", "encryption", "access control", "GitHub Actions", "React"],
    links: [{ label: "source code", url: "https://github.com/ammakwarteng/amma-kwarteng-trace" }],
  },
];
