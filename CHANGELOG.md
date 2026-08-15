# Changelog
Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und die Versionsnummern an [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- App Layout Feinschliff (Abstände, responsives Verhalten, Accessibility Labels)
- Wichtige Tools: Stein–Schere–Papier, Münzwurf und Vegas Counter „Schwarz/Rot” mit Max-Counter für Stats
- Google Auth-Login Display überprüfen/vereinheitlichen

---

## [0.4.15] - 2026-08-16

**Geänderte Dateien**
- `supabase/migrations/20260815234718_birthday_rounds_seed_geburtsmonat.sql` (neu)
- `supabase/migrations/20260815234731_birthday_rounds_umstellung_geburtsmonat.sql` (neu)
- `supabase/migrations/2026-08-15_geburtstagsrunden_monat.sql` (als erledigt markiert)

Datenbank-Umstellung, kein App-Code. Der Build vom 15.08. bleibt gültig.

### Geändert
- **Fälligkeitsmonat ist jetzt der Geburtsmonat – auch in der Datenbank** –
  Bisher trug die Datenbank die Runde in den Monat *nach* dem Geburtstag ein,
  die App rechnete aber mit dem Geburtsmonat selbst. Beide sagen jetzt
  dasselbe. Zusätzlich wurde der Stichtag in der Datenbank von 01.10.2025 auf
  01.09.2025 gezogen, damit er zur App passt.
- **Vorhandene Runden auf den Geburtsmonat gezogen** – Drei von acht Zeilen
  standen einen Monat zu spät und wurden zurückgeschoben (April → März,
  Mai → April, August → Juli). Nichts wurde gelöscht, es gab keine
  Doppeleinträge mehr. Beide Migrationsdateien enthalten einen fertigen
  Rückbau-Block.

### Geprüft
- Kontrollabfrage nach der Umstellung ist leer: keine Runde steht mehr in
  einem anderen Monat als dem Geburtsmonat.
- Die Anzeige in der App ist unverändert richtig – zwei überfällige Runden
  (Februar und Juli 2026), und beim Stammtisch am 11.09.2026 steht die
  September-Runde weiterhin als „noch nicht fällig" da, weil der Geburtstag
  erst zwei Tage nach dem Stammtisch ist. Auf dem Startbildschirm, in der
  Stammtisch-Detailseite und unter „Früher" jeweils am Bildschirm geprüft.
- Für den nächsten Stammtisch würde die neue Funktion genau eine Runde
  anlegen – vorab ohne Schreibzugriff durchgerechnet.

---

## [0.4.14] - 2026-08-16

**Geänderte Dateien**
- `supabase/migrations/2026-08-15_geburtstagsrunden_monat.sql`
- `supabase/migrations/20260815202340_fix_birthday_round_506.sql`

Nur Migrationsdateien und Dokumentation. Kein App-Code, kein neuer Build nötig.

### Behoben
- **TEIL 1 der noch offenen Migration hätte eine Schutzregel gelöscht** – Die
  Funktion `seed_birthday_rounds`, die tatsächlich in der Datenbank läuft, war
  neuer als die Vorlage, aus der TEIL 1 geschrieben wurde: Sie enthält bereits
  die Regel „nicht anlegen, wenn im selben Jahr schon eine bestätigte Runde
  dieser Person existiert". Beim Ersetzen wäre diese Regel ersatzlos
  verschwunden und der alte Fehler „zwei Runden derselben Person in einem
  Jahr" zurückgekommen. Die Regel ist jetzt in TEIL 1 enthalten und sucht
  zusätzlich über `profile_id`, damit auch Zeilen ohne `auth_user_id` erkannt
  werden.

### Geändert
- **Trockenlauf-Ergebnis in die Migration eingetragen** – TEIL 0 wurde gegen
  die Live-Datenbank durchgerechnet (nur gelesen, nichts geändert). Das
  erwartete Ergebnis steht jetzt als Sollwert in der Datei: 8 Zeilen, davon 3
  um einen Monat zurück, 0 Löschungen, keine Kollision mit einer
  Eindeutigkeitsregel. Weicht das Ergebnis beim Ausführen ab, ist etwas
  dazugekommen und TEIL 2 sollte nicht gestartet werden.
- **Begründung zur Runden-Korrektur richtiggestellt** – In der Datei zur
  Korrektur vom 15.08. stand, ohne `auth_user_id` hätte nichts das erneute
  Anlegen verhindert. Es gibt zusätzlich den Schlüssel
  `birthday_rounds_profile_due_uq (profile_id, due_month)`, der ebenfalls
  gegriffen hätte. Die Korrektur selbst bleibt richtig und unverändert.

---

## [0.4.13] - 2026-08-15

**Geänderte Dateien**
- `supabase/migrations/20260815202340_fix_birthday_round_506.sql` (neu)

Reine Datenkorrektur in der Live-Datenbank, kein Code-Eingriff. Die App
musste dafür nicht neu gebaut werden.

### Behoben
- **Doppelter Eintrag für eine Dezember-Runde 2025** – Für ein Mitglied mit
  Geburtstag im Dezember standen zwei Zeilen in `birthday_rounds`, die
  dieselbe Runde meinten: eine offene (automatisch erzeugt, nach der alten
  Rechnung „Monat nach dem Geburtstag") und eine bezahlte, die versehentlich
  auf Dezember **2026** stand. Dadurch galt die Runde gleichzeitig als offen
  und wäre im Dezember 2026 fälschlich als schon bezahlt angesehen worden.
  Der bezahlte Eintrag steht jetzt auf dem richtigen Monat, der doppelte
  wurde entfernt. Die Migrationsdatei enthält die Analyse und einen fertigen
  Rückbau-Block.

### Hinweis
- Die noch offene Migration `2026-08-15_geburtstagsrunden_monat.sql` hätte
  diesen Fall **nicht** mit erledigt: Ihr TEIL 2 verschiebt nur Zeilen, deren
  Vormonat der Geburtsmonat ist. Der Fall musste von Hand korrigiert werden.

---

## [0.4.12] - 2026-08-15

**Geänderte Dateien**
- `src/lib/birthdayRounds.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/stammtisch/[id].tsx`

Der Stichtag (eine Geburtstagsrunde wird erst am Geburtstag selbst fällig)
galt bisher nur auf der Stammtisch-Detailseite. Keine Datenbank-Änderung.

### Behoben
- **Startbildschirm forderte Runden vor dem Geburtstag ein** – In der Kachel
  des nächsten Stammtischs stand unter „Geburtstags-Runden" jeder, dessen
  Geburtstag in denselben Monat fällt – auch dann, wenn der Geburtstag erst
  nach dem Stammtisch-Termin liegt. Beispiel: Stammtisch am 11. September,
  Geburtstag am 13. September – an dem Abend ist noch nichts fällig. Solche
  Einträge werden weiterhin angezeigt (man sieht ja gern, wer bald Geburtstag
  hat), jetzt aber ausgegraut und mit dem Zusatz „noch nicht fällig", genau
  wie auf der Stammtisch-Detailseite.

### Geändert
- Die Stichtag-Regel (R-5a) steht jetzt ebenfalls in
  `src/lib/birthdayRounds.ts` (`isBirthdayDueOn`) und wird von beiden
  Bildschirmen benutzt. Vorher stand sie nur in der Detailseite – dieselbe
  Art von Doppelung, die schon bei den Fälligkeitsmonaten zu Fehlern geführt
  hat. Der Geltungsbereich der Funktion ist im Code dokumentiert: Sie
  beantwortet nur die Tagesfrage innerhalb eines Monats; der Jahreswechsel
  bleibt Sache von `overdueBirthdayMonth`.

### Geprüft
- Alle Bildschirme durchgesehen, die Runden anzeigen oder zählen
  (Startseite, Stammtisch-Detail, Statistik, Hall of Fame, Mitgliedskarte,
  Profil, Admin-Profil). Nur die beiden erstgenannten treffen
  Fälligkeits-Entscheidungen; die übrigen zählen ausschließlich bestätigte
  Runden und brauchen den Stichtag nicht. Die Zählung wird überall auf das
  Profil vereinheitlicht, verknüpfte Mitglieder werden nirgends doppelt
  gezählt.
- 41 Regeltests (21 neue zum Stichtag: Monatsränder, 29. Februar mit und ohne
  Schalttag, fehlende Datumsangaben, Jahreswechsel), alle bestanden.
- `npx tsc --noEmit`: 196 Meldungen – unverändert zum Stand davor.
- `npx expo export --platform android` erfolgreich.

---

## [0.4.11] - 2026-08-15

**Geänderte Dateien**
- `src/lib/birthdayRounds.ts` (neu)
- `app/(tabs)/index.tsx`
- `app/(tabs)/stammtisch/[id].tsx`
- `app/(tabs)/stats.tsx`
- `scripts/backup-supabase.js` (neu)
- `package.json`
- `.github/workflows/supabase-ping.yml`

Nacharbeit zu den drei Runden-Etappen: Der Startbildschirm rechnete die
überfälligen Geburtstagsrunden immer noch nach der alten, eigenen Formel. Dazu
zwei Wartungsthemen außerhalb der App (Wach-Ping und Datensicherung). Keine
Datenbank-Änderung.

### Behoben
- **Startbildschirm zeigte überfällige Geburtstagsrunden falsch an** – Die
  Kachel „Überfällige Runden" auf der Startseite rechnete nach einer eigenen,
  veralteten Formel: Sie sah nur das laufende Jahr an, verglich Personen statt
  Monaten und ignorierte den Stichtag. Folgen: Dezember-Geburtstage
  verschwanden ab Januar aus der Liste, eine einmal gegebene Runde ließ die
  Person für immer als erledigt gelten, und der angezeigte Monat wurde ein
  zweites Mal umgerechnet und konnte danebenliegen. Der Startbildschirm nutzt
  jetzt exakt dieselbe Rechnung wie die Stammtisch-Ansicht.
- **Runden von nachträglich verknüpften Profilen wurden doppelt gezählt** – Wer
  seine Runde vor der Verknüpfung mit dem Google-Konto gegeben hatte, tauchte
  danach wieder als überfällig auf, weil der alte Eintrag noch am Profil und
  der neue am Konto hing. Beide Schreibweisen werden jetzt auf dieselbe Person
  zurückgeführt.
- **„1 Runden" in der Statistik** – Bei genau einem Eintrag wird jetzt die
  Einzahl angezeigt („1 Runde", „1 Teilnahme").

### Geändert
- Die Regeln für Geburtstagsrunden stehen jetzt in einer eigenen Datei
  (`src/lib/birthdayRounds.ts`) und werden von Startbildschirm und
  Stammtisch-Ansicht gemeinsam genutzt. Genau das Auseinanderlaufen dieser
  beiden Kopien war die Ursache der Fehler oben.

### Hinzugefügt
- **Datensicherung per Knopfdruck** – `npm run backup` schreibt alle Tabellen in
  eine JSON-Datei im Projektordner. Im kostenlosen Supabase-Tarif gibt es keine
  eigenen Sicherungen, aus denen man zurückspielen könnte. Die Dateien sind von
  GitHub ausgeschlossen, weil sie echte Daten enthalten.

### Wartung
- **Wach-Ping wieder aktiviert** – Der Ping, der Supabase am Schlafen hindert,
  lief bis 19.05.2026 sauber und wurde dann von GitHub automatisch abgeschaltet:
  GitHub deaktiviert Zeitpläne, wenn 60 Tage lang nichts ins Repository
  gepusht wurde. Der Workflow ist wieder aktiv, läuft jetzt alle 2 Tage statt
  alle 3 und hält sich zusätzlich selbst am Leben, indem er nach 45 ruhigen
  Tagen einen leeren Commit setzt.

### Geprüft
- `npx tsc --noEmit`: 196 Meldungen, unverändert gegenüber 0.4.10.
- `npx expo export --platform android`: erfolgreich durchgelaufen.
- 20 Rechenbeispiele der neuen gemeinsamen Regel-Datei durchgetestet
  (Jahreswechsel, laufender Monat, Stichtag, alte Datenbank-Schreibweise) –
  alle bestanden.
- Gegenprobe direkt auf der Datenbank: Die Liste, die die App jetzt berechnet,
  stimmt mit der Abfrage auf den echten Daten überein.
- `npm run backup` einmal ausgeführt: alle acht Tabellen vollständig gesichert.

---

## [0.4.10] - 2026-08-15

**Geänderte Dateien**
- `app/(tabs)/stammtisch/[id].tsx`

Dritte und letzte Etappe aus der Prüfung der Runden-Regeln. Diese Etappe
betrifft den Jahreswechsel. Keine Datenbank-Änderung.

### Behoben
- **Runde am Jahreswechsel wurde dem falschen Jahr zugeordnet** – Bei einer
  Dezember-Runde, die in der Datenbank noch nach der alten Rechnung als Januar
  gespeichert war, hat die App das Jahr vom Stammtisch-Datum genommen. Aus
  „Dezember 2026" wurde dadurch „Dezember 2027". Die Runde galt anschließend als
  offen, obwohl sie längst gegeben war. Das Jahr wird jetzt aus dem gespeicherten
  Wert selbst abgeleitet, inklusive des Sprungs von Januar zurück in den
  Dezember des Vorjahres.
- **Überfällige Runden verschwanden zum Jahreswechsel** – Eine im Dezember nicht
  gegebene Runde tauchte im Januar nicht mehr unter „Überfällige
  Geburtstagsrunden" auf, weil nur das laufende Jahr durchsucht wurde. Es wird
  jetzt zusätzlich der gleiche Monat im Vorjahr geprüft – begrenzt durch den
  Stichtag September 2025, damit keine Runden aus der Zeit davor auftauchen.

### Geändert
- Die Monatsberechnung für Geburtstagsrunden liegt jetzt an einer einzigen
  Stelle im Code. Anzeige, Doppel-Prüfung und Überfälligkeits-Liste rechnen
  dadurch garantiert gleich.

### Geprüft
- `npx tsc --noEmit`: 196 Meldungen, unverändert gegenüber 0.4.9 (alles
  vorbestehende Stil-Meldungen, keine neue Fehlerart).
- `npx expo export --platform android`: erfolgreich durchgelaufen, die App lässt
  sich also weiterhin bauen.
- 21 Rechenbeispiele der Monatsberechnung durchgetestet (alte und neue
  Datenbank-Schreibweise, Dezember/Januar-Wechsel, fehlender Geburtstag,
  nachträglich geändertes Geburtsdatum, 29. Februar in Schalt- und
  Nicht-Schaltjahren) – alle bestanden.

---

## [0.4.9] - 2026-08-15

**Geänderte Dateien**
- `app/(tabs)/stammtisch/[id].tsx`
- `supabase/migrations/2026-08-15_geburtstagsrunden_monat.sql` (neu)

Zweite von drei Etappen aus der Prüfung der Runden-Regeln. Diese Etappe betrifft
den Kern: den Fälligkeitsmonat einer Geburtstagsrunde.

> **Wichtig:** Die App-Änderungen wirken sofort. Die mitgelieferte
> Datenbank-Datei muss **von Hand** im Supabase SQL-Editor ausgeführt werden –
> sie ist in drei Teile gegliedert (erst anschauen, dann Funktion, dann Daten)
> und in der Datei selbst Schritt für Schritt erklärt.

### Behoben
- **Runde konnte doppelt gebucht werden** – Die Prüfung „schon gegeben?" verglich
  an einer Stelle den in der Datenbank gespeicherten Monat, an anderer Stelle den
  Geburtsmonat. Weil beide Werte auseinanderlagen, galt eine bereits gegebene
  Runde weiterhin als offen. Es gibt jetzt **eine** gemeinsame Berechnung, und
  eine gegebene Runde wird zur Sicherheit unter beiden Monatsangaben vermerkt.
- **Löschen konnte die falsche Runde treffen** – In der Moderation wurde aus einem
  Hilfsfeld erraten, ob es sich um eine Geburtstags- oder eine Edle-Spender-Runde
  handelt. Dieses Feld kann aber auch bei einer Geburtstagsrunde leer sein (z. B.
  wenn der zugehörige Stammtisch gelöscht wurde). Im ungünstigsten Fall wurde
  dadurch eine fremde Runde aus der anderen Tabelle gelöscht. Die Rundenart wird
  jetzt beim Laden eindeutig festgehalten.
- **Dieselbe Person stand doppelt in der Liste** – Noch nicht bestätigte Runden
  wurden nicht auf Doppeleinträge geprüft. Stammen zwei Zeilen aus alter und
  neuer Monatsrechnung, wird jetzt nur noch eine angezeigt – bevorzugt die, die
  bereits gegeben wurde.
- **Falsches Symbol in der Rundenliste** – 🎂 und 🥂 richten sich jetzt nach der
  tatsächlichen Herkunft des Eintrags.

### Geändert
- **Runde wird erst am Geburtstag selbst fällig** – Bei einem Stammtisch vor dem
  Geburtstag steht jetzt „Noch nicht fällig" statt eines aktiven Knopfes. Der
  29. Februar zählt in Jahren ohne Schalttag als 28. Februar.
- **Datenbank rechnet mit dem Geburtsmonat** – Die Funktion `seed_birthday_rounds`
  trug die Runde bisher in den Monat **nach** dem Geburtstag ein, die App
  rechnete mit dem Geburtsmonat. Beide sagen jetzt dasselbe.
- **Stichtag vereinheitlicht** – In der Datenbank stand der 01.10.2025, in der App
  der 01.09.2025. Es gilt einheitlich **September 2025**.

### Bekannt, noch offen
- Der Jahreswechsel ist weiterhin nicht korrekt abgedeckt (folgt in Etappe 3).
  *(erledigt in 0.4.10)*

---

## [0.4.8] - 2026-08-15

**Geänderte Dateien**
- `app/(tabs)/hall_of_fame.tsx`
- `app/(tabs)/stats.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/stammtisch/[id].tsx`

Erste von drei Etappen aus der vollständigen Prüfung der Runden-Regeln
(Bericht: `RUNDEN-BERICHT-IST-SOLL.md`, Regelwerk: `RUNDEN-REGELN-PLAN.md`).
Diese Etappe umfasst nur Änderungen ohne Eingriff in die Datenbank.

### Behoben
- **Hall of Fame zählte nur einen Teil der Runden** – Gewertet wurden bisher
  ausschließlich Geburtstagsrunden, und zwar unabhängig davon, ob ein Admin sie
  bestätigt hatte. Jetzt zählen **beide** Rundenarten (Geburtstag und Edle
  Spender) und **nur bestätigte** Runden – dieselbe Regel wie in der Statistik
  und auf der Mitgliedskarte.
- **Hall of Fame übersprang nicht verknüpfte Mitglieder** – Die Wertung lief über
  die Anmelde-Kennung; wer kein eigenes Konto hat, konnte nie auf das Treppchen.
  Gezählt wird jetzt pro Profil.
- **Statistik-Zeitraum richtet sich nach dem Stammtischdatum** – Bisher zählte
  das Datum der Bestätigung durch den Admin. Eine Dezember-Runde, die erst im
  Januar bestätigt wurde, landete dadurch im Folgejahr. Maßgeblich ist jetzt der
  Stammtisch, zu dem die Runde gehört.
- **Startseite zeigte zwischen 00:00 und 02:00 Uhr den Vortag** – Das „heute“ auf
  der Startseite wurde in Weltzeit (UTC) berechnet. In Deutschland galt dadurch
  nachts noch der Vortag, ein gerade vergangener Stammtisch erschien weiter als
  „kommend“. Jetzt wird die Ortszeit des Geräts verwendet.
- **Doppeltes Antippen konnte zwei Runden verbuchen** – Alle vier Buchungswege
  (Geburtstagsrunde verknüpft/unverknüpft, Extra-Runde, Edle-Spender-Runde)
  haben jetzt eine Sperre, die bis zum Abschluss der laufenden Buchung greift.
- **Zeitfenster wurde nur beim Öffnen der Seite berechnet** – Wer die Seite um
  23:50 Uhr öffnete und um 00:05 Uhr tippte, arbeitete mit einem veralteten
  Stand. Das Fenster wird jetzt jede Minute neu bewertet und im Moment des
  Antippens zusätzlich taggenau geprüft.
- **Knopf „Gegeben“ sah außerhalb des Zeitfensters aktiv aus** – Er ist jetzt
  auch sichtbar gesperrt (ausgegraut) statt sich erst nach dem Antippen zu
  melden.
- **Irreführende Meldung für Nicht-Admins** – Beim Verbuchen einer Runde für ein
  unverknüpftes Profil kam zuerst der Hinweis auf das Zeitfenster statt des
  Hinweises, dass nur Admins das dürfen. Reihenfolge korrigiert.
- **Geburtstags-Box verschwand bei einem Ladefehler** – Sie wirkte dadurch wie
  „es gibt keine Runden“. Jetzt bleibt sie sichtbar und zeigt die Fehlermeldung.

### Geändert
- **Edle-Spender-Runde jetzt auch für verknüpfte Mitglieder** – Der 🥂-Knopf in
  der Teilnehmerliste war für Admins nur bei Mitgliedern ohne eigenes Konto
  sichtbar. Er steht jetzt bei allen Teilnehmern zur Verfügung. Der 🎂-Knopf
  bleibt wie bisher auf unverknüpfte Profile beschränkt (verknüpfte Mitglieder
  laufen über die Geburtstags-Box).
- **Rundenart in der Liste „Runden dieses Stammtischs“ erkennbar** – 🎂 bzw. 🥂
  stehen jetzt immer vor dem Namen, nicht nur bei Mitgliedern ohne Profilbild.
- **Überschrift präzisiert** – „Überfällig“ heißt jetzt „Überfällige
  Geburtstagsrunden“, weil ausschließlich Geburtstagsrunden überfällig werden
  können. Der Text bei leerer Liste wurde entsprechend angepasst.

### Bekannt, noch offen
Die schwerwiegendsten Punkte des Berichts betreffen die Datenbank und folgen in
Etappe 2 und 3:
- Die Datenbank berechnet den Fälligkeitsmonat einer Geburtstagsrunde einen
  Monat später als die App. Dadurch können doppelte Einträge und doppelt aktive
  Knöpfe entstehen. *(erledigt in 0.4.9)*
- Der Jahreswechsel ist noch nicht korrekt abgedeckt.
- Die Rundenart wird intern noch über eine Fremd-Kennung abgeleitet, was in
  Einzelfällen zu einem falschen Symbol führen kann. *(erledigt in 0.4.9)*

---

## [0.4.7] - 2026-08-15

**Geänderte Dateien**
- `app/auth-callback.tsx`

### Behoben
- **App blieb nach dem Login endlos auf „Verbinde…" stehen** – Der Zwischenbildschirm brach ab, wenn die Rückkehr-Adresse aus dem Browser nicht ankam (`if (!url) return`). Das passiert regelmäßig, wenn die App beim Zurückkommen aus dem Google-Browser bereits lief. Zusätzlich löst `app/login.tsx` den Anmelde-Code bereits selbst ein; der zweite Einlöse-Versuch im Callback schlug deshalb fehl, weil so ein Code nur einmal gültig ist. In beiden Fällen wurde nie weitergeleitet und es gab keine Notbremse.
  - Fehlende Rückkehr-Adresse führt nicht mehr zum Abbruch.
  - Es wird jetzt **immer** geprüft, ob bereits eine Anmeldung vorliegt, auch wenn nichts eingelöst werden konnte.
  - Neue Notbremse: nach 10 Sekunden ohne Ergebnis geht es zurück zum Login statt endlos zu hängen.
  - Doppelte Navigation wird über ein `doneRef` verhindert.

### Bekannt, noch offen
- Der Supabase-Client in `src/lib/supabase.ts` hat keinen Speicher-Adapter (`@react-native-async-storage/async-storage` ist nicht installiert). Auf Android liegt die Anmeldung deshalb nur im Arbeitsspeicher – nach jedem App-Neustart muss man sich neu anmelden. Behebung erfordert eine neue native Bibliothek und damit einen neuen EAS-Build.

---

## [0.4.6.1] - 2026-03-17

**Geänderte Dateien**
- `app/(tabs)/stammtisch/[id].tsx`

### Behoben
- **Weißer Bildschirm beim Öffnen eines Stammtischs** – `overdueRounds` griff auf `checkGiven` zu, bevor diese Funktion definiert war. Reihenfolge korrigiert (`5f1e965`).
- **Folgefehler derselben Art** – `showBirthdayBox` stand vor `overdueRounds` und lief in denselben Initialisierungsfehler. Ebenfalls nach unten verschoben (`865a620`).
- **Bereits bestätigte Runden wurden weiter als „überfällig" angezeigt** – Die Prüfung berücksichtigte nur offene Runden, nicht die bereits bestätigten. `approvedBirthdayRounds` wird jetzt mit ausgewertet (`1ca49de`).

---

## [0.4.6] - 2026-03-17

**Geänderte Dateien**
- `app/(tabs)/index.tsx`

### Behoben
- **Timezone-Bug: Überfällige Runden nicht sichtbar auf Android-Geräten in UTC+1/+2** – `toISOString()` rechnet intern nach UTC um. Dadurch wurde „April 1, 00:00 Uhr lokalzeit" als „März 31" interpretiert, und Runden mit `due_month = 2026-04-01` wurden nicht geladen. Datum wird jetzt manuell aus lokalen Zeitkomponenten zusammengesetzt.

---

## [0.4.5] - 2026-03-17

**Geänderte Dateien**
- `app.json`
- `eas.json`
- `app/_layout.tsx`
- `package.json`

### Hinzugefügt
- **OTA-Updates (Over-the-Air):** Code-Änderungen werden automatisch beim nächsten App-Start eingespielt – ohne neue APK. Nutzer sehen einen Dialog „Update verfügbar 🎉" und können sofort neu starten oder warten. Technisch: `expo-updates` installiert, `runtimeVersion: { policy: "appVersion" }` und `updates`-Config in `app.json`, `channel`-Felder in `eas.json`, Update-Check-`useEffect` in `app/_layout.tsx`.
- **Einmalige APK erforderlich:** Alle Nutzer müssen einmalig eine neue APK installieren, um OTA zu aktivieren. Danach sind reine Code-Änderungen ohne neue APK möglich.

---

## [0.4.4] - 2026-03-17

**Geänderte Dateien**
- `app/(tabs)/index.tsx`
- `.github/workflows/supabase-ping.yml` (neu)

### Hinzugefügt
- **Überfällige Geburtstags-Runden auf der Startseite:** Im nächsten bevorstehenden Stammtisch-Card werden alle noch offenen Geburtstagsrunden angezeigt – sowohl vergangene (überfällig) als auch die des kommenden Stammtischs. Anzeige: 🎂 Name – fällig seit [Geburtstagsmonat].
- **Supabase Keep-Alive Ping:** GitHub Actions Workflow (`.github/workflows/supabase-ping.yml`) pingt die Datenbank alle 3 Tage automatisch, um das Einschlafen des kostenlosen Supabase-Projekts zu verhindern.

### Behoben
- **Datenbank: Orphan-Rows gelöscht** – 3 verwaiste `birthday_rounds`-Einträge (Martin Maas Okt 2025, Sebastian Bludau Dez 2025, Timo Glantschnig Apr 2026) wurden bereinigt. Diese wurden durch einen Fehler in `seed_birthday_rounds` doppelt angelegt.
- **`seed_birthday_rounds` RPC korrigiert:** Die Datenbankfunktion prüft nun, ob eine Person bereits eine genehmigte Runde im selben Jahr hat, bevor ein neuer Eintrag angelegt wird. Verhindert künftige Orphan-Rows.

---

## [0.4.3] - 2026-03-17

**Geänderte Dateien**
- `app/(tabs)/stammtisch/[id].tsx`

### Hinzugefügt
- **Realtime-Updates für Runden:** Supabase Realtime-Subscriptions auf `birthday_rounds` und `spender_rounds` – Rundenbox und Moderationsbereich aktualisieren sich sofort ohne Reload oder Ausloggen.
- **Spender-Runde für unverknüpfte Profile:** Neue Funktion `giveSpenderRoundForProfile` – Admin kann für Mitglieder ohne App-Account direkt eine Edle-Spender-Runde verbuchen.
- **Zwei Buttons im Teilnehmer-Bereich für Unlinked:** Statt einem generischen 🎁-Button jetzt zwei getrennte Buttons: 🎂 für Geburtstagsrunde und 🥂 für Edle-Spender-Runde.

### Geändert
- **Runden-Box umgebaut:** „Runden dieses Stammtischs” zeigt jetzt alle Geburtstags- (🎂) und Spender-Runden (🥂) gemeinsam an – ausstehend (⏳) und genehmigt (✓) – statt nur Spender-Runden.
- **Geburtstagsrunden-Button nur für Berechtigte:** „🎂 Gegeben”-Button in der Geburtstagsrunden-Box ist nur für Admin/Superuser und die betroffene Person selbst sichtbar (nicht mehr für alle Nutzer).
- **`dueFirstForProfileThisYear` Jahresberechnung korrigiert:** Geburtstag im Dezember + Stammtisch im März führte zu `2026-12-01` (falsch). Fix: Wenn Geburtsmonat > aktueller Monat, wird Vorjahr verwendet. Außerdem: bestehende offene Runde wird wiederverwendet statt neu berechnet.

### Behoben
- **`approvedExtraDonors` schloß Geburtstagsrunden aus:** Filter `first_due_stammtisch_id == null` entfernt; neue `useMemo`-Variablen `approvedAllDonors` und `pendingAllDonors` berücksichtigen alle Rundentypen.

---

## [0.4.2] - 2026-03-16

**Geänderte Dateien**
- `app/(tabs)/stats.tsx`
- `.gitignore`
- `README.md`

### Behoben
- **Statistik – Runden am selben Abend nicht sichtbar:** Zeitzonenfehler in `stats.tsx` behoben. Die Berechnung der oberen Zeitgrenze (`endApprovedExclusive`) nutzte `new Date(lokal morgen).getUTCDate()`, was in Deutschland (UTC+1) noch das heutige UTC-Datum lieferte. Runden die nach Mitternacht UTC eingetragen wurden (also z.B. ab 01:00 Uhr Ortszeit) waren erst am Folgetag in der Statistik sichtbar. Fix: Tag-Addition jetzt direkt in UTC via `Date.UTC()`.

### Sonstiges
- `.gitignore` um Datenbank-Backup-Dateien (`supabase-backup-*.json`) erweitert
- `README.md` mit Supabase Live-Datenbankzugriff-Doku für KI-Entwicklung ergänzt

## [Web-Release] - 2025-16.12

### Hinzugefügt
- **Web Deployment:** Die App ist nun als Web-Version unter `https://stammtisch-app.vercel.app` verfügbar.
- **Vercel Konfiguration:** Datei `vercel.json` hinzugefügt, um Routing-Regeln für Single-Page-Applications (SPA) zu steuern (Rewrite aller Anfragen auf `index.html`).
- **Auth Callback:** Neue Route `app/auth-callback.tsx` erstellt. Diese Seite fängt den OAuth-Redirect von Google/Supabase ab, extrahiert die Session-Tokens (Access/Refresh Token) aus dem URL-Hash und loggt den User ein.
- **Plattform-Weiche:** Die Authentifizierungslogik in `auth-callback.tsx` unterscheidet nun strikt zwischen Web (Hash-Parsing) und Native (Deep Linking), um die Android-Funktionalität nicht zu gefährden.

### Geändert
- **Build Prozess:** `package.json` Script `build:web` wird nun von Vercel genutzt (`expo export -p web`), Output-Directory ist `dist`.
- **Environment Variables:** Anpassung der Supabase-Initialisierung, um `EXPO_PUBLIC_` Variablen für den Web-Build korrekt zu laden.

### Wichtig für Maintainer
- Der Google Login im Web funktioniert **nur** über die Haupt-Domain (`stammtisch-app.vercel.app`), da diese explizit in der Supabase Allow-List steht. Dynamische Preview-URLs von Vercel (z.B. `stammtisch-git-main...app`) funktionieren für den Login nicht!

---
## [0.4.1] - 2025-10-08

**Geänderte Dateien**

* `app/(tabs)/stats.tsx`
* `app/stammtisch/[id].tsx`

### Changed

* **Statistiken**

  * Zählen von **verknüpften *und* unverknüpften** Profilen bei Teilnahmen & Serien.
  * Berücksichtigung **nur vergangener Stammtische inkl. heute** (keine zukünftigen).
  * **Spender-Ranking** zählt **nur bestätigte** Runden nach **Bestätigungsdatum (`approved_at`)** – bis **inkl. heute** (halb-offenes Intervall).
  * **Gleichstände** werden als **geteilte Plätze (#1/#2/#3)** dargestellt.
  * **Automatisches Refresh** beim Öffnen (Focus-Reload).

### Fixed

* **Stammtisch (Einzelseite)**

  * Fehlende `confirmDelete`-Funktion ergänzt.
  * Überfällige/aktuelle Geburtstagsrunden korrekt ermittelt; **bestätigte** Runden erscheinen **nicht mehr** als überfällig.
  * **Zeitfenster-Sperre** wieder aktiv: Runden können nur **am Stammtisch-Tag und am Folgetag** verbucht werden.

---


## [0.4.0] - 2025-09-13
### Added
- **Admin · Einstellungen** (`/admin/settings`)
  - Pflege von **Startbetrag** und **Startdatum** für den Vegas-Counter (Speicherung in `app_settings`).
  - Zentrale **Erfolgs-/Fehler-Rückmeldung** im Headerbereich der Seite.
  - **Admin-Only** und direkt **aus der Profilseite** verlinkt (Admin-Block).
- **Startseite**
  - Vegas-Counter liest **Startbetrag/Startdatum aus der DB** und aktualisiert sich über Focus-Reload/Realtime.
- **Stammtisch (Einzelseite)**
  - **Moderationsbereich** (nur **Admin/SuperUser**): Gegebene Runden **bestätigen** oder **löschen** (persistiert serverseitig).
  - **Unverknüpfte, aber aktive** Mitglieder können als **Teilnehmer** markiert werden.
  - **„Eine Runde geben“**: Vollbreiter Button (rechteckig, abgerundete Ecken). Runden können **nur am Tag des Stammtischs und am Folgetag** gegeben werden.
- **Statistiken**
  - Jahresauswahl als **drei gleichbreite Chips** (aktuelles Jahr + 2 Vorjahre) in einer **Vollbreit-Box**.
  - **Refresh bei Fokus**; Daten werden bewusst **frisch** aus Supabase geladen.
- **Hall of Fame**
  - **Dynamische Schriftgröße** für lange Namen/Mittelnamen, um **Zeilenumbrüche zu vermeiden** (einzeilige Darstellung).

### Changed
- **Stammtisch (Einzelseite) – Layout**
  - Oberer Bereich in **gestapelte Vollbreit-Boxen** umgebaut; **Kalender einklappbar** (Default: eingeklappt).
  - **„Edle Spender“** und **Geburtstagsrunden** oben zeigen **nur bestätigte** Einträge; unbestätigte erscheinen ausschließlich unten im Moderationsbereich (Admin/SU).
  - **Speichern-Button** unter den Textfeldern **innerhalb** der Box; Eingabefelder wieder **volle Breite**.
  - **„Eine Runde geben“** ist **ohne Box** und füllt die **gesamte Breite**.
- **Hall of Fame – Tabelle**
  - Kopfzeilen **ohne Beschriftung**, **Aktiv-Spalte entfernt**, **Auszeichnungs-Spalte entfernt**.
  - **Dauerauftrag-Spalte** auf **minimal mögliche Breite** (Icon-only).
  - **Stabile Keys** für alle Zeilen (inkl. unverknüpfter Profile).
- **Profilseite**
  - Einheitliche **Statusmeldungen** („Profil gespeichert“, „Avatar gespeichert“) an **fester Stelle**.
  - **Admin-Link** zu `/admin/settings` im Admin-Block ergänzt.

### Fixed
- **Android-Emulator**
  - Warnung *„Text strings must be rendered within a `<Text>` component“* in der Hall-of-Fame-Tabelle beseitigt (keine losen Strings/Kommentare im JSX-Baum).
  - Warnung *„Encountered two children with the same key …“* behoben (eindeutige, stabile Keys).
  - UIFrameGuarded/Schwarzbild-Probleme durch bereinigte Komponenten (Picker/JSX) behoben.
- **Admin-Settings / RLS**
  - Speichern des Vegas-Startbetrags/-datums **RLS-sicher** (direkt in `app_settings` mit **RPC-Fallback**).
  - **„Zur Startseite“**-Routing korrigiert.
- **Runden-Moderation**
  - **Bestätigen/Ablehnen** persistiert zuverlässig; Listen aktualisieren sich **sofort** (Focus-Reload/State-Sync).

---

## [0.3.0] - 2025-09-12
### Added
- **Profile / DB & UI**
  - Neue Profil-Felder: `role (member|superuser|admin)`, `is_active (bool)`, `self_check (bool)`,
    `degree (none|dr|prof)`, `middle_name`, `standing_order (bool)`.
  - **Lebensweisheit** (ehem. „Zitat“) mit Limit 500 Zeichen.
  - **Steinmetz Dienstgrad** (Umbenennung von „Titel“ – freier Text).
  - **Schalter**: „Aktiv“ und „Dauerauftrag“.
  - **Verknüpfungsanzeige** inkl. Icon und Text (Google- oder E-Mail/Passwort-Account).
  - **Admin-Links** von der Profilseite zu **/admin/claims** und **/admin/users**.
- **Claim-Workflow**
  - **/claim-profile**: Mitglieder wählen ein vorbereitetes Profil aus.
  - **/admin/claims**: Admin/SuperUser genehmigen/ablehnen; Genehmigung setzt `self_check=true` und `is_active=true` und verknüpft `auth_user_id`.
- **Admin – Benutzerverwaltung** (`/admin/users`)
  - Rollen umstellen (Picker), Profile entkoppeln/löschen, Account + Profil löschen (Edge Function),
    **Account löschen & Profil entkoppeln**, **Profil bearbeiten** (Sprung zum Profil-Edit).
  - Thumbnails nutzen **Google-Avatar-Fallback**, wenn kein Upload existiert.
- **Startseite** (`/(tabs)/index.tsx`)
  - **Vegas Counter**: Kassenstand tagesgenau (Startbetrag 1500 € ab **01.08.2025**,
    +20 €/Monat pro Mitglied mit `standing_order=true`).
  - **Geburtstags-Runden pro Event-Monat**: Geburtstagskinder des Monats mit
    Grad + Vor-/Mittel-/Nachname, Avatar (inkl. Google-Fallback), **Geburtsdatum (de-DE)** und **Alter**.
- **Einzel-Stammtisch** (`/(tabs)/stammtisch/[id].tsx`)
  - Oberer Bereich als **3-Spalten-Layout** (Kalender · Geburtstags-Runden · Edle Spender) + **runder Extra-Runden-Button**.
  - **„Gegeben“** nur möglich, wenn der Nutzer **anwesend** ist (für Geburtstags-, Nachhol- und Extra-Runden).
  - Unterer Bereich: **Ort** & **„Geniale Ideen für die Nachwelt“**, rechts hoher **Speichern**-Button.
  - Teilnehmerliste **einklappbar**.
  - **Löschen**-Button nur für **Admin** sichtbar.
- **Statistiken** (`/(tabs)/stats.tsx`)
  - **Top 5** Teilnehmer (Status `going`), **Top 3** Serien, **Top 5** Spender.
  - Avatare mit Google-Fallback.
- **Hall of Fame** (`/(tabs)/hall_of_fame.tsx`)
  - Zwei Tabellen: **Aktive** und **Passive** Steinmetze, jeweils nach Nachname sortiert.
  - Anzeige: Grad, Vor-/Mittel-/Nachname, Aktiv-Status (Icon), Dauerauftrag (💰), Auszeichnungen und **Thumbnail**.

### Changed
- **Typografie**: Entfernt Custom-Font; Standardisiert auf **Verdana, Arial, system-ui** (fett/normal/klein je nach Stil).
- **Startseite**: „Neu laden“-Button entfernt; Realtime/Broadcast übernimmt Aktualisierung.
- **Benennungen**
  - „Titel“ → **„Steinmetz Dienstgrad“**
  - „Zitat“ → **„Lebensweisheit“**
  - „Notizen“ → **„Geniale Ideen für die Nachwelt“**
- **Zugriffsrechte-Footer** (Profilseite):
  member → „DAU“, superuser → „SuperUser“, admin → „Admin – Wile E. Coyote – Genius“.

### Fixed
- **Geburtstags-Runden**
  - Auf der Startseite: Anzeige der Geburtstage **im Monat des Stammtischs** inkl. Datum (de-DE) und Alter.
  - Auf der Stammtisch-Seite: Liste **„Diesen Monat“** + **„Überfällig“** korrekt; **Gegeben**-Button funktionsfähig und an Anwesenheit gebunden.
- **Layout**
  - 3-Spalten-Container fixiert (keine unendliche Höhenvergrößerung).
  - Spender-Box scrollbar, Extra-Runden-Button runde Form, feste Größen.
  - Kalender auf **⅓ Breite**, mittlere und rechte Box passen sich an.
- **Rollen/Policies**
  - Admin-Checks für Lösch-/Entkoppel-Aktionen korrigiert (Policy/Functions).
- **Avatare**
  - Google-Avatar-Fallback in Stats, Hall of Fame, Admin-Users und überall dort, wo kein Upload vorhanden ist.

---

## [0.2.0] - 2025-09-10
### Added
- **Statistiken** (`app/(tabs)/stats.tsx`):
  - **Top 5** Teilnehmer (aktuelles Jahr; `stammtisch_participants.status = 'going'`)
  - **Top 3** längste Serien in Folge (über chronologisch sortierte Stammtisch-Events)
  - **Top 5** edle Spender (aktuelles Jahr; `birthday_rounds.settled_at`)
  - Anzeige von Namen & Thumbnails aus `profiles` / Bucket `avatars`
- **Hall of Fame** (`app/(tabs)/hall_of_fame.tsx`):
  - **Alle Mitglieder alphabetisch** nach Nachname (deutsche Kollation)
  - **Auszeichnungen** als Emojis inkl. **Platzierung**:
    🏆 Teilnahmen, 🔥 Serien, 🍻 Spender

### Changed
- **Navigation**:
  - `app/(tabs)/_layout.tsx`: Tabs **`stats`** und **`hall_of_fame`** registriert.
  - `src/components/BottomNav.tsx`: Buttons **Statistiken** (`/stats`) und **Hall of Fame** (`/hall_of_fame`) aktiviert.
- **README**:
  - Abschnitt **Dev-Server & Arbeitsweise** ergänzt (Expo Go vs. Dev Client, Cache-Reset, Tipps).
  - Neue Seiten dokumentiert (Stats & Hall of Fame), Troubleshooting erweitert.
- Kleinere UI-Anpassungen: konsistente Karten/Abstände, Avatar-Darstellung.

### Fixed
- Schwarzer Bildschirm durch gemischte Web/RN-Imports:
  Stats/Hall-of-Fame als **reine React-Native-Screens** umgesetzt.
- Stabileres Routing: keine Navigation mehr auf nicht existierende Routen.

---

## [0.1.0] - 2025-09-09
### Added
- **Startseite**: Banner, Profil-Karte (Avatar/Name), Listen *Bevorstehend* & *Frühere*, Button „Neu laden“.
- **Neuer Stammtisch**: Formular mit interaktivem Kalender; markiert immer den **2. Freitag** eines Monats; Vorauswahl = nächster 2. Freitag.
- **Profil**: Felder (Vorname, Nachname, Titel, Geburtstag, Zitat); **Avatar** via Galerie/Kamera → Upload → Speicherung in `profiles.avatar_url`.
- **Login**: E-Mail/Passwort **und** Google OAuth mit Deep-Link (`stammtisch://auth-callback`).
- **Bottom-Navigation** (Startseite / Neuer Stammtisch / Statistiken / Hall of Fame) mit PNG-Icons.
- **Theme**: zentrales Farbschema (Schwarz/Gold/Rot/Weiß), **Broadway**-Font für Überschriften, System-Sans für Fließtext.
- **Scrollbars (Web)**: goldener Thumb, dunkler Track (`global.css`).

### Changed
- Seiten-Layouts so angepasst, dass die **Bottom-Nav** nie überlappt (ScrollView mit `marginBottom` + eigene Listen-Viewport-Höhen).
- Startseite lädt Daten via **Realtime** und **Broadcast**.

### Fixed
- Font-Ladeproblem („Unable to resolve module … .TTF“) gelöst (korrekte Pfade/Schreibweise, Cache-Reset).
- OAuth-Redirect von `localhost` auf **Deep Link** + Supabase Auth-URL-Konfiguration.

---

## Pflege-Hinweise
- **Version bump**: In `app.json` bei produktiven Releases anheben.
- **Tagging (optional)**:
  ```bash
  git tag v0.4.0
  git push --tags
