-- ============================================================================
-- Geburtstagsrunden: Faelligkeitsmonat = Geburtsmonat
-- Stand: 15.08.2026
--
-- BITTE ZUERST LESEN. Diese Datei wird NICHT automatisch ausgefuehrt.
-- Sie besteht aus drei Teilen, die einzeln und in dieser Reihenfolge im
-- Supabase SQL-Editor ausgefuehrt werden sollen:
--
--   TEIL 0  Nur anschauen (aendert nichts). Zeigt, was Teil 2 tun wuerde.
--   TEIL 1  Datenbankfunktion ersetzen (aendert keine vorhandenen Daten).
--   TEIL 2  Vorhandene Zeilen umstellen (aendert Daten! Vorher Backup).
--
-- Hintergrund
-- -----------
-- Bisher hat die Funktion seed_birthday_rounds die Runde in den Monat NACH
-- dem Geburtstag eingetragen (Geburtstag im Maerz -> due_month = April).
-- Die App rechnet dagegen mit dem Geburtsmonat selbst. Dadurch passten
-- Datenbank und App nicht zusammen.
--
-- Ausserdem stand in der Funktion der Stichtag 01.10.2025, in der App aber
-- 01.09.2025. Beide sagen jetzt September 2025.
-- ============================================================================


-- ============================================================================
-- TEIL 0 – NUR ANSCHAUEN (aendert nichts)
-- ============================================================================
-- Zeigt fuer jede vorhandene Geburtstagsrunde: welchen Monat sie heute hat,
-- welchen Monat sie nachher haette, und ob sie als Doppeleintrag geloescht
-- wuerde.

with rounds_with_birthday as (
  select
    br.id,
    br.auth_user_id,
    br.profile_id,
    br.due_month,
    br.settled_at,
    br.approved_at,
    (
      select pr.birthday
      from public.profiles pr
      where (br.profile_id is not null and pr.id = br.profile_id)
         or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
      limit 1
    ) as birthday
  from public.birthday_rounds br
),
mapped as (
  select
    r.*,
    coalesce(r.profile_id::text, r.auth_user_id::text, 'x:' || r.id::text) as person,
    case
      when r.birthday is null then r.due_month
      -- alte Rechnung erkannt: der Monat davor ist der Geburtsmonat
      when extract(month from (r.due_month - interval '1 month')) = extract(month from r.birthday)
        then (r.due_month - interval '1 month')::date
      else r.due_month
    end as monat_neu
  from rounds_with_birthday r
),
ranked as (
  select
    m.*,
    row_number() over (
      partition by m.person, m.monat_neu
      order by (m.approved_at is not null) desc, (m.settled_at is not null) desc, m.id asc
    ) as platz
  from mapped m
)
select
  id,
  person,
  birthday                as geburtstag,
  due_month               as monat_alt,
  monat_neu,
  (monat_neu <> due_month) as wird_verschoben,
  (platz > 1)              as wird_geloescht_als_doppel,
  settled_at,
  approved_at
from ranked
order by person, monat_neu, platz;


-- ============================================================================
-- TEIL 1 – DATENBANKFUNKTION ERSETZEN
-- ============================================================================
-- Aendert nur die Funktion, keine vorhandenen Zeilen.
-- Zwei Korrekturen:
--   1. Stichtag 2025-10-01 -> 2025-09-01 (gleich wie in der App)
--   2. Geburtsmonat statt Folgemonat

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
-- TEIL 2 – VORHANDENE ZEILEN UMSTELLEN (aendert Daten!)
-- ============================================================================
-- VORHER: In Supabase unter Database -> Backups pruefen, dass ein aktuelles
-- Backup existiert. Erst danach ausfuehren.
--
-- Der Block laeuft als eine Einheit: Wenn irgendetwas fehlschlaegt, wird
-- nichts geaendert (rollback).
--
-- Schritt A loescht Doppeleintraege derselben Person im selben Zielmonat.
--   Behalten wird immer die "wertvollste" Zeile in dieser Reihenfolge:
--   bestaetigt > gegeben > aelteste.
-- Schritt B verschiebt die verbliebenen Zeilen auf den Geburtsmonat.

begin;

create temporary table _runden_umstellung on commit drop as
with rounds_with_birthday as (
  select
    br.id,
    br.auth_user_id,
    br.profile_id,
    br.due_month,
    br.settled_at,
    br.approved_at,
    (
      select pr.birthday
      from public.profiles pr
      where (br.profile_id is not null and pr.id = br.profile_id)
         or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
      limit 1
    ) as birthday
  from public.birthday_rounds br
),
mapped as (
  select
    r.*,
    coalesce(r.profile_id::text, r.auth_user_id::text, 'x:' || r.id::text) as person,
    case
      when r.birthday is null then r.due_month
      when extract(month from (r.due_month - interval '1 month')) = extract(month from r.birthday)
        then (r.due_month - interval '1 month')::date
      else r.due_month
    end as monat_neu
  from rounds_with_birthday r
)
select
  m.id,
  m.due_month,
  m.monat_neu,
  row_number() over (
    partition by m.person, m.monat_neu
    order by (m.approved_at is not null) desc, (m.settled_at is not null) desc, m.id asc
  ) as platz
from mapped m;

-- Schritt A: Doppeleintraege entfernen
delete from public.birthday_rounds
where id in (select id from _runden_umstellung where platz > 1);

-- Schritt B: verbliebene Zeilen auf den Geburtsmonat verschieben
update public.birthday_rounds br
set due_month = u.monat_neu
from _runden_umstellung u
where u.id = br.id
  and u.platz = 1
  and u.monat_neu <> br.due_month;

commit;


-- ============================================================================
-- KONTROLLE NACH TEIL 2
-- ============================================================================
-- Ergebnis muss leer sein: keine Runde darf noch im Folgemonat stehen.

select br.id, br.due_month, pr.birthday
from public.birthday_rounds br
join public.profiles pr
  on (br.profile_id is not null and pr.id = br.profile_id)
  or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
where pr.birthday is not null
  and extract(month from br.due_month) <> extract(month from pr.birthday);
