# Changelog
Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und die Versionsnummern an [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- App-Store-Release-Profile (Production-Builds, iOS)
- (Optional) Rankings als DB-Views/RPCs zur Performance-Optimierung
- (Optional) A–Z-Trenner und Suche/Filter in der Hall of Fame

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
  - **Auszeichnungen** als Emojis inkl. **Platzierung** und **Accessibility-Label**:
    - 🏆 Dauerbrenner (Top-Teilnahmen)
    - 🔥 Serien-Junkie (Top-Streaks)
    - 🍻 Edler Spender (Top-Spender)

### Changed
- **Navigation**:
  - `app/(tabs)/_layout.tsx`: Tabs **`stats`** und **`hall_of_fame`** registriert.
  - `src/components/BottomNav.tsx`: Buttons **Statistiken** (`/stats`) und **Hall of Fame** (`/hall_of_fame`) aktiviert.
- **README**:
  - Abschnitt **Dev-Server & Arbeitsweise** ergänzt (Expo Go vs. Dev Client, Cache-Reset, Tipps).
  - Neue Seiten dokumentiert (Stats & Hall of Fame), Troubleshooting erweitert.
- Kleinere UI-Anpassungen: konsistente Karten/Abstände, Avatar-Darstellung.

### Fixed
- Schwarzer Bildschirm durch gemischte Web/RN-Imports: Stats/Hall-of-Fame als **reine React-Native-Screens** umgesetzt.
- Stabileres Routing: keine Navigation mehr auf nicht existierende Routen.

---

## [0.1.0] - 2025-09-09
### Added
- **Startseite**: Banner, Profil-Karte (Avatar/Name), Listen *Bevorstehend* & *Frühere* (jeweils scrollbar), Button „Neu laden“.
- **Neuer Stammtisch**: Formular mit interaktivem Kalender; markiert immer den **2. Freitag** eines Monats; Vorauswahl = nächster 2. Freitag.
- **Profil**: Felder (Vorname, Nachname, Titel, Geburtstag, Zitat); **Avatar** via Galerie/Kamera → Upload nach Supabase Storage → Speicherung in `profiles.avatar_url`.
- **Login**: E-Mail/Passwort **und** Google OAuth mit Deep-Link (`stammtisch://auth-callback`) – kein `localhost`.
- **Bottom-Navigation** (Startseite / Neuer Stammtisch / Statistiken / Hall of Fame) mit responsiven PNG-Icons.
- **Theme**: zentrales Farbschema (Schwarz/Gold/Rot/Weiß), **Broadway**-Font für Überschriften, System-Sans für Fließtext.
- **Scrollbars (Web)**: goldener Thumb, dunkler Track (global.css).

### Changed
- Seiten-Layouts so angepasst, dass die **Bottom-Nav** nie überlappt (ScrollView mit `marginBottom` + eigene Listen-Viewport-Höhen).
- Startseite lädt Daten via `useFocusEffect`, **Realtime** (Postgres Changes) und **Broadcast** (`stammtisch-saved`) für sofortige Aktualisierung.

### Fixed
- Font-Ladeproblem („Unable to resolve module … .TTF“) durch korrekte Pfade/Schreibweise (`BROADW.ttf`) und Cache-Reset.
- OAuth-Redirect von `localhost` auf **Deep Link** + Supabase Auth-URL-Konfiguration.

---

## Pflege-Hinweise
- **Version bump**: In `app.json` bei produktiven Releases sinnvoll anheben.
- **Tagging (optional)**:
  ```bash
  git tag v0.2.0
  git push --tags
