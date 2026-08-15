-- ============================================================================
-- Geburtstagsrunden: Faelligkeitsmonat = Geburtsmonat
-- Stand: 15.08.2026
--
-- ERLEDIGT AM 16.08.2026. Diese Datei ist nur noch die Planungsvorlage.
-- Was tatsaechlich gelaufen ist, steht in:
--   20260815234718_birthday_rounds_seed_geburtsmonat.sql       (TEIL 1)
--   20260815234731_birthday_rounds_umstellung_geburtsmonat.sql (TEIL 2)
-- Dort stehen auch die Rueckbau-Bloecke. Nicht noch einmal ausfuehren.
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
--
-- ERWARTETES ERGEBNIS (Trockenlauf gegen die Live-Datenbank am 16.08.2026,
-- nach der Bereinigung der doppelten Dezember-Runde):
--
--   8 Zeilen insgesamt
--   3 davon werden um einen Monat zurueck verschoben
--   0 werden geloescht  (es gibt keine Doppeleintraege mehr)
--
--   verschoben werden:  2026-04 -> 2026-03   (Geburtstag im Maerz)
--                       2026-05 -> 2026-04   (Geburtstag im April)
--                       2026-08 -> 2026-07   (Geburtstag im Juli, noch offen)
--
-- Nur die letzte der drei ist eine offene Runde – die beiden anderen sind
-- laengst gegeben und bestaetigt, da wird nur der Monat geradegerueckt.
--
-- Keiner der drei Zielmonate ist bei derselben Person schon belegt, die
-- Umstellung kann also an keiner Eindeutigkeitsregel scheitern.
--
-- Weicht dein Ergebnis davon ab, ist zwischenzeitlich etwas dazugekommen –
-- dann bitte erst nachsehen, statt TEIL 2 zu starten.

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
--
-- NACHTRAG 16.08.2026
-- -------------------
-- Beim Abgleich mit der Live-Datenbank kam heraus: die dort laufende Funktion
-- war neuer als die Vorlage, aus der dieser Teil geschrieben wurde. Sie hatte
-- bereits eine dritte Regel – "nicht seeden, wenn im selben Jahr schon eine
-- bestaetigte Runde dieser Person existiert". Der urspruengliche TEIL 1 haette
-- diese Regel beim Ersetzen ersatzlos entfernt und damit einen alten Fehler
-- zurueckgeholt (zwei Runden derselben Person in einem Jahr). Die Regel ist
-- deshalb unten wieder enthalten.
--
-- Sie wurde dabei an einer Stelle verbessert: frueher hat sie nur ueber
-- auth_user_id gesucht. Zeilen, bei denen in birthday_rounds kein
-- auth_user_id steht (im Bestand gibt es so eine), waeren dabei uebersehen
-- worden. Jetzt zaehlt auch die Uebereinstimmung ueber profile_id.

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
      -- Nicht seeden, wenn im selben Jahr schon eine bestaetigte Runde
      -- dieser Person existiert (siehe NACHTRAG oben).
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
