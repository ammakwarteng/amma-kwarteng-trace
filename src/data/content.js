// Written content for the sections below the hero. Edit freely.

export const about = [
  "I’m Amma, a cybersecurity auditor expanding into Identity & Access Management (IAM).",
  "My work is grounded in understanding security controls, risk, and accountability. I’m building on that foundation through hands-on exploration of identity lifecycles, access governance, and secure authentication.",
];

// Career roadmap. Set `now: true` on the phase Amma is in.
export const roadmap = [
  {
    phase: "Help Desk",
    when: "now",
    now: true,
    goal: "Get hands-on IT support experience in the next 3 to 6 months while learning how accounts and access work day to day.",
    items: ["ITIL 4 Foundation", "CompTIA Security+", "Active Directory", "password resets and account requests", "PowerShell basics"],
  },
  {
    phase: "IAM Analyst",
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
      "Microsoft SC-900",
      "Microsoft SC-300",
      "Okta Certified Professional",
    ],
  },
  {
    phase: "IAM Engineer",
    when: "then",
    goal: "Design and run identity and privileged access systems, including CyberArk PAM.",
    items: ["CyberArk Trustee", "CyberArk Defender: PAM", "CyberArk Sentry: PAM", "Okta Certified Administrator", "vaulting", "password rotation", "session monitoring"],
  },
  {
    phase: "IAM Architect",
    when: "long term",
    goal: "Design how a whole organization handles identity and access, from strategy to the systems that run it.",
    items: ["identity architecture and strategy", "zero trust", "identity governance (IGA)", "privileged access strategy", "cloud identity across platforms", "identity standards and policy", "CyberArk Guardian", "CISSP"],
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
  { name: "Okta Certified Professional", code: "Okta Pro", issuer: "Okta", status: "planned" },
  { name: "CyberArk Certified Trustee", code: "Trustee", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Defender: PAM", code: "Defender", issuer: "CyberArk", status: "planned" },
  { name: "CyberArk Sentry: PAM", code: "Sentry", issuer: "CyberArk", status: "planned" },
  { name: "Okta Certified Administrator", code: "Okta Admin", issuer: "Okta", status: "planned" },
  { name: "CyberArk Certified Guardian", code: "Guardian", issuer: "CyberArk", status: "planned" },
  { name: "CISSP", code: "CISSP", issuer: "ISC2", status: "planned" },
];

// Projects, newest first. Add a new object at the top of the list for each
// project; the section shows them in this order.
export const projects = [
  {
    name: "Active Directory Home Lab",
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
];

// Skills, grouped. Only skills with proof (a project, lab, certification or
// job). Things still being learned stay in the roadmap until they're done.
export const skills = [
  {
    group: "Identity & Access",
    proof: "Active Directory Home Lab",
    items: ["Active Directory", "users and groups", "RBAC and least privilege", "joiner, mover, leaver", "password and lockout policy"],
  },
  {
    group: "Support",
    proof: "home lab and work history",
    items: ["password resets", "account unlocks", "device and network troubleshooting", "ticketing", "AV equipment setup"],
  },
  {
    group: "Systems & Tools",
    proof: "home lab",
    items: ["Windows Server 2022", "PowerShell", "DNS", "VMware Workstation", "Microsoft 365"],
  },
  {
    group: "Governance",
    proof: "ISO/IEC 27001:2022 Lead Auditor · GRC Analyst Master Class (in progress)",
    items: ["ISO/IEC 27001", "access control", "auditing"],
  },
  {
    group: "Web & Design",
    proof: "TRACE, this portfolio",
    items: ["React", "GSAP", "custom domains", "DNS records", "HTTPS", "GitHub Pages", "UX/UI"],
  },
];
