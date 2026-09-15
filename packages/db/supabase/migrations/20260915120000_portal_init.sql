-- Portal schema: student profiles and practice history.
-- Users can only READ their own rows (RLS). History is WRITTEN by the API with the service role,
-- which re-checks answers, so a student cannot forge results through the public API.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  display_name        text check (char_length(display_name) <= 60),
  grade               text check (grade in ('sp5', 'sp6', 'sp7', 'sp8', 'lo1', 'lo2', 'lo3', 'lo4')),
  level               text check (level in ('P', 'R')),
  ui_lang             text not null default 'pl' check (ui_lang in ('ru', 'en', 'pl')),
  birth_year          smallint check (birth_year between 1990 and 2030),
  parental_consent_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- a user may not grant themselves parental consent or change ids/timestamps
revoke update on public.profiles from authenticated;
grant update (display_name, grade, level, ui_lang, birth_year) on public.profiles to authenticated;

create function public.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- create a profile for every new auth user
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, ui_lang)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 60),
    case when new.raw_user_meta_data ->> 'ui_lang' in ('ru', 'en', 'pl') then new.raw_user_meta_data ->> 'ui_lang' else 'pl' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- practice sessions
-- ---------------------------------------------------------------------------
create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  trainer_id  text not null,
  -- lang, grade, level, topicIds, count, answerMode
  settings    jsonb not null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  correct     integer not null default 0 check (correct >= 0),
  total       integer not null check (total > 0)
);

create index sessions_user_started on public.sessions (user_id, started_at desc);

alter table public.sessions enable row level security;

create policy "sessions: read own" on public.sessions
  for select to authenticated using ((select auth.uid()) = user_id);

create table public.session_tasks (
  session_id  uuid not null references public.sessions (id) on delete cascade,
  position    smallint not null,
  task_id     text not null,
  topic_id    text not null,
  difficulty  smallint not null check (difficulty between 1 and 3),
  -- snapshot of the task as shown to the student
  task        jsonb not null,
  user_answer text,
  correct     boolean,
  used_hint   boolean not null default false,
  answered_at timestamptz,
  primary key (session_id, position)
);

create index session_tasks_task on public.session_tasks (task_id);

alter table public.session_tasks enable row level security;

create policy "session_tasks: read own" on public.session_tasks
  for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())));

create table public.session_feedback (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.session_feedback enable row level security;

create policy "session_feedback: read own" on public.session_feedback
  for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = (select auth.uid())));

-- no insert/update/delete policies on history tables: only the service role (API) writes them
