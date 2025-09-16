# Changelog
Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und die Versionsnummern an [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- App Layout Feinschliff (Abstände, responsives Verhalten, Accessibility Labels)
- Wichtige Tools: Stein–Schere–Papier, Münzwurf und Vegas Counter „Schwarz/Rot“ mit Max-Counter für Stats
- Google Auth-Login Display überprüfen/vereinheitlichen

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
