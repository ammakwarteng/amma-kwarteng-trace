// Written content for the sections below the hero. Edit freely.

export const about = [
  "I’m Amma, a cybersecurity auditor expanding into Identity & Access Management (IAM).",
  "My work is grounded in understanding security controls, risk, and accountability. I’m building on that foundation through hands-on exploration of identity lifecycles, access governance, and secure authentication.",
];

// Career roadmap. On the About roadmap every phase shows 8 items, the last 2 being
// certifications (shown white); the full list of milestones lives on each phase's roadmap page.
// Set `now: true` on the phase Amma is in; `page: false` leaves a phase off the /roadmap pages
// (it still shows on the About roadmap).
export const roadmap = [
  {
    phase: "Cybersecurity Auditor",
    when: "now",
    now: true,
    page: false,   // where Amma is now: shown on the About roadmap, no roadmap page of its own
    goal: "Plan and carry out security audits: testing controls, checking who has access to what, and turning the evidence into clear findings that help teams fix what's wrong.",
    items: [
      "audit planning and scoping",
      "control testing",
      "access control reviews",
      "evidence collection and review",
      "risk assessment",
      "audit reporting",
      "ISO/IEC 27001:2022 Lead Auditor",
      "Splunk Cyber Defense",
    ],
  },
  {
    phase: "IAM Analyst",
    when: "next",
    goal: "Manage identities and access full time, following my Master IAM roadmap.",
    // courses for this stage, shown on its roadmap page only (status: "in progress" | "complete")
    courses: [
      { name: "IAM Essentials", provider: "All Things Identity", status: "complete",
        done: ["Identity basics & user lifecycle management", "Authentication and MFA", "Authorization models (RBAC, ABAC, PBAC, MAC, DAC)", "Federation and single sign-on (SAML, OIDC, SCIM)", "IAM and compliance (NIST 800-63)"],
        certificate: "2026-11-19" },
    ],
    items: [
      "authentication and MFA",
      "SSO and federation (SAML, OIDC)",
      "RBAC and least privilege",
      "joiner, mover, leaver",
      "access reviews and audit evidence",
      "Microsoft Entra ID",
      "CompTIA Security+",
      "Microsoft SC-300",
    ],
  },
  {
    phase: "IAM Engineer",
    when: "then",
    goal: "Design and run identity and privileged access systems, including CyberArk PAM.",
    items: [
      "privileged access management (PAM)",
      "vaulting",
      "password rotation",
      "session monitoring",
      "conditional access policies",
      "provisioning automation",
      "CyberArk Defender: PAM",
      "Okta Certified Administrator",
    ],
  },
  {
    phase: "IAM Architect",
    when: "long term",
    goal: "Design how a whole organization handles identity and access, from strategy to the systems that run it.",
    items: [
      "identity architecture and strategy",
      "zero trust",
      "identity governance (IGA)",
      "privileged access strategy",
      "cloud identity across platforms",
      "identity standards and policy",
      "CyberArk Guardian",
      "CISSP",
    ],
  },
];

// status: "studying" | "next" | "planned" | "earned"
// Only move a certification to "earned" once the exam is passed.
export const certifications = [
  { name: "ISO/IEC 27001:2022 Lead Auditor", code: "ISO 27001", issuer: "Mastermind Assurance", status: "earned" },
  { name: "Splunk Cyber Defense", code: "Splunk", issuer: "Splunk", status: "earned" },
  { name: "ITIL 4 Foundation", code: "ITIL 4", issuer: "PeopleCert", status: "studying" },
  { name: "CompTIA Security+", code: "Sec+", issuer: "CompTIA", status: "next" },
  { name: "Microsoft SC-900", code: "SC-900", issuer: "Microsoft", status: "next" },
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
// Coursework, shown on the /school page. Only the course folders are public here. What's inside them
// (notes and screenshots) is encrypted in public/coursework.enc.json until Amma unlocks it; the
// readable copy lives in private/coursework/ (never committed). See scripts/lock-coursework.mjs.
// Only Amma's own work and descriptions: no full assignment answers, classmates' names or instructor comments.
export const school = [
  { name: "Crime Fiction Narratives", code: "LITT19601G" },
  { name: "Essential Communication Skills", code: "COMM19999" },
  { name: "Operating Systems Technologies (A+ Certification Prep)", code: "SYST19866" },
  { name: "Introduction to Data Communications and Networking", code: "TELE13167" },
];

export const projects = [
  {
    name: "AI Security CTF: Prompt Injection",
    type: "CTF",
    year: "2026",
    status: "complete",
    summary:
      "Solved all three challenges, solo, in the TCM Security x Kryptsec Black Friday CTF: three AI assistants, each guarding a secret, each broken a different way.",
    points: [
      "Whispering Gate (easy): a gate sentinel AI refused to give out its passphrase, but its instructions contained it; role-playing as the sentinel taking over the shift got it to read its whole briefing aloud, passphrase included (direct prompt injection and system prompt leakage)",
      "The Poisoned Notice Board (medium): pinned a notice dressed up as an official council order; when the town crier AI read the board, it followed the notice instead of just reading it out, and revealed the confidential decree (indirect prompt injection)",
      "The Loremaster (hard): an archive AI with long-term memory, an input filter on messages and an output filter that blanked out the secret; split the instruction into small, harmless-looking notes so each one passed the filter, then had the secret written in a format the output filter did not recognise (memory poisoning)",
      "Lesson for identity and access: every assistant could see a secret it did not need. Keep secrets out of what an AI can read, give it least privilege, and treat stored memory and outside content as untrusted input",
    ],
    next: "Shows how AI assistants become an access-control problem: the same least-privilege and input-validation thinking IAM uses, applied to agents.",
    gallery: [
      { src: "projects/ai-ctf/ctf-06.webp", caption: "Small, harmless-looking notes that pass the filter one at a time (The Loremaster, hard)" },
      { src: "projects/ai-ctf/ctf-01.webp", caption: "All three challenges solved: 3 of 3 raffle entries (flag hidden)" },
      { src: "projects/ai-ctf/ctf-02.webp", caption: "Whispering Gate: the sentinel guarding its passphrase" },
      { src: "projects/ai-ctf/ctf-03.webp", caption: "The Poisoned Notice Board: a public board the town crier reads aloud" },
      { src: "projects/ai-ctf/ctf-04.webp", caption: "The Loremaster: an assistant with long-term memory" },
      { src: "projects/ai-ctf/ctf-05.webp", caption: "The input filter blocking a direct request" },
      { src: "projects/ai-ctf/ctf-07.webp", caption: "The output filter redacting the secret: the next layer to get past" },
      { src: "projects/ai-ctf/ctf-08.webp", caption: "First flag captured (flag hidden)" },
    ],
    tags: ["AI security", "prompt injection", "indirect prompt injection", "memory poisoning", "CTF", "TCM Security", "least privilege"],
  },
  {
    name: "Okta MFA & Sign-On Policy Lab",
    type: "lab",
    year: "2026",
    status: "complete",
    summary:
      "Multi-factor authentication in Okta, end to end: Okta Verify with push, TOTP and number challenge, an enrollment policy that makes every user set it up, and a sign-on policy that requires two factors, tested as a real user.",
    points: [
      "Set up an Okta org and worked in the Admin Console",
      "Onboarded a test user, John Doe, with a password set by the admin and activated right away",
      "Configured the Okta Verify authenticator: TOTP codes, push notifications and Okta FastPass",
      "Turned on number challenge for all push notifications, so a user has to match a number on screen instead of just tapping Approve (a defence against MFA fatigue and push bombing)",
      "Edited the default enrollment policy for everyone: Okta Verify and password required, with no grace period, and passkeys optional",
      "Reviewed the Okta Dashboard sign-on policy: access needs a password plus a second factor, with user interaction required and re-authentication every 12 hours",
      "Tested as the user: Okta required John to set up Okta Verify at his first sign-in, then enrolled the app on a phone by scanning the QR code",
      "Signed in again with a push: the browser showed a number, the phone asked which number it was and showed the app, device and time of the attempt, and matching it signed John in",
      "Kept secrets out of the evidence: no QR codes in the screenshots, and the admin email and sign-in location blurred",
    ],
    next: "Shows the everyday MFA work of an IAM analyst in one of the most widely used identity providers: choosing authenticators, writing the policies that enforce them and checking the user experience.",
    gallery: [
      { src: "projects/okta-lab/okta-01.webp", caption: "Number challenge: the browser shows 19 and waits for the phone" },
      { src: "projects/okta-lab/okta-02.webp", caption: "Okta Verify asks which number is on the screen, and shows the app, device and time of the sign-in" },
      { src: "projects/okta-lab/okta-03.webp", caption: "Signed in to the Okta Dashboard as John Doe after password plus push" },
      { src: "projects/okta-lab/okta-04.webp", caption: "The Okta Admin Console before setup: no users, groups or apps" },
      { src: "projects/okta-lab/okta-05.webp", caption: "Onboarding John Doe with an admin-set password" },
      { src: "projects/okta-lab/okta-06.webp", caption: "John Doe active in the directory" },
      { src: "projects/okta-lab/okta-07.webp", caption: "Okta Verify verification options: TOTP, push notification and FastPass" },
      { src: "projects/okta-lab/okta-08.webp", caption: "Number challenge required for all push challenges" },
      { src: "projects/okta-lab/okta-09.webp", caption: "Enrollment policy for everyone: Okta Verify required, no grace period" },
      { src: "projects/okta-lab/okta-10.webp", caption: "Password required too, then Update policy" },
      { src: "projects/okta-lab/okta-11.webp", caption: "Sign-on policy: a password plus a second factor, re-authentication every 12 hours" },
      { src: "projects/okta-lab/okta-12.webp", caption: "First sign-in: Okta requires John to set up Okta Verify" },
      { src: "projects/okta-lab/okta-13.webp", caption: "Every sign-in after that asks for a second factor" },
    ],
    tags: ["Okta", "MFA", "Okta Verify", "push", "number challenge", "TOTP", "enrollment policy", "authentication policy", "IAM"],
  },
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
    items: ["Active Directory", "users and groups", "RBAC and least privilege", "joiner, mover, leaver", "password and lockout policy"],
  },
  {
    group: "Authentication & SSO",
    items: ["Okta", "Keycloak", "MFA (TOTP)", "Okta Verify (push and number challenge)", "MFA enrollment and sign-on policies", "SSO", "OpenID Connect (OIDC)", "identity provider realms"],
  },
  {
    group: "Support",
    items: ["password resets", "account unlocks", "device and network troubleshooting", "VM network troubleshooting", "ticketing", "AV equipment setup"],
  },
  {
    group: "Systems",
    items: ["Windows Server 2022", "Ubuntu Linux", "Linux command line", "PowerShell", "DNS", "Microsoft 365"],
  },
  {
    group: "Cloud & Virtualization",
    items: ["Microsoft Azure (virtual networks and VMs)", "VMware Workstation", "Docker", "Remote Desktop (RDP)"],
  },
  {
    group: "Governance",
    items: ["ISO/IEC 27001", "access control", "auditing", "GRC fundamentals", "cybersecurity frameworks", "threat basics"],
  },
  {
    group: "Web & Design",
    items: ["HTML", "CSS", "React", "GSAP", "SVG", "custom domains", "DNS records", "HTTPS", "GitHub Pages", "UX/UI"],
  },
];
