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
  { name: "Microsoft SC-300", code: "SC-300", issuer: "Microsoft", status: "planned" },
  { name: "CyberArk Certified Trustee", code: "Trustee", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Defender: PAM", code: "Defender", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Sentry: PAM", code: "Sentry", issuer: "CyberArk", status: "planned" },
];

// Projects, newest first. Add a new object at the top of the list for each
// project; the section shows them in this order.
export const projects = [
  {
    name: "Active Directory home lab",
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
