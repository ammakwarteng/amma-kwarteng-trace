-- TRACE career roadmap: tables, security rules and starting data.
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run.
-- Safe to run again: it skips anything that already exists.
--
-- Security model
--   * Anyone (the public website) may READ stages and milestones.
--   * Only the owner may WRITE, and only from a session that passed MFA (AAL2).
--     The owner is whoever is listed in public.owners; nobody can add themselves there
--     through the website (the table has no API access at all).
--   * A stage is LOCKED unless the owner unlocks it. While a stage is locked the database
--     rejects every change to its milestones, whoever asks. "Save & Lock" relocks it.
--   * A certification can only be marked completed once the owner has explicitly
--     confirmed it was earned (earned_confirmed), so nothing is marked earned by accident.

-- 1. The owner ------------------------------------------------------------------------------
create table if not exists public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.owners enable row level security;
revoke all on public.owners from anon, authenticated;   -- no API access, no policies

-- true only for the owner, signed in with MFA
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.owners o where o.user_id = (select auth.uid()));
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

-- 2. Stages and milestones ------------------------------------------------------------------
do $$ begin
  create type public.milestone_status as enum ('planned', 'learning', 'completed');
exception when duplicate_object then null; end $$;

create table if not exists public.stages (
  slug       text primary key,
  title      text not null,
  position   int  not null,
  locked     boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id               uuid primary key default gen_random_uuid(),
  stage_slug       text not null references public.stages (slug) on delete cascade,
  title            text not null check (char_length(title) between 1 and 160),
  kind             text not null default 'skill' check (kind in ('skill', 'certification')),
  status           public.milestone_status not null default 'planned',
  position         int  not null default 0,
  projects         text[] not null default '{}',          -- slugs of portfolio projects
  earned_confirmed boolean not null default false,          -- certifications only
  started_on       date,
  completed_on     date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint certification_needs_confirmation
    check (kind <> 'certification' or status <> 'completed' or earned_confirmed)
);
create index if not exists milestones_stage_idx on public.milestones (stage_slug, position);

-- 3. Starting data (taken from the roadmap already on the site) -----------------------------
-- Everything starts as planned, except ITIL 4, which the site already lists as being studied.
-- Nothing is marked completed.
insert into public.stages (slug, title, position) values
  ('help-desk',     'help desk',     1),
  ('iam-analyst',   'iam analyst',   2),
  ('iam-engineer',  'iam engineer',  3),
  ('iam-architect', 'iam architect', 4)
on conflict (slug) do nothing;

insert into public.milestones (stage_slug, title, kind, status, position)
select v.stage_slug, v.title, v.kind, v.status::public.milestone_status, v.position
from (values
  ('help-desk', 'ITIL 4 Foundation', 'certification', 'learning', 1),
  ('help-desk', 'CompTIA Security+', 'certification', 'planned', 2),
  ('help-desk', 'Active Directory', 'skill', 'planned', 3),
  ('help-desk', 'password resets and account requests', 'skill', 'planned', 4),
  ('help-desk', 'PowerShell basics', 'skill', 'planned', 5),
  ('iam-analyst', 'authentication and MFA', 'skill', 'planned', 1),
  ('iam-analyst', 'SSO and federation (SAML, OIDC)', 'skill', 'planned', 2),
  ('iam-analyst', 'RBAC and least privilege', 'skill', 'planned', 3),
  ('iam-analyst', 'joiner, mover, leaver', 'skill', 'planned', 4),
  ('iam-analyst', 'access requests and approvals', 'skill', 'planned', 5),
  ('iam-analyst', 'access reviews and audit evidence', 'skill', 'planned', 6),
  ('iam-analyst', 'Microsoft Entra ID', 'skill', 'planned', 7),
  ('iam-analyst', 'Microsoft SC-900', 'certification', 'planned', 8),
  ('iam-analyst', 'Microsoft SC-300', 'certification', 'planned', 9),
  ('iam-analyst', 'Okta Certified Professional', 'certification', 'planned', 10),
  ('iam-engineer', 'CyberArk Trustee', 'certification', 'planned', 1),
  ('iam-engineer', 'CyberArk Defender: PAM', 'certification', 'planned', 2),
  ('iam-engineer', 'CyberArk Sentry: PAM', 'certification', 'planned', 3),
  ('iam-engineer', 'Okta Certified Administrator', 'certification', 'planned', 4),
  ('iam-engineer', 'vaulting', 'skill', 'planned', 5),
  ('iam-engineer', 'password rotation', 'skill', 'planned', 6),
  ('iam-engineer', 'session monitoring', 'skill', 'planned', 7),
  ('iam-architect', 'identity architecture and strategy', 'skill', 'planned', 1),
  ('iam-architect', 'zero trust', 'skill', 'planned', 2),
  ('iam-architect', 'identity governance (IGA)', 'skill', 'planned', 3),
  ('iam-architect', 'privileged access strategy', 'skill', 'planned', 4),
  ('iam-architect', 'cloud identity across platforms', 'skill', 'planned', 5),
  ('iam-architect', 'identity standards and policy', 'skill', 'planned', 6),
  ('iam-architect', 'CyberArk Guardian', 'certification', 'planned', 7),
  ('iam-architect', 'CISSP', 'certification', 'planned', 8)
) as v (stage_slug, title, kind, status, position)
where not exists (select 1 from public.milestones m where m.stage_slug = v.stage_slug and m.title = v.title);

-- 4. Dates are recorded by the database -----------------------------------------------------
-- started_on: the day a milestone first moves to "learning" (unless the owner sets one)
-- completed_on: the day it moves to "completed" (the owner may backdate it); cleared if undone
create or replace function public.milestone_dates()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'learning' and new.started_on is null
     and (tg_op = 'INSERT' or old.status is distinct from 'learning') then
    new.started_on := current_date;
  end if;
  if new.status = 'completed' then
    if new.completed_on is null then new.completed_on := current_date; end if;
  else
    new.completed_on := null;
  end if;
  return new;
end $$;
drop trigger if exists milestone_dates on public.milestones;
create trigger milestone_dates before insert or update on public.milestones
  for each row execute function public.milestone_dates();

create or replace function public.touch_stage()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists touch_stage on public.stages;
create trigger touch_stage before update on public.stages
  for each row execute function public.touch_stage();

-- 5. Who may do what (row level security) ---------------------------------------------------
create or replace function public.stage_unlocked(s text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.stages where slug = s and not locked);
$$;
revoke all on function public.stage_unlocked(text) from public;
grant execute on function public.stage_unlocked(text) to authenticated;

alter table public.stages enable row level security;
alter table public.milestones enable row level security;

revoke all on public.stages, public.milestones from anon, authenticated;
grant select on public.stages, public.milestones to anon, authenticated;
grant update (locked) on public.stages to authenticated;
grant insert, update, delete on public.milestones to authenticated;

drop policy if exists "stages are public" on public.stages;
create policy "stages are public" on public.stages
  for select to anon, authenticated using (true);

drop policy if exists "owner locks and unlocks stages" on public.stages;
create policy "owner locks and unlocks stages" on public.stages
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "milestones are public" on public.milestones;
create policy "milestones are public" on public.milestones
  for select to anon, authenticated using (true);

drop policy if exists "owner adds milestones to an unlocked stage" on public.milestones;
create policy "owner adds milestones to an unlocked stage" on public.milestones
  for insert to authenticated
  with check (public.is_owner() and public.stage_unlocked(stage_slug));

drop policy if exists "owner edits milestones in an unlocked stage" on public.milestones;
create policy "owner edits milestones in an unlocked stage" on public.milestones
  for update to authenticated
  using (public.is_owner() and public.stage_unlocked(stage_slug))
  with check (public.is_owner() and public.stage_unlocked(stage_slug));

drop policy if exists "owner removes milestones from an unlocked stage" on public.milestones;
create policy "owner removes milestones from an unlocked stage" on public.milestones
  for delete to authenticated
  using (public.is_owner() and public.stage_unlocked(stage_slug));
