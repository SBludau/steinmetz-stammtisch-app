-- ============================================================================
-- Geburtstagsrunden: seed_birthday_rounds auf den Geburtsmonat umgestellt
-- Ausgefuehrt am 16.08.2026 auf der Live-Datenbank (Supabase-Version
-- 20260815234718). Entspricht TEIL 1 aus
-- 2026-08-15_geburtstagsrunden_monat.sql.
--
-- Zwei Korrekturen gegenueber der vorherigen Fassung:
--   1. Stichtag 2025-10-01 -> 2025-09-01 (gleich wie in der App)
--   2. Die Runde gehoert in den Geburtsmonat selbst, nicht in den Folgemonat
--
-- Die dritte Regel – "nicht anlegen, wenn im selben Jahr schon eine
-- bestaetigte Runde dieser Person existiert" – stand bereits in der live
-- laufenden Fassung und ist hier erhalten geblieben. Sie sucht jetzt
-- zusaetzlich ueber profile_id, damit auch Zeilen ohne auth_user_id erkannt
-- werden.
--
-- Kontrolle nach dem Ausfuehren: fuer den Stammtisch am 11.09.2026 wuerde
-- genau eine Runde angelegt (September 2026, das einzige Profil mit
-- September-Geburtstag). Das wurde vorab geprueft.
-- ============================================================================

create or replace function public.seed_birthday_rounds(
  p_due_month date,
  p_stammtisch_id bigint default null::bigint
) returns integer
  language sql
  security definer
  set search_path to 'public'
as $$
  with params as (
    select date_trunc('month', p_due_month)::date as due_month
  ),
  eligible as (
    select
      pr.auth_user_id,
      pr.id as profile_id,
      p.due_month
    from params p
    join public.profiles pr on pr.birthday is not null
    where p.due_month >= date '2025-09-01'
      -- Die Runde gehoert in den Geburtsmonat selbst.
      and extract(month from pr.birthday) = extract(month from p.due_month)
      -- Nicht anlegen, wenn im selben Jahr schon eine bestaetigte Runde
      -- dieser Person existiert.
      and not exists (
        select 1
        from public.birthday_rounds br
        where (
                (pr.auth_user_id is not null and br.auth_user_id = pr.auth_user_id)
             or (br.profile_id = pr.id)
              )
          and extract(year from br.due_month) = extract(year from p.due_month)
          and br.approved_at is not null
      )
  ),
  ins as (
    insert into public.birthday_rounds (auth_user_id, profile_id, due_month, first_due_stammtisch_id)
    select e.auth_user_id, e.profile_id, e.due_month, p_stammtisch_id
    from eligible e
    on conflict do nothing
    returning 1
  )
  select count(*)::int from ins;
$$;


-- ============================================================================
-- RUECKBAU – stellt die Fassung wieder her, die vor dem 16.08.2026 lief.
-- ============================================================================
--
-- create or replace function public.seed_birthday_rounds(
--   p_due_month date,
--   p_stammtisch_id bigint default null::bigint
-- ) returns integer
--   language sql
--   security definer
--   set search_path to 'public'
-- as $$
--   with params as (
--     select
--       date_trunc('month', p_due_month)::date as due_month,
--       (date_trunc('month', p_due_month) - interval '1 month')::date as prev_month
--   ),
--   eligible as (
--     select pr.auth_user_id, pr.id as profile_id, p.due_month
--     from params p
--     join public.profiles pr on pr.birthday is not null
--     where p.due_month >= date '2025-10-01'
--       and extract(month from pr.birthday) = extract(month from p.prev_month)
--       and not exists (
--         select 1 from public.birthday_rounds br
--         where (
--           (pr.auth_user_id is not null and br.auth_user_id = pr.auth_user_id)
--           or (pr.auth_user_id is null and br.profile_id = pr.id)
--         )
--         and extract(year from br.due_month) = extract(year from p.due_month)
--         and br.approved_at is not null
--       )
--   ),
--   ins as (
--     insert into public.birthday_rounds (auth_user_id, profile_id, due_month, first_due_stammtisch_id)
--     select e.auth_user_id, e.profile_id, e.due_month, p_stammtisch_id
--     from eligible e
--     on conflict do nothing
--     returning 1
--   )
--   select count(*)::int from ins;
-- $$;
