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
    // courses for this stage, shown on its roadmap page only (status: "in progress" | "complete")
    courses: [
      { name: "IAM Essentials", provider: "All Things Identity", status: "in progress",
        done: ["Identity basics & user lifecycle management"] },
    ],
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
// Schoolwork, shown on the quiet /school page (linked from the footer). One entry per course:
// { name, code, files: [{ title, note, image }] } (image: a path under public/, e.g. "school/syst/lab1.webp"). Only Amma's own work
// and descriptions: no full assignment answers, classmates' names or instructor comments.
export const school = [
  { name: "Crime Fiction Narratives", code: "LITT19601G", files: [] },
  { name: "Essential Communication Skills", code: "COMM19999", files: [] },
  { name: "Operating Systems Technologies (A+ Certification Prep)", code: "SYST19866", files: [] },
  { name: "Introduction to Data Communications and Networking", code: "TELE13167", files: [] },
];

export const projects = [
  {
    name: "Keycloak SSO & MFA Lab",
    type: "lab",
    year: "2026",
    status: "complete",
    summary:
      "An identity provider running on Linux: Keycloak in Docker on an Ubuntu VM, with its own company realm, enforced multi-factor authentication, and single sign-on into a web app (Grafana) over OpenID Connect.",
    points: [
      "Built an Ubuntu 24.04 virtual machine in VMware Workstation",
      "Diagnosed why the VM had no network (no IP address, no route), then fixed it by switching the adapter to bridged networking and confirmed it with ping",
      "Installed Docker and ran Keycloak 26.8.2 as a container",
      "Created a separate my-company realm, keeping company users apart from the admin realm",
      "Onboarded a test user, jdoe, with a permanent password",
      "Enforced MFA by making Configure OTP a default required action for the realm",
      "Enrolled the user's TOTP authenticator with Microsoft Authenticator and confirmed the device was registered",
      "Registered Grafana as a confidential OIDC client in the realm, with an exact redirect URI and web origin",
      "Troubleshot the setup: caught the client being created in the admin (master) realm and rebuilt it in my-company, and fixed a redirect URI entered in the wrong field with a typo that would have blocked login",
      "Diagnosed a corrupted client secret (hidden terminal paste characters), checked it safely by masking it, and retrieved it with Keycloak's admin CLI (after authenticating the CLI) instead of copying it by hand",
      "Regenerated the client secret after it was exposed in a screenshot, and enabled clipboard sharing between Windows and the VM with open-vm-tools",
      "Ran Grafana in Docker and connected it to Keycloak with OpenID Connect",
      "Signed in to Grafana as jdoe through Keycloak (password plus TOTP); Grafana created the account from the identity Keycloak sent, with no Grafana password",
    ],
    next: "Covers the core of an IAM analyst's work: a central identity provider, enforced MFA and single sign-on into an application.",
    gallery: [
      { src: "projects/keycloak-lab/sso-01.webp", caption: "Single sign-on: Grafana's profile for jdoe, synced from Keycloak over OpenID Connect" },
      { src: "projects/keycloak-lab/sso-02.webp", caption: "Signed in to Grafana through Keycloak, with no Grafana password" },
      { src: "projects/keycloak-lab/01.webp", caption: "MFA set up: jdoe has a password and a registered authenticator app" },
      { src: "projects/keycloak-lab/02.webp", caption: "Network fixed: the VM reaches the internet after switching to bridged networking" },
      { src: "projects/keycloak-lab/03.webp", caption: "Keycloak 26.8.2 running in Docker, listening on port 8080" },
      { src: "projects/keycloak-lab/04.webp", caption: "A separate my-company realm alongside the admin realm" },
      { src: "projects/keycloak-lab/05.webp", caption: "Onboarding the test user jdoe in my-company" },
      { src: "projects/keycloak-lab/06.webp", caption: "A permanent password set for jdoe" },
      { src: "projects/keycloak-lab/07.webp", caption: "Configure OTP enabled as a default required action: MFA enforced" },
      { src: "projects/keycloak-lab/sso-04.webp", caption: "Grafana registered as a confidential OIDC client using the standard flow" },
      { src: "projects/keycloak-lab/sso-03.webp", caption: "An exact redirect URI and web origin for Grafana" },
      { src: "projects/keycloak-lab/sso-05.webp", caption: "Troubleshooting: authenticating Keycloak's admin CLI and checking the client secret without revealing it" },
    ],
    tags: ["Keycloak", "SSO", "OIDC", "MFA", "TOTP", "Grafana", "Docker", "Ubuntu", "Linux", "VMware", "IAM", "troubleshooting"],
  },
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
    proof: "Active Directory Home Lab · Keycloak SSO & MFA Lab",
    items: ["Active Directory", "users and groups", "RBAC and least privilege", "joiner, mover, leaver", "password and lockout policy", "Keycloak", "MFA (TOTP)", "SSO", "OpenID Connect (OIDC)", "identity provider realms"],
  },
  {
    group: "Support",
    proof: "home lab and work history",
    items: ["password resets", "account unlocks", "device and network troubleshooting", "VM network troubleshooting", "ticketing", "AV equipment setup"],
  },
  {
    group: "Systems & Tools",
    proof: "home labs",
    items: ["Windows Server 2022", "PowerShell", "DNS", "VMware Workstation", "Microsoft 365", "Ubuntu Linux", "Linux command line", "Docker"],
  },
  {
    group: "Governance",
    proof: "ISO/IEC 27001:2022 Lead Auditor · GRC Analyst Master Class (in progress)",
    items: ["ISO/IEC 27001", "access control", "auditing", "GRC fundamentals", "cybersecurity frameworks", "threat basics"],
  },
  {
    group: "Web & Design",
    proof: "TRACE, this portfolio",
    items: ["HTML", "CSS", "React", "GSAP", "SVG", "custom domains", "DNS records", "HTTPS", "GitHub Pages", "UX/UI"],
  },
];
