-- ============================================================================
-- Geburtstagsrunde 506: Faelligkeitsmonat korrigiert
-- Ausgefuehrt am 15.08.2026 auf der Live-Datenbank (Supabase-Version
-- 20260815202340). Diese Datei haelt fest, was passiert ist – erneutes
-- Ausfuehren ist nicht noetig.
--
-- Ausgangslage
-- ------------
-- Fuer ein Mitglied mit Geburtstag im Dezember standen zwei Zeilen in
-- birthday_rounds, die dieselbe Runde meinten – die vom Dezember 2025:
--
--   id 506  due_month 2026-12-01  angelegt UND bezahlt am 13.03.2026
--   id 516  due_month 2026-01-01  offen, automatisch erzeugt
--
-- Zeile 516 folgte der alten Rechnung "Monat NACH dem Geburtstag" und meinte
-- damit Dezember 2025. Zeile 506 wurde am 13.03.2026 von Hand angelegt und im
-- selben Moment als bezahlt verbucht – fuer einen Monat, der neun Monate in
-- der Zukunft lag. Gemeint war die damals offene Dezember-Runde 2025.
--
-- Folgen im Betrieb: Das Mitglied stand ueber Zeile 516 weiter als
-- ueberfaellig da, und im Dezember 2026 haette die App seine dann echte Runde
-- ueber Zeile 506 faelschlich als bereits bezahlt angesehen.
--
-- Warum das nicht die Migration 2026-08-15_geburtstagsrunden_monat.sql erledigt
-- ----------------------------------------------------------------------------
-- Deren TEIL 2 verschiebt nur Zeilen, deren VORMONAT der Geburtsmonat ist.
-- Auf 2026-12-01 trifft das bei einem Dezember-Geburtstag nicht zu – Zeile 506
-- waere unveraendert stehen geblieben. Der Fall musste von Hand korrigiert
-- werden.
--
-- Warum auth_user_id mitgesetzt wurde
-- -----------------------------------
-- Der Unique-Schluessel heisst birthday_rounds_auth_due_uniq (auth_user_id,
-- due_month). Bei leerem auth_user_id greift er nicht, und
-- seed_birthday_rounds haette die Dezember-Runde 2025 beim naechsten Lauf
-- erneut angelegt – der Doppeleintrag waere sofort zurueck gewesen.
--
-- Der neue Wert 2025-12-01 ist migrationsfest: TEIL 2 der noch offenen
-- Migration laesst ihn unangetastet.
-- ============================================================================

delete from public.birthday_rounds where id = 516;

update public.birthday_rounds
set due_month    = date '2025-12-01',
    auth_user_id = 'b158029d-f247-424a-a0a0-ca63b412b3a8'
where id = 506;


-- ============================================================================
-- RUECKBAU – nur falls sich herausstellt, dass die Zuordnung doch anders
-- gemeint war. Stellt exakt den Zustand vom 15.08.2026 vor der Aenderung her.
-- ============================================================================
--
-- begin;
--
-- update public.birthday_rounds
-- set due_month    = date '2026-12-01',
--     auth_user_id = null
-- where id = 506;
--
-- insert into public.birthday_rounds
--   (id, auth_user_id, profile_id, due_month, first_due_stammtisch_id,
--    settled_stammtisch_id, settled_at, created_at, approved_by, approved_at)
-- values
--   (516, 'b158029d-f247-424a-a0a0-ca63b412b3a8', 85, date '2026-01-01', 29,
--    null, null, timestamptz '2026-03-17 15:48:38.220574+00', null, null);
--
-- commit;
--
-- select setval(pg_get_serial_sequence('public.birthday_rounds','id'),
--                (select max(id) from public.birthday_rounds));
