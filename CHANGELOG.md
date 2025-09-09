# Changelog
Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und die Versionsnummern an [SemVer](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- Statistiken-Seite (KPIs, Charts)
- Hall-of-Fame-Seite
- App-Store-Release-Profile (Production-Builds, iOS)

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
  git tag v0.1.0
  git push --tags
