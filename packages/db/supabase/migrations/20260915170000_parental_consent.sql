-- Parental consent for students under 16 (RODO art. 8): the student enters a parent's e-mail,
-- the parent confirms via a one-time link (double opt-in). Evidence of consent is kept (art. 7(1)).

create table public.parental_consents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  parent_email text not null check (char_length(parent_email) <= 254),
  -- sha256 of the one-time token; the token itself is only in the e-mail
  token_hash   text not null unique,
  -- version of the consent text the parent saw
  text_version text not null,
  requested_at timestamptz not null default now(),
  expires_at   timestamptz not null,
  confirmed_at timestamptz
);

create index parental_consents_user on public.parental_consents (user_id, requested_at desc);

alter table public.parental_consents enable row level security;

create policy "parental_consents: read own" on public.parental_consents
  for select to authenticated using ((select auth.uid()) = user_id);

-- consent is only granted through the confirmation link (API, service role)
