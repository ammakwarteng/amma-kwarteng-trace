// Written content for the sections below the hero. Edit freely.

export const about = [
  "I'm Amma, a cybersecurity auditor building a career in identity and access management.",
  "So many breaches come down to access: who has it, and who shouldn't. That's the problem I want to solve. This site is my trace.",
];

// Career roadmap. Set `now: true` on the phase Amma is in.
export const roadmap = [
  {
    phase: "help desk",
    when: "now",
    now: true,
    goal: "Get hands-on IT support experience in the next 3 to 6 months while learning how accounts and access work day to day.",
    items: ["ITIL 4 Foundation", "CompTIA Security+", "Active Directory", "password resets and account requests", "PowerShell basics"],
  },
  {
    phase: "iam analyst",
    when: "next",
    goal: "Manage identities and access full time, following my Master IAM roadmap.",
    items: [
      "authentication and MFA",
      "SSO and federation (SAML, OIDC)",
      "RBAC and least privilege",
      "joiner, mover, leaver",
      "access requests and approvals",
      "access reviews and audit evidence",
      "Microsoft Entra ID",
      "Microsoft SC-300",
    ],
  },
  {
    phase: "iam engineer",
    when: "then",
    goal: "Design and run identity and privileged access systems, including CyberArk PAM.",
    items: ["CyberArk Trustee", "CyberArk Defender: PAM", "CyberArk Sentry: PAM", "vaulting", "password rotation", "session monitoring"],
  },
  {
    phase: "devsecops",
    when: "long term",
    goal: "Automate security, identity and secrets across cloud and pipelines.",
    items: ["secrets management", "cloud IAM", "CI/CD security", "infrastructure as code"],
  },
];

// status: "studying" | "next" | "planned" | "earned"
// Only move a certification to "earned" once the exam is passed.
export const certifications = [
  { name: "ISO/IEC 27001:2022 Lead Auditor", code: "ISO 27001", issuer: "Mastermind Assurance Academy", status: "earned" },
  { name: "ITIL 4 Foundation", code: "ITIL 4", issuer: "PeopleCert", status: "studying" },
  { name: "CompTIA Security+", code: "Sec+", issuer: "CompTIA", status: "next" },
  { name: "Microsoft SC-900", code: "SC-900", issuer: "Microsoft", status: "planned" },
  { name: "Microsoft SC-300: Identity and Access Administrator", code: "SC-300", issuer: "Microsoft", status: "next" },
  { name: "CyberArk Certified Trustee", code: "Trustee", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Defender: PAM", code: "Defender", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Sentry: PAM", code: "Sentry", issuer: "CyberArk", status: "planned" },
];

// Projects, newest first. Add a new object at the top of the list for each
// project; the section shows them in this order.
export const projects = [
  {
    name: "Access request review — an IAM case study",
    type: "case study",
    year: "2026",
    status: "live",
    summary:
      "An interactive access-review queue: you act as the reviewer and decide three fictional access requests against least privilege, separation of duties and privileged-access policy.",
    points: [
      "Designed a compact access-review tool modelled on enterprise identity governance software",
      "Wrote three fictional requests that each test a different policy: an in-role read request, a separation-of-duties conflict, and a privileged production request",
      "Shows each requester's role baseline and current access next to the request, so least privilege can be judged at a glance",
      "Runs a policy check on every request: role baseline, least privilege, privileged access, separation of duties and time limits",
      "Approve, deny or escalate, then see whether the decision is policy-aligned and why",
      "Writes a simulated audit event for every decision, and adds it to the visitor's own session audit log at sign-out",
    ],
    demo: "access-review",
    tags: ["IAM", "access reviews", "least privilege", "separation of duties", "PAM", "audit logging", "UX/UI"],
  },

  {
    name: "Active Directory home lab",
    type: "lab",
    year: "2026",
    status: "complete",
    summary:
      "A small company network on my laptop: a Windows Server 2022 domain controller running my own domain, lab.ammakwarteng.com, with departments, employees and group-based access.",
    points: [
      "Installed Windows Server 2022 in VMware Workstation and promoted it to a domain controller (AD DS and DNS) for lab.ammakwarteng.com",
      "Gave the server a static IP, then diagnosed a VMware NAT gateway misconfiguration (192.168.168.0 instead of .2) that blocked all traffic, and confirmed the fix with ping",
      "Built an OU structure for IT, HR, Finance and Sales",
      "Onboarded four users, each required to change their password at first logon",
      "Created a security group per department and verified every membership with PowerShell (Get-ADGroupMember)",
      "Set domain password rules with Group Policy: 12-character minimum, complexity, 90-day maximum age and 24-password history",
      "Added account lockout after 5 failed attempts (30-minute lockout) and confirmed it by locking a test account",
      "Resolved the locked-out user like a help desk ticket: unlocked the account and reset the password with a forced change at next logon",
      "Offboarded a leaver: disabled the account, removed group access, recorded the leave date and moved it to a _Disabled Users OU, then verified it with PowerShell",
    ],
    next: "Covers the full joiner, mover, leaver identity lifecycle on a working domain.",
    gallery: [
      { src: "projects/ad-lab/01.webp", caption: "DC01 promoted to a domain controller for lab.ammakwarteng.com" },
      { src: "projects/ad-lab/02.webp", caption: "Network fixed: replies from the gateway and the internet" },
      { src: "projects/ad-lab/03.webp", caption: "Departments as organizational units under _Company" },
      { src: "projects/ad-lab/04.webp", caption: "Onboarding a user who must change their password at first logon" },
      { src: "projects/ad-lab/05.webp", caption: "All four users and their department groups" },
      { src: "projects/ad-lab/06.webp", caption: "Group-based access: Kofi Asante in Finance-Staff" },
      { src: "projects/ad-lab/07.webp", caption: "Every group membership verified with PowerShell" },
      { src: "projects/ad-lab/08.webp", caption: "Password policy in Group Policy: 12 characters, 90 days, 24 remembered" },
      { src: "projects/ad-lab/09.webp", caption: "Account lockout policy: 5 attempts, 30 minutes" },
      { src: "projects/ad-lab/10.webp", caption: "Policy applied and confirmed with PowerShell" },
      { src: "projects/ad-lab/11.webp", caption: "Lockout tested: Abena Owusu locked after repeated wrong passwords" },
      { src: "projects/ad-lab/12.webp", caption: "Help desk fix: reset the password and unlock the account" },
      { src: "projects/ad-lab/13.webp", caption: "Confirmed: no accounts locked out" },
      { src: "projects/ad-lab/14.webp", caption: "Offboarding: the leaver's account disabled" },
      { src: "projects/ad-lab/15.webp", caption: "Leaver verified: disabled, no group access, moved to _Disabled Users" },
    ],
    tags: ["Active Directory", "Windows Server 2022", "Group Policy", "DNS", "VMware", "PowerShell", "IAM", "troubleshooting"],
  },
  {
    name: "TRACE — this portfolio",
    type: "project",
    year: "2026",
    status: "live",
    summary:
      "An interactive cybersecurity portfolio on my own domain, with a living typographic hero, an employer-only encrypted resume and an access-card sign-out that ends in a session audit log.",
    points: [
      "Designed the concept and look of an interactive cybersecurity portfolio",
      "Designed the full visual identity: layout, interactions and logo",
      "Registered a custom domain and configured DNS records (A, CNAME, TXT) for GitHub Pages hosting and HTTPS",
      "Locked my resume behind an access code using AES-256 encryption, so only employers I share it with can open it",
      "Set up privacy-friendly analytics with the dashboard restricted to me only",
      "Verified domain ownership and set up automatic publishing on every update",
      "Designed TRACE IMPRINT: the wordmark reconstructs itself on load and leaves faint silver imprints of its letterforms wherever you move or click",
      "Designed a \"leave your trace\" doodle pad where visitors draw and pin their own doodle",
      "Designed an access-card sign-out: a brushed-silver magnetic-stripe credential that visitors drag through a swipe reader, with a swipe sound, a reader beep and a green access light",
      "Designed a session audit log that closes the visit the way an IAM system records it: credential read, authentication, least-privilege authorization, sign-out and token revocation",
      "Added private event counts for doodles, resume unlocks and badge swipes, so I can see how visitors use the site without collecting personal data",
      "Designed the TRACE visual identity: corner-bracket frames, record-style labels (PRJ-01, CERT, MBR) and a target-lock animation used across the site",
      "Added a loading screen that replays when a visitor starts a new session",
    ],
    gallery: [
      { src: "projects/trace/01.webp", caption: "TRACE IMPRINT: silver impressions of the wordmark follow your movement" },
      { src: "projects/trace/02.webp", caption: "The resume, locked behind an access code with AES-256 encryption" },
      { src: "projects/trace/03.webp", caption: "Sections read as records, with the TRACE frame locking onto each heading" },
      { src: "projects/trace/04.webp", caption: "The access card and swipe reader at the end of the trace" },
      { src: "projects/trace/05.webp", caption: "The session audit log after a visitor signs out" },
    ],
    image: { src: "projects/logo.svg", alt: "My logo: a tracking reticle", caption: "my logo" },
    tags: ["DNS", "HTTPS", "encryption", "access control", "GitHub", "UX/UI"],
  },
];

// Skills, grouped. Only skills with proof (a project, lab, certification or
// job). Things still being learned stay in the roadmap until they're done.
export const skills = [
  {
    group: "identity & access",
    proof: "Active Directory home lab",
    items: ["Active Directory", "users and groups", "RBAC and least privilege", "joiner, mover, leaver", "password and lockout policy (Group Policy)"],
  },
  {
    group: "support",
    proof: "home lab and work history",
    items: ["password resets", "account unlocks", "device and network troubleshooting", "ticketing", "AV equipment setup"],
  },
  {
    group: "systems & tools",
    proof: "home lab",
    items: ["Windows Server 2022", "PowerShell", "DNS", "VMware Workstation", "Microsoft 365"],
  },
  {
    group: "governance",
    proof: "ISO/IEC 27001:2022 Lead Auditor",
    items: ["ISO/IEC 27001", "access control", "auditing"],
  },
  {
    group: "web & design",
    proof: "TRACE, this portfolio",
    items: ["custom domains", "DNS records", "HTTPS", "GitHub Pages", "UX/UI"],
  },
];
