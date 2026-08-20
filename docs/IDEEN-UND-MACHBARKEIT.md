# MetzÄpp – Ideen, Machbarkeit und Aufwand

**Stand: 20.08.2026** · Merkzettel, kein Auftrag. Nichts davon ist umgesetzt.

Grundlage: Repo-Stand `32e45a8` auf `main`, CHANGELOG bis 0.4.16, offenes GitHub-Issue #1,
die im CHANGELOG unter „Geplant" vermerkten Punkte (u. a. Push-Nachrichten und Strafrunden
aus der Sitzung vom 16.08.).

**Aufwandsskala:** XS = unter 1 Stunde · S = 1–3 Stunden · M = halber bis ganzer Tag · L = mehrere Tage

---

## Die kurze Antwort auf deine drei Fragen

**1. Was heißt „silent update"?**
Bei euch gibt es vier Auslieferungswege, und nur zwei davon sind wirklich lautlos.
Web (Vercel) und OTA (`eas update`) erreichen alle ohne Zutun. Ein neuer APK erreicht
niemanden von selbst – jeder muss ihn von Hand installieren. Datenbankänderungen sind
unsichtbar, treffen aber **alle App-Stände gleichzeitig**, auch die alten.

**2. Was kann ich im Hintergrund ausrollen?**
Alles, was JavaScript/TypeScript, Texte, Farben, Bildschirme, Rechenregeln, eingebundene
Bilder und Sounds ist – also rund 95 % eurer Änderungen. Nicht ausrollbar: alles Native
(neue Bibliothek, SDK-Sprung, Icon, App-Name, Berechtigungen, der `updates`-Block in
`app.json`).

**3. Kann ich für große Updates nachfragen und eine Markierung anzeigen?**
Ja – die Markierung („Neue Version verfügbar") und eine Meldung **nach** dem Einspielen
sind reines JavaScript und selbst per OTA nachlieferbar, ohne neuen APK. Ein echtes
„Darf ich?" **vor** dem Einspielen braucht einmalig einen neuen APK, weil die automatische
Übernahme in `app.json` abgeschaltet werden muss. Details unter U1–U7.

---

## ⚠ Zuerst: zwei Funde, die vor allen Ideen kommen

Das Repository ist **öffentlich**. Zwei Dateien darin gehören da nicht hin.

### S1 · Zugangsschlüssel liegen im öffentlichen Repo
`.claude/settings.local.json` ist versioniert (seit `15e1752` und früher) und enthält in den
Freigabe-Einträgen den vollständigen **Supabase Service-Role-Key** und ein
**Supabase-Zugriffstoken (`sbp_…`)`** im Klartext. Der Service-Role-Key umgeht sämtliche
RLS-Regeln – wer ihn hat, kann die komplette Datenbank lesen, ändern und löschen.

Zu tun: beide Schlüssel in Supabase neu ausstellen (rotieren), Datei aus der Versionierung
nehmen, `.claude/settings.local.json` in `.gitignore` eintragen.
**Aufwand XS · Machbarkeit hoch · dringend**

### S2 · Echte Personendaten im öffentlichen Repo
`supabase_full_dump.sql` (374 KB) ist ein vollständiger Datenbankabzug und enthält
`auth.users` (E-Mail-Adressen, Passwort-Hashes), `auth.refresh_tokens`, `auth.sessions`,
`auth.audit_log_entries` mit Klarnamen und Anmeldeverläufen sowie `public.profiles` mit
Namen und Geburtsdaten aller Mitglieder.

Zu tun: Datei entfernen, Verlauf bereinigen (die Datei bleibt sonst über die Git-Historie
abrufbar), in Supabase alle Sitzungen ungültig machen. Das sind Daten Dritter, also auch
eine Frage von Anstand und Datenschutz, nicht nur von Technik.
**Aufwand S (der Verlaufs-Rückbau kostet die Zeit) · Machbarkeit hoch · dringend**

### S3 · `tree.txt` (4 MB) im Repo
Harmlos, aber unnötiger Ballast. Bei Gelegenheit mit S2 zusammen ausräumen.
**Aufwand XS**

---

## Teil 1 · Die vier Auslieferungswege

| Weg | Was darüber geht | Erreicht wen | Lautlos? |
|---|---|---|---|
| **Web (Vercel)** | alles, was die Web-App betrifft | jeden beim nächsten Laden der Seite | ja, vollständig |
| **OTA (`eas update`)** | JS/TS, Bildschirme, Logik, Texte, Farben, Navigation, per `require` eingebundene Bilder/Sounds/Schriften, Supabase-Abfragen | jeden mit installiertem APK, beim nächsten Start | ja – heute nur durch den eigenen Dialog unterbrochen |
| **Neuer APK (`eas build`)** | neue native Bibliothek, Expo-SDK-Sprung, Icon, Splash, App-Name, Berechtigungen, `scheme`, `plugins`, der `updates`-Block, `runtimeVersion` | **niemanden von selbst** – Link verschicken, jeder installiert von Hand | nein |
| **Datenbank (Supabase)** | Migrationen, RLS-Regeln, RPC-Funktionen, Daten | alle sofort | unsichtbar – aber trifft **auch alte App-Stände** |

**Die wichtigste Regel daraus:** Weil ein neuer APK nicht von allein ankommt, laufen bei
euch dauerhaft verschiedene App-Stände nebeneinander. Datenbankänderungen müssen deshalb
immer abwärtskompatibel sein: erst Spalte hinzufügen → dann App per OTA umstellen → erst
viel später die alte Spalte entfernen. Nie in einem Schritt.

---

## Teil 2 · Was heute tatsächlich passiert

`app.json` steht auf `"checkAutomatically": "ON_LOAD"`. Das heißt: Beim App-Start wird
ohnehin im Hintergrund geprüft und geladen, und das Geladene wird beim **nächsten** Start
automatisch aktiv.

Zusätzlich prüft `app/_layout.tsx` noch einmal selbst und zeigt bei **jedem** Update
denselben Dialog: „Update verfügbar 🎉 … Jetzt neu starten?"

Daraus folgen drei Dinge:

- Ein Tippfehler-Fix fragt genauso laut nach wie ein großer Umbau. Es gibt keine Abstufung.
- Wer „Später" tippt, bekommt das Update trotzdem beim nächsten Start – es ist ja schon
  heruntergeladen. Der Dialog ist also eher Höflichkeitsgeste als echte Steuerung.
- „Lautlos" ist heute schon fast der Zustand. Es fehlt nicht die Technik, es fehlt die
  Entscheidung, wann man den Mund aufmacht.

---

## Teil 3 · Update-Stufen: Vorschlag für die Meldungs-Logik

| Stufe | Beispiel | Verhalten der App |
|---|---|---|
| **Patch** (0.4.16 → 0.4.17) | Tippfehler, Farbe, kleiner Fix | lautlos. Keine Meldung. Nur ein Eintrag unter „Was ist neu" |
| **Minor** (0.4 → 0.5) | neue Funktion, neuer Bildschirm | lautlos einspielen, danach goldener Punkt an der Navigation + einmalige Karte „Neu in dieser Version" |
| **Major** (0.x → 1.0) | Umbau, geänderte Bedienung | Meldung beim Start: „Version 1.0 ist da" mit „Jetzt" / „Später erinnern", Markierung bleibt bis erledigt |
| **Pflicht** | Datenbank-Umstellung, Sicherheitsfix | Sperrbildschirm „Bitte jetzt aktualisieren", kein „Später" |
| **Neuer APK nötig** | native Änderung | Karte mit Erklärung und Download-Link – der einzige Weg, wie die Leute davon überhaupt erfahren |

### Wie kommt die Stufe in die App?

**Weg A – über Supabase (empfohlen).** Ein Datensatz in `app_settings`, etwa
`latest_version`, `update_level`, `update_note`, `min_version`, `apk_url`. Die App liest ihn
beim Start und entscheidet danach.
*Vorteile:* gilt auch für die Web-App, jederzeit änderbar ohne neues Update, der Meldungstext
lässt sich nachträglich korrigieren oder zurückziehen, Pflicht-Updates sind über
`min_version` möglich. *Nachteil:* ein zusätzlicher Netzwerkaufruf beim Start.

**Weg B – Metadaten im Update selbst** (`extra` in `app.json`, kommt mit dem Update mit).
Kein Extra-Aufruf, aber nach dem Veröffentlichen nicht mehr änderbar. Und eine Änderung an
`app.json` ist heikel, siehe V5.

**Weg C – GitHub Releases** (wird heute schon für die Info-Zeile benutzt). Kostenlos, aber
60 Aufrufe pro Stunde und IP, und die Tags sagen aktuell nichts über die installierte
Version aus.

→ **Empfehlung: Weg A.** Die Datenbank ist ohnehin da, und man behält die Kontrolle auch
nach dem Veröffentlichen.

### Die Ideen einzeln

- **U1 · Dialog nach Stufen statt bei jedem Update** – der bestehende Alert in `_layout.tsx`
  wird zur Weiche. *OTA · S–M · hoch*
- **U2 · Steuerung über `app_settings`** – Tabelle, Lesen beim Start, Auswertung.
  Grundlage für U1, U3, U4, U6, U7. *OTA + DB · M · hoch*
- **U3 · Markierung „Neue Version verfügbar"** – goldener Punkt an der Navigation, Karte auf
  dem Startbildschirm. *OTA · S · hoch*
- **U4 · „Was ist neu"-Bildschirm** – gespeist aus dem CHANGELOG oder aus `update_note`.
  *OTA · S–M · hoch*
- **U5 · Echtes Nachfragen vor dem Einspielen** – braucht `"checkAutomatically": "NEVER"` in
  `app.json`, damit die App nicht von selbst übernimmt. Das ist ein Build-Wert →
  **einmalig neuer APK nötig**. Danach steuert der Code alles selbst.
  *Neuer APK · M · mittel (nur wegen der Verteilung)*
- **U6 · Pflicht-Update-Sperre über `min_version`** – das Sicherheitsnetz für den Tag, an dem
  eine Datenbank-Umstellung alte App-Stände kaputtmachen würde. *OTA + DB · S · hoch*
- **U7 · Karte „Neue App installieren" mit Download-Link** – löst das eigentliche Problem:
  heute erfährt niemand von einem neuen APK, außer du schreibst es in die Gruppe.
  Wichtig: **vor** dem nächsten Sammelbau ausrollen, sonst nützt sie beim Sammelbau nichts.
  *OTA + DB · S · hoch*
- **U8 · Notfall-Rückbau dokumentieren** – wie man ein fehlerhaftes Update zurückholt
  (`eas update:rollback` bzw. den alten Stand erneut veröffentlichen), im README festhalten.
  Kostet fast nichts und ist genau dann Gold wert, wenn man nicht nachdenken kann.
  *Doku · XS · hoch*
- **U9 · Auch beim Zurückholen aus dem Hintergrund prüfen** – Handys starten Apps selten
  wirklich neu. Prüfung zusätzlich an `AppState` hängen. *OTA · XS–S · hoch*

---

## Teil 4 · Versionierung: es gibt aktuell vier Wahrheiten

| Quelle | Wert |
|---|---|
| `app.json` → `version` | `1.0.0` |
| `package.json` → `version` | `1.0.0` |
| CHANGELOG (die gepflegte Nummer) | `0.4.16` |
| Git-Tags / GitHub-Releases | `alpha-versions`, `beta` (Januar 2026) |

Und der Startbildschirm zeigt über `fetchGitHubStats()` den **letzten GitHub-Release-Tag**,
also aktuell „beta" – eine Nummer, die mit der installierten App nichts zu tun hat.

- **V1 · Eine Nummer statt vier** – eine Anzeige-Version in `src/version.ts`, synchron mit dem
  CHANGELOG gepflegt. *OTA · XS · hoch*
- **V2 · Installierte Version anzeigen statt GitHub-Tag** – `expo-constants` und
  `expo-updates` sind beide schon installiert, damit lässt sich die tatsächlich laufende
  Version samt Update-Stand und Datum anzeigen. Nebenwirkung: drei GitHub-Aufrufe beim Start
  fallen weg, der Startbildschirm wird schneller und läuft nicht mehr ins Rate-Limit.
  *OTA · S · hoch*
- **V3 · Tag und Release je Version, automatisch aus dem CHANGELOG** – GitHub Actions.
  *CI · S · hoch*
- **V4 · `runtimeVersion` entkoppeln** – von `policy: appVersion` auf einen festen Wert
  umstellen, damit die Anzeige-Version frei wählbar wird. Nur zusammen mit einem Build.
  *Neuer APK · XS im Code · mittel*

### V5 · Die Falle, die man sich merken muss

`runtimeVersion` hängt heute an `version` aus `app.json` (`1.0.0`). Zwei Konsequenzen:

1. **Ändere `version` in `app.json` niemals nebenbei.** Sobald sie auf z. B. `0.4.17` steht,
   passt die `runtimeVersion` nicht mehr zu den installierten APKs – die bekommen dann
   **gar keine OTA-Updates mehr**. Deshalb V1 über eine eigene Datei und nicht über `app.json`.
2. **Umgekehrt genauso gefährlich:** Baust du einen neuen APK mit einer neuen nativen
   Bibliothek (z. B. für Push), bleibt `runtimeVersion` bei `1.0.0` – und ein OTA-Update, das
   die neue Bibliothek benutzt, landet auch auf den **alten** APKs, wo es sie nicht gibt.
   Ergebnis: Absturz. Regel: **Bei nativen Änderungen die Version hochziehen**, damit alte
   und neue APKs getrennte Update-Ketten haben.

---

## Teil 5 · Push-Nachrichten (Idee aus der Sitzung vom 16.08.)

Im CHANGELOG steht dazu bisher nur: *„noch nicht besprochen, welche Anlässe und an wen"*.
Hier die technische Einordnung dazu.

### Der Knackpunkt vorweg
`expo-notifications` ist **nicht installiert**. Push braucht ein natives Modul, also einen
neuen APK – und der erreicht bei eurer Verteilung per Link niemanden von selbst. Push ist
damit nicht die billigste Idee auf der Liste, sondern eine der teuersten. Nicht wegen des
Codes, sondern wegen der Verteilung.

### Bausteine
- **P1 · Push-Grundlage** – `expo-notifications`, Berechtigung abfragen (Android 13+ fragt
  ausdrücklich nach), Push-Token je Person in einer neuen Tabelle `push_tokens` ablegen.
  *Neuer APK · L · mittel*
- **P2 · Versandseite** – Supabase Edge Function, die an den Expo-Push-Dienst schickt, dazu
  ein Zeitplan (pg_cron oder GitHub Actions, letzteres läuft ja schon für den Wach-Ping).
  *Server · M · hoch*
- **P3 · Anlass-Katalog und Einstellungen je Person** – jeder wählt ab, was er nicht will.
  *OTA + DB · M · hoch (sobald P1 steht)*
- **P4 · Web-Push** – ist ein völlig anderer Mechanismus (Service Worker + VAPID), nicht
  „Push für die App, kostenlos dazu". *L · gering–mittel · eher zurückstellen*

### Mögliche Anlässe (zum Aussuchen, nicht als Vorschlag zum Alles-Machen)
- Stammtisch in 3 Tagen · Stammtisch heute
- Geburtstagsrunde ist fällig (an die Person selbst)
- Deine Runde wurde bestätigt / abgelehnt
- Neue Verknüpfungsanfrage (nur Admin und Superuser)
- Neuer Stammtisch angelegt oder Ort geändert
- Zu-/Absagen-Stand am Vortag (nur an den, der den Tisch reserviert)
- Neue App-Version verfügbar (verzahnt sich mit U3/U7)

### Offene Fragen, die vor der Umsetzung geklärt sein müssen
Wer darf senden – nur Admin, oder löst die Datenbank selbst aus? Welche Anlässe sind Pflicht
und welche abwählbar? Gibt es stille Zeiten (nachts)? Und was passiert mit den **unverknüpften
Profilen** – die haben kein Konto und damit auch kein Handy im System.

### Die billigen Alternativen – 80 % des Nutzens, kein neuer APK
- **P6 · „Termin in meinen Kalender"** – ein Link, der den Stammtisch im Kalender des Handys
  anlegt. Die Erinnerung übernimmt dann das Handy selbst. `expo-web-browser` ist bereits
  installiert, es braucht nichts Natives. *OTA · XS–S · hoch* → **bestes Verhältnis auf der
  ganzen Liste**
- **P7 · „Erinnerung teilen"** – Knopf, der eine fertig formulierte WhatsApp-Nachricht mit
  Datum, Ort und Zusagen-Stand öffnet. Trifft genau euren tatsächlichen Kanal.
  *OTA · XS · hoch*
- **P5 · In-App-Benachrichtigungszentrale** – Glocke mit Punkt, dahinter eine Liste
  („Deine Runde ist fällig", „Ort geändert"). Kein Push, aber jeder sieht es beim nächsten
  Öffnen. *OTA + DB · M · hoch*
- **P8 · E-Mail-Erinnerung** über eine Supabase Edge Function. Erreicht auch die, die die App
  gar nicht installiert haben. *Server · M · hoch*

---

## Teil 6 · Strafrunden (Idee aus der Sitzung vom 16.08.)

Technisch ist das der einfachste Teil: `spender_rounds` gibt es bereits, eine Strafrunde ist
dasselbe Muster mit anderem Auslöser und anderem Symbol. Geschätzt **M–L**, Machbarkeit hoch –
**sobald die Regeln feststehen**. Der Aufwand liegt nicht im Code, sondern in der Einigung.

Zu klären:
- Wodurch entsteht eine Strafrunde? (zu späte Absage, Nichterscheinen trotz Zusage,
  Zuspätkommen, Handy auf dem Tisch, …)
- Wer verhängt sie – Admin, Mehrheitsbeschluss, oder die App automatisch?
- Verjährt sie? Zählt sie in die Jahresstatistik? Eigenes Symbol neben 🎂?
- Wie verhält sie sich zu Geburtstags- und Urlaubsrunden? (Urlaubsrunden sind bisher
  ebenfalls nur als Begriff vorhanden, nicht als Funktion.)

---

## Teil 7 · Weitere offene Ideen zur App

- **A1 · Anmeldung überlebt den Neustart** – der Supabase-Client hat keinen Speicher-Adapter
  (`@react-native-async-storage/async-storage` fehlt), deshalb muss man sich auf Android nach
  jedem App-Neustart neu anmelden. Das ist der größte Alltagsärger in der ganzen App.
  Braucht eine native Bibliothek → **neuer APK**. *S im Code, gebunden an einen Build · hoch*
- **A2 · Google-Login zeigt den Datenbankpfad als Empfänger** (Issue #1) – das ist eine
  Einstellungssache in Supabase bzw. der Google-Cloud-Konsole, kein App-Code.
  *Konfiguration · S · hoch*
- **A3 · Layout-Feinschliff** – Abstände, responsives Verhalten, Accessibility-Labels.
  *OTA · M · hoch*
- **A4 · Spiele: Stein–Schere–Papier, Münzwurf.** *OTA · S je Spiel · hoch*
- **A5 · Vegas-Counter „Schwarz/Rot" mit Max-Counter für die Statistik.** *OTA + DB · M · hoch*
- **A7 · Typprüfung und Lint bei jedem Push (GitHub Actions)** – `tsconfig` steht bereits auf
  `strict`, es fehlt nur die automatische Prüfung. **Begründung aus eurer eigenen Historie:**
  0.4.6.1 und die Fixes davor waren mehrfach weiße Bildschirme durch
  Reihenfolge-/Initialisierungsfehler (`overdueRounds` vor `checkGiven`, `showBirthdayBox`
  vor `overdueRounds`). Genau die Sorte Fehler findet `tsc --noEmit` in Sekunden.
  *CI · XS–S · hoch* → **bestes Verhältnis nach P6**
- **A8 · Zweistufiges Ausrollen** – heute geht jedes `eas update --channel preview` sofort an
  alle. Erst auf ein Testgerät, dann an alle, kostet fast nichts und fängt genau die
  Weiß-Bildschirm-Fälle ab, bevor sie beim Stammtisch auffallen. *Prozess · S · hoch*
- **A9 · Fehler sichtbar machen** – wenn bei jemandem der Bildschirm weiß bleibt, erfährst du
  es heute nur per Zuruf. Eine ErrorBoundary, die den Fehler in eine Supabase-Tabelle
  schreibt, ist reines JavaScript und damit OTA-fähig (Sentry wäre nativ und bräuchte einen
  Build). *OTA + DB · M · hoch*
- **A6 · Backup automatisieren** – `npm run backup` gibt es, es läuft nur von Hand. Achtung:
  Das Ergebnis enthält echte Personendaten und darf **nicht** im öffentlichen Repo landen
  (siehe S2). Also verschlüsselt und außerhalb des Repos ablegen. *CI · M · mittel*

---

## Teil 8 · Vorgeschlagene Reihenfolge

Das ist die einzige echte Abfolge in diesem Dokument – der Rest ist eine Auswahl.

1. **Sofort:** S1 und S2. Schlüssel rotieren, Personendaten aus dem öffentlichen Repo.
2. **Ohne Build, schnell:** A7 (Prüfung in CI), V1 und V2 (endlich die richtige Version
   anzeigen), U8 (Rückbau dokumentieren). Zusammen etwa ein halber Tag, danach ist die
   Grundlage stabil.
3. **Ohne Build, die Update-Steuerung:** U2 → U1 → U3 → U4 → U6 → U7. Das ist die Antwort auf
   deine Ausgangsfrage, komplett per OTA lieferbar.
4. **Ohne Build, billige Erinnerungen:** P6, P7, danach P5. Bevor irgendwer über Push redet.
5. **Der Sammelbau** – ein einziger neuer APK, in dem alles Native zusammenkommt:
   A1 (Anmeldung bleibt) + P1 (Push) + U5 (Nachfragen vor dem Einspielen) + V4
   (runtimeVersion entkoppeln). Ein neuer APK kostet dich einmal Überzeugungsarbeit in der
   Gruppe – also alles bündeln, was nativ ist, und **vorher** U7 ausrollen, damit die Karte in
   der App auf den Download hinweist.
6. **Wenn die Regeln stehen:** Strafrunden, Urlaubsrunden.

---

## Gesamtübersicht

| ID | Idee | Weg | Aufwand | Machbarkeit |
|---|---|---|---|---|
| S1 | Schlüssel aus dem öffentlichen Repo + rotieren | Repo/Supabase | XS | hoch · **dringend** |
| S2 | Datenbankabzug mit Personendaten entfernen | Repo | S | hoch · **dringend** |
| S3 | `tree.txt` ausräumen | Repo | XS | hoch |
| U1 | Dialog nach Stufen statt bei jedem Update | OTA | S–M | hoch |
| U2 | Update-Steuerung über `app_settings` | OTA + DB | M | hoch |
| U3 | Markierung „Neue Version verfügbar" | OTA | S | hoch |
| U4 | „Was ist neu"-Bildschirm | OTA | S–M | hoch |
| U5 | Nachfragen **vor** dem Einspielen | Neuer APK | M | mittel |
| U6 | Pflicht-Update über `min_version` | OTA + DB | S | hoch |
| U7 | Karte „Neue App installieren" mit Link | OTA + DB | S | hoch |
| U8 | Notfall-Rückbau dokumentieren | Doku | XS | hoch |
| U9 | Prüfung auch beim Zurückholen aus dem Hintergrund | OTA | XS–S | hoch |
| V1 | Eine Versionsnummer statt vier | OTA | XS | hoch |
| V2 | Installierte Version statt GitHub-Tag anzeigen | OTA | S | hoch |
| V3 | Tag + Release automatisch aus dem CHANGELOG | CI | S | hoch |
| V4 | `runtimeVersion` entkoppeln | Neuer APK | XS | mittel |
| V5 | Merksatz: `version` in `app.json` nie nebenbei ändern | Doku | XS | hoch |
| P1 | Push-Grundlage (`expo-notifications`, Token) | Neuer APK | L | mittel |
| P2 | Versand über Edge Function + Zeitplan | Server | M | hoch |
| P3 | Anlass-Katalog + Einstellungen je Person | OTA + DB | M | hoch |
| P4 | Web-Push | Web | L | gering–mittel |
| P5 | In-App-Benachrichtigungszentrale (Glocke) | OTA + DB | M | hoch |
| P6 | „Termin in meinen Kalender" | OTA | XS–S | hoch |
| P7 | „Erinnerung teilen" per WhatsApp-Link | OTA | XS | hoch |
| P8 | E-Mail-Erinnerung | Server | M | hoch |
| R1 | Strafrunden (Regeln zuerst klären) | OTA + DB | M–L | hoch, sobald Regeln stehen |
| R2 | Urlaubsrunden (bisher nur ein Begriff) | OTA + DB | M | offen |
| A1 | Anmeldung überlebt den Neustart | Neuer APK | S | hoch |
| A2 | Google-Login: Anzeigename (Issue #1) | Konfiguration | S | hoch |
| A3 | Layout-Feinschliff + Accessibility | OTA | M | hoch |
| A4 | Stein–Schere–Papier, Münzwurf | OTA | S | hoch |
| A5 | Vegas-Counter „Schwarz/Rot" + Max-Counter | OTA + DB | M | hoch |
| A6 | Backup automatisieren (nicht ins Repo!) | CI | M | mittel |
| A7 | Typprüfung + Lint in CI | CI | XS–S | hoch |
| A8 | Zweistufiges Ausrollen (erst Testgerät) | Prozess | S | hoch |
| A9 | Fehler sichtbar machen (ErrorBoundary → Supabase) | OTA + DB | M | hoch |
