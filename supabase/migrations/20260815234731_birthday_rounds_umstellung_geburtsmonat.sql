-- ============================================================================
-- Geburtstagsrunden: vorhandene Zeilen auf den Geburtsmonat umgestellt
-- Ausgefuehrt am 16.08.2026 auf der Live-Datenbank (Supabase-Version
-- 20260815234731). Entspricht TEIL 2 aus
-- 2026-08-15_geburtstagsrunden_monat.sql.
--
-- Gegenueber der Vorlage ohne temporaere Tabelle und ohne begin/commit
-- geschrieben – der Migrationslauf klammert ohnehin alles in eine Einheit.
-- Schritt B rechnet neu, was Schritt A uebrig laesst; das ist zulaessig, weil
-- der Zielmonat nur von der Zeile selbst abhaengt.
--
-- Ergebnis (vorher trocken durchgerechnet und nachher bestaetigt):
--   8 Zeilen insgesamt, 0 Loeschungen, 3 Verschiebungen um einen Monat
--     2026-04 -> 2026-03   bestaetigte Runde, nur Monat geradegerueckt
--     2026-05 -> 2026-04   bestaetigte Runde, nur Monat geradegerueckt
--     2026-08 -> 2026-07   offene Runde
--
-- Kontrolle danach: keine Zeile steht mehr in einem anderen Monat als dem
-- Geburtsmonat. Die Anzeige in der App ist unveraendert – zwei ueberfaellige
-- Runden, Februar und Juli 2026.
-- ============================================================================

-- Schritt A: Doppeleintraege derselben Person im selben Zielmonat entfernen.
-- Behalten wird die "wertvollste" Zeile: bestaetigt > gegeben > aelteste.
with rounds_with_birthday as (
  select
    br.id, br.auth_user_id, br.profile_id, br.due_month, br.settled_at, br.approved_at,
    (select pr.birthday from public.profiles pr
      where (br.profile_id is not null and pr.id = br.profile_id)
         or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
      limit 1) as birthday
  from public.birthday_rounds br
),
mapped as (
  select r.*,
    coalesce(r.profile_id::text, r.auth_user_id::text, 'x:' || r.id::text) as person,
    case
      when r.birthday is null then r.due_month
      when extract(month from (r.due_month - interval '1 month')) = extract(month from r.birthday)
        then (r.due_month - interval '1 month')::date
      else r.due_month
    end as monat_neu
  from rounds_with_birthday r
),
ranked as (
  select m.*,
    row_number() over (partition by m.person, m.monat_neu
      order by (m.approved_at is not null) desc, (m.settled_at is not null) desc, m.id asc) as platz
  from mapped m
)
delete from public.birthday_rounds
where id in (select id from ranked where platz > 1);

-- Schritt B: verbliebene Zeilen auf den Geburtsmonat verschieben.
with rounds_with_birthday as (
  select
    br.id, br.due_month,
    (select pr.birthday from public.profiles pr
      where (br.profile_id is not null and pr.id = br.profile_id)
         or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
      limit 1) as birthday
  from public.birthday_rounds br
),
mapped as (
  select r.id, r.due_month,
    case
      when r.birthday is null then r.due_month
      when extract(month from (r.due_month - interval '1 month')) = extract(month from r.birthday)
        then (r.due_month - interval '1 month')::date
      else r.due_month
    end as monat_neu
  from rounds_with_birthday r
)
update public.birthday_rounds br
set due_month = m.monat_neu
from mapped m
where m.id = br.id
  and m.monat_neu <> br.due_month;


-- ============================================================================
-- RUECKBAU – stellt exakt den Zustand vom 16.08.2026 vor der Umstellung her.
-- Es wurde nichts geloescht, nur drei Monate verschoben.
-- ============================================================================
--
-- begin;
-- update public.birthday_rounds set due_month = date '2026-04-01' where id = 509;
-- update public.birthday_rounds set due_month = date '2026-05-01' where id = 517;
-- update public.birthday_rounds set due_month = date '2026-08-01' where id = 520;
-- commit;


-- ============================================================================
-- KONTROLLE – Ergebnis muss leer sein.
-- ============================================================================
--
-- select br.id, br.due_month, pr.birthday
-- from public.birthday_rounds br
-- join public.profiles pr
--   on (br.profile_id is not null and pr.id = br.profile_id)
--   or (br.profile_id is null and br.auth_user_id is not null and pr.auth_user_id = br.auth_user_id)
-- where pr.birthday is not null
--   and extract(month from br.due_month) <> extract(month from pr.birthday);
