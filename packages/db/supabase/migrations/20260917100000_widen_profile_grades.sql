-- Widen profiles.grade to include primary-school grades 1-4 (sp1-sp4): the lectures trainer
-- covers the full szkoła podstawowa range, not just sp5-sp8 like the math trainer.

alter table public.profiles drop constraint profiles_grade_check;

alter table public.profiles add constraint profiles_grade_check
  check (grade in ('sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8', 'lo1', 'lo2', 'lo3', 'lo4'));
