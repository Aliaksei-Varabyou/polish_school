-- Cross-cutting themes on pooled tasks (homeostaza, obliczenia, …). A theme spans several topics,
-- so it cannot be modelled as a second level under topic_id; it is a flat, optional label set.
alter table public.tasks add column if not exists tags text[] not null default '{}';

-- Only used when a request narrows by theme; the existing lookup index still drives the common path.
create index if not exists tasks_tags on public.tasks using gin (tags);

-- take_pool_tasks gains p_tags. Adding a defaulted parameter would leave the old signature in place
-- and make every call ambiguous, so the old function is dropped first.
drop function if exists public.take_pool_tasks(text, text, text, text, text, text[], smallint, text[], integer, integer);

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
  p_max_reports  integer default 2,
  p_tags         text[] default '{}'
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
      and (coalesce(array_length(p_tags, 1), 0) = 0 or t.tags && p_tags)
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

revoke execute on function public.take_pool_tasks from public, anon, authenticated;
grant execute on function public.take_pool_tasks to service_role;
