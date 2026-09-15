-- Shared pool of verified tasks (replaces the per-server SQLite pool when Supabase is configured).
-- Accessed only by the API (service role): no RLS policies, functions not executable by clients.

create table public.tasks (
  id          text primary key,
  trainer_id  text not null,
  lang        text not null,
  grade       text not null,
  level       text not null default '',
  topic_id    text not null,
  difficulty  smallint not null check (difficulty between 1 and 3),
  answer_type text not null,
  data        jsonb not null,
  served      integer not null default 0,
  reports     integer not null default 0,
  created_at  timestamptz not null default now()
);

create index tasks_lookup on public.tasks (trainer_id, lang, grade, level, topic_id, answer_type);

alter table public.tasks enable row level security;

create table public.task_reports (
  id         bigint generated always as identity primary key,
  task_id    text not null references public.tasks (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  reason     text check (char_length(reason) <= 500),
  created_at timestamptz not null default now()
);

create index task_reports_task on public.task_reports (task_id);

alter table public.task_reports enable row level security;

-- Picks unseen, rarely reported tasks (preferred difficulty first, least served first) and marks them served.
create function public.take_pool_tasks(
  p_trainer_id   text,
  p_lang         text,
  p_grade        text,
  p_level        text,
  p_topic_id     text,
  p_answer_types text[],
  p_difficulty   smallint,
  p_exclude      text[],
  p_limit        integer,
  p_max_reports  integer default 2
) returns setof jsonb
  language sql set search_path = '' as $$
  with picked as (
    select t.id
    from public.tasks t
    where t.trainer_id = p_trainer_id
      and t.lang = p_lang
      and t.grade = p_grade
      and t.level = p_level
      and t.topic_id = p_topic_id
      and t.answer_type = any (p_answer_types)
      and not (t.id = any (coalesce(p_exclude, '{}')))
      and t.reports < p_max_reports
    order by (t.difficulty = p_difficulty) desc, t.served asc, random()
    limit greatest(p_limit, 0)
    for update skip locked
  )
  update public.tasks t
  set served = t.served + 1
  from picked
  where t.id = picked.id
  returning t.data;
$$;

-- Records a report about a wrong/unclear task; returns false if the task is not in the pool.
create function public.report_task(p_task_id text, p_user_id uuid, p_reason text)
  returns boolean
  language plpgsql set search_path = '' as $$
begin
  update public.tasks set reports = reports + 1 where id = p_task_id;
  if not found then
    return false;
  end if;
  insert into public.task_reports (task_id, user_id, reason) values (p_task_id, p_user_id, left(p_reason, 500));
  return true;
end;
$$;

revoke execute on function public.take_pool_tasks from public, anon, authenticated;
revoke execute on function public.report_task from public, anon, authenticated;
grant execute on function public.take_pool_tasks to service_role;
grant execute on function public.report_task to service_role;
