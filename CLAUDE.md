# TRACE: notes for working on this site

Amma's standing preferences. Follow them for every change, including new pages and features.

## Look
- **All text is full white (#fff).** No grey, dimmed or faded writing anywhere: labels, hints,
  captions, notes, buttons, dates, everything. `--white-dim` and `--white-faint` resolve to white
  (see the end of `src/components/daylight/daylight.css`). Use `var(--white)` for text. Only fine
  lines and borders may stay subtle (`var(--line)`).
- Black-and-white editorial style: fine lines, mono labels, crosshair/targeting marks, restrained
  transitions. Green (`--secure`) means granted/verified and red (`--threat`) means denied, and
  nothing else. No glow, neon, colourful cards, dashboards or game-like UI.
- Proper sentence case for sentences and messages; lowercase is fine for short labels.
- Canadian spelling (colour, centre, organization).
- Support phone and laptop layouts and `prefers-reduced-motion`.

## Process
- Show a preview (screenshots or a video) before anything goes live. Deploy only when Amma says
  "deploy". Deploying = fast-forward `main` (GitHub Actions publishes to ammakwarteng.com).
- Don't add scenes, text, features or decorative elements she hasn't asked for; ask first.
- Don't mark a certification as earned unless she confirms she passed it.
- Never commit the resume PDF or its access code. The email stays obfuscated.

## Career roadmap
- Pages: `/roadmap/<stage>` and the owner sign-in at `/owner` (`src/roadmap/`).
- Data lives in Supabase (`supabase/schema.sql`): public read; owner-only, MFA-required writes,
  and only while a stage is unlocked, all enforced by row level security. Only the publishable
  key belongs in the code; never the secret/service_role key or any password.

## Letter case (one rule everywhere)
- Big titles (TRACE, section titles, roadmap page titles): UPPERCASE.
- Headings and names (projects, skill groups, roadmap stages, milestones, communities, menu): Sentence case,
  keeping proper names and acronyms (Active Directory, IAM, WiCyS).
- Sentences: Sentence case.
- Everything in the mono (typewriter) face (labels, tags, buttons, hints, statuses, captions, notes, footer,
  intro storyline): UPPERCASE.
- Your name is written "Amma Kwarteng" everywhere. Only email addresses stay lowercase.
