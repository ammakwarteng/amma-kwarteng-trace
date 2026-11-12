// Data access for the career roadmap pages.
//
// Security lives in the database (supabase/schema.sql), not here: this file only ever holds the
// project's PUBLIC address and PUBLISHABLE key, which can read the roadmap and nothing else.
// Every write is checked by Postgres row level security: the owner, signed in with MFA (AAL2),
// and only while the stage is unlocked.
import { createClient } from "@supabase/supabase-js";
import { roadmap, projects } from "../data/content.js";

export const SUPABASE_URL = "https://oglarrovddxvyqxeodqv.supabase.co";
export const SUPABASE_KEY = "sb_publishable_Nu0lfr1aKaE_h0FAcRggEw__kVbatep";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "trace-owner" },
});

export const slugOf = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// The four stages in order, with the words already on the site (when, goal).
export const STAGES = roadmap.map((r, i) => ({ slug: slugOf(r.phase), title: r.phase, when: r.now ? "you are here" : r.when, now: !!r.now, goal: r.goal, position: i + 1, items: r.items }));
export const stageBySlug = (slug) => STAGES.find((s) => s.slug === slug);

// Portfolio projects a milestone can point to.
export const PROJECTS = projects.map((p) => ({ slug: slugOf(p.name), name: p.name }));
export const projectName = (slug) => PROJECTS.find((p) => p.slug === slug)?.name || slug;

const CERT = /ITIL|Security\+|SC-\d|Okta Certified|CyberArk|CISSP/;

// Read everything (4 stages, a few dozen milestones). If the database can't be reached, fall back
// to the plan already written on the site, read-only and without progress.
export async function loadRoadmap() {
  try {
    const [st, ms] = await Promise.all([
      supabase.from("stages").select("slug,title,position,locked,updated_at").order("position"),
      supabase.from("milestones").select("*").order("position"),
    ]);
    if (st.error) throw st.error;
    if (ms.error) throw ms.error;
    return { live: true, stages: st.data, milestones: ms.data };
  } catch {
    return {
      live: false,
      stages: STAGES.map((s) => ({ slug: s.slug, title: s.title, position: s.position, locked: true })),
      milestones: STAGES.flatMap((s) => s.items.map((t, i) => ({
        id: `${s.slug}-${i}`, stage_slug: s.slug, title: t, kind: CERT.test(t) ? "certification" : "skill",
        status: "planned", position: i + 1, projects: [], earned_confirmed: false, started_on: null, completed_on: null,
      }))),
    };
  }
}

// Owner check: true only for the owner's MFA-verified session (the same rule the database uses).
export async function checkOwner() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return false;
  const { data, error } = await supabase.rpc("is_owner");
  return !error && data === true;
}

// Lock or unlock a stage. Returns false if the database refused (not the owner, no MFA, ...).
export async function setLocked(slug, locked) {
  const { data, error } = await supabase.from("stages").update({ locked }).eq("slug", slug).select("slug,locked");
  if (error) throw error;
  return data.length === 1 && data[0].locked === locked;
}

// Write the owner's edits for one stage, then lock it again ("Save & Lock").
export async function saveAndLock(slug, changes, added) {
  for (const [id, patch] of Object.entries(changes)) {
    const { data, error } = await supabase.from("milestones").update(patch).eq("id", id).select("id");
    if (error) throw error;
    if (!data.length) throw new Error("The database refused a change. Is the stage still unlocked?");
  }
  if (added.length) {
    const { error } = await supabase.from("milestones").insert(added.map(({ tmp, ...m }) => ({ ...m, stage_slug: slug })));
    if (error) throw error;
  }
  if (!(await setLocked(slug, true))) throw new Error("Saved, but the stage could not be locked. Try Save & Lock again.");
}

export const fmtDate = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "");
