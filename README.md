# Steinmetz Stammtisch App

Eine kleine mobile App (Android/iOS/Web) mit **Expo + React Native** und **Supabase** (Auth, DB & Storage).  
Ziel: Stammtische anlegen/anzeigen, Benutzerprofile pflegen (inkl. Avatar), Anmeldung via **Google** oder **E-Mail/Passwort**.

---

## Inhaltsverzeichnis

1. [Was macht die App?](#was-macht-die-app)
2. [Voraussetzungen & Versionen](#voraussetzungen--versionen)
3. [Schnellstart](#schnellstart)
4. [Dev-Server & Arbeitsweise](#dev-server--arbeitsweise)
5. [Konfiguration (Supabase, OAuth, Deep-Link)](#konfiguration-supabase-oauth-deep-link)
6. [Entwicklung (Web & Android-Emulator)](#entwicklung-web--android-emulator)
7. [Builds (APK mit EAS)](#builds-apk-mit-eas)
8. [Projektstruktur & Dateien](#projektstruktur--dateien)
9. [Neue Seiten: Statistiken & Hall of Fame](#neue-seiten-statistiken--hall-of-fame)
10. [Datenbank & Storage](#datenbank--storage)
11. [Theme (Farben & Schriftarten)](#theme-farben--schriftarten)
12. [Weiterentwickeln (Workflow & Git)](#weiterentwickeln-workflow--git)
13. [Troubleshooting](#troubleshooting)
14. [Sicherheitshinweise](#sicherheitshinweise)
15. [Nützliche Befehle (Spickzettel)](#nützliche-befehle-spickzettel)

---

## Was macht die App?

- **Stammtische** erstellen, anzeigen und verwalten
- **Profile** mit Avatar
- **Teilnahme** („going/maybe/declined“)
- **Login** via Google oder E-Mail/Passwort
- **Neu**:
  - **Statistiken**: Top-Teilnehmer, längste Serien, edle Spender
  - **Hall of Fame**: alle Mitglieder alphabetisch, inkl. Auszeichnungen (Emojis mit Platzierung)

---

## Voraussetzungen & Versionen

- **Node.js** (inkl. npm)
- **Git**
- **Expo CLI** via `npx expo …`
- **EAS CLI** (`npm i -g eas-cli`) für Builds
- **Android Studio** + SDK + Emulator

> Windows (für Emulator):
> - `ANDROID_SDK_ROOT` setzen
> - `platform-tools` und `emulator` in den PATH aufnehmen

---

## Schnellstart

```bash
# 1) Repo klonen
git clone https://github.com/SBludau/steinmetz-stammtisch-app.git
cd steinmetz-stammtisch-app

# 2) Abhängigkeiten exakt wie im lockfile
npm ci

# 3) Dev-Server starten
npx expo start -c
# Web: 'w' drücken
# Android-Emulator: 'a' drücken (Emulator muss laufen)
````

---

## Dev-Server & Arbeitsweise

**Expo Dev-Server** liefert Live-Reload & Fast Refresh.
Startvarianten:

* **Standard (Expo Go ausreichend):**

  ```bash
  npx expo start -c
  ```

  * `w` → Web
  * `a` → Android Emulator (Expo Go App installiert)
  * `r` → Reload
  * `shift+r` → Cache leeren

* **Mit Dev Client (falls native Module nötig):**

  ```bash
  npx expo start -c --dev-client
  ```

  > Benötigt eine Dev-Client-App auf dem Gerät/Emulator (via EAS einmalig bauen).
  > Für dieses Projekt reicht meist **Expo Go** – Dev Client ist optional.

**Tipp:** Wenn irgendwas „komisch“ ist → `-c` (Cache clear) verwenden.

---

## Konfiguration (Supabase, OAuth, Deep-Link)

### Supabase Projekt

* **Project URL**: `https://bcbqnkycjroiskwqcftc.supabase.co`
* **anon public key**: im Code in `src/lib/supabase.ts`
  **Wichtig:** *Kein `service_role` Key im Frontend!*

### Auth URLs (Authentication → URL configuration)

* **Site URL**: `stammtisch://auth-callback`
* **Additional Redirect URLs**:

  * `stammtisch://auth-callback`
  * `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app`

### Google OAuth (Authentication → Providers → Google)

* Client ID & Secret aus der Google Cloud Console
* Consent-Screen konfigurieren

### Deep Link in der App

* `app.json`:

  ```json
  { "expo": { "scheme": "stammtisch" } }
  ```
* Callback-Screen: `app/auth-callback.tsx` (tauscht Code/Token und leitet auf `/`)

---

## Entwicklung (Web & Android-Emulator)

### Web

```bash
npx expo start
# 'w' drücken
```

### Android-Emulator

1. AVD anlegen (z. B. `Medium_Phone_API_36.0`) & starten.
2. Expo starten:

   ```bash
   npx expo start
   # 'a' drücken
   ```
3. Falls Expo Go fehlt: im Play Store installieren.

**Windows-Pfadvariablen (temporär):**

```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\Sebastian Bludau\AppData\Local\Android\Sdk"
$env:ANDROID_HOME     = $env:ANDROID_SDK_ROOT
$env:PATH             = "$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\emulator;$env:PATH"
adb version
emulator -version
```

---

## Builds (APK mit EAS)

### EAS konfigurieren

```bash
eas build:configure
```

### `eas.json`

```json
{
  "cli": { "version": ">= 3.0.0", "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

### `app.json` (Icon, Package, Scheme)

```json
{
  "expo": {
    "name": "Steinmetz Stammtisch",
    "slug": "steinmetz-stammtisch-app",
    "scheme": "stammtisch",
    "icon": "./assets/images/favicon.png",
    "android": {
      "package": "com.sebastianbludau.stammtisch",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/favicon.png",
        "backgroundColor": "#000000"
      }
    },
    "ios": {
      "icon": "./assets/images/favicon.png",
      "supportsTablet": true
    }
  }
}
```

### Build starten (APK)

```bash
eas build -p android --profile preview
# Keystore: "Let EAS handle it"
# Build-URL/QR → .apk downloaden → auf Android installieren
```

---

## Projektstruktur & Dateien

```
stammtisch-app/
├─ app/
│  ├─ _layout.tsx
│  ├─ auth-callback.tsx
│  ├─ login.tsx
│  └─ (tabs)/
│     ├─ _layout.tsx            # Expo Tabs, TabBar versteckt (eigene BottomNav)
│     ├─ index.tsx              # Startseite
│     ├─ new_stammtisch.tsx     # Neuer Stammtisch
│     ├─ profile.tsx            # Profil
│     ├─ stats.tsx              # ⭐ NEU: Statistiken (Top-Listen, Streaks, Spender)
│     └─ hall_of_fame.tsx       # ⭐ NEU: Hall of Fame (alphabetisch, Auszeichnungen)
├─ src/
│  ├─ lib/supabase.ts
│  ├─ components/BottomNav.tsx  # eigene Navi (PNG-Icons aus assets/nav)
│  └─ theme/
│     ├─ colors.ts
│     └─ typography.ts
├─ assets/
│  ├─ images/
│  │  ├─ banner.png
│  │  └─ favicon.png
│  ├─ nav/
│  │  ├─ startseite.png
│  │  ├─ neuer_stammtisch.png
│  │  ├─ statistiken.png
│  │  └─ hallo_of_fame.png
│  └─ fonts/BROADW.ttf
├─ app.json
├─ eas.json
├─ app/global.css
├─ package.json
└─ README.md
```

---

## Neue Seiten: **Statistiken** & **Hall of Fame**

### `app/(tabs)/stats.tsx`

* **Top 5 Teilnehmer (dieses Jahr)** → `stammtisch_participants.status = 'going'`
* **Top 3 längste Serien** → über chronologisch sortierte `stammtisch`-Events
* **Top 5 Spender (dieses Jahr)** → `birthday_rounds.settled_at` innerhalb des Jahres
* Zeigt Namen & Avatare aus `profiles` (Bucket `avatars`)

### `app/(tabs)/hall_of_fame.tsx`

* **Alle Mitglieder alphabetisch** nach Nachnamen (`localeCompare('de')`)
* **Auszeichnungen** als Emojis mit Platzierung & Accessibility-Label:

  * 🏆 Dauerbrenner (Top-Teilnahmen)
  * 🔥 Serien-Junkie (Top-Streaks)
  * 🍻 Edler Spender (Top-Spender)

### Navigation

* `app/(tabs)/_layout.tsx` enthält:

  ```tsx
  <Tabs.Screen name="stats" />
  <Tabs.Screen name="hall_of_fame" />
  ```
* `src/components/BottomNav.tsx`:

  * `router.replace('/stats')`
  * `router.replace('/hall_of_fame')`

---

## Datenbank & Storage

**Tabellen (vereinfacht):**

* `public.profiles (auth_user_id, first_name, last_name, avatar_url, ...)`
* `public.stammtisch (id, date, location, notes)`
* `public.stammtisch_participants (stammtisch_id, auth_user_id, status)`
* `public.birthday_rounds (auth_user_id, settled_at, ...)`

**Storage:**

* Bucket **`avatars`** (public), Pfad: `<auth_user_id>/<timestamp>.<ext>`

---

## Theme (Farben & Schriftarten)

* `colors.ts`: `bg` (Schwarz), `text` (Weiß), `gold`, `red`, `cardBg`, `border`
* `typography.ts`: `type.h1/h2/body/...` (Überschriften: **Broadway**, Body: System-Sans)

---

## Weiterentwickeln (Workflow & Git)

### Täglicher Flow

```bash
# Vor dem Arbeiten: auf Remote-Stand bringen
git fetch --all
git switch main
git pull

# Eigene Änderungen
git checkout -b feat/<kürzel>-<kurzbeschreibung>
# ... Code ändern ...
git add .
git commit -m "feat(stats): Top-Listen hinzugefügt"
git push -u origin HEAD

# Merge (via GitHub PR) → zurück auf main
git switch main
git pull
```

### Wenn mal alles schief geht (hart auf Remote zurück)

```powershell
git fetch --all
git switch -C main
git reset --hard origin/main
git clean -fdx       # löscht untracked & ignorierte Dateien (inkl. node_modules)
npm ci
npx expo start -c
```

### Dev-Server Tipps

* Immer mit `-c` starten, wenn seltsame Effekte auftreten
* Schwarzer Screen? Oft: falscher `require()`-Pfad (PNG) oder Route fehlt
* Web-Only Code (DOM, shadcn/ui) **nicht** in RN-Screens verwenden

---

## Troubleshooting

* **Google Login öffnet localhost** → Supabase URLs prüfen (siehe oben)
* **Schwarzer Screen**:

  1. `npx expo start -c`
  2. `BottomNav`-PNG-Pfade exakt prüfen
  3. Route existiert? (`<Tabs.Screen name="stats" />`)
  4. Keine Web-Imports in RN-Screens
* **Font-Fehler**: `BROADW.ttf` Pfad/Case prüfen, Cache leeren
* **Images zu groß/klein**: `styles.icon.width` in `BottomNav` anpassen

---

## Sicherheitshinweise

* **service\_role** niemals ins Frontend
* RLS/Policies für Tabellen & Storage prüfen
* Public-Bucket nur für harmlose Medien

---

## Nützliche Befehle (Spickzettel)

```bash
# Entwicklung
npm ci
npx expo start -c

# Android Emulator
emulator -list-avds
emulator -avd Medium_Phone_API_36.0

# APK Build (Preview)
eas build -p android --profile preview

# Git
git add .
git commit -m "Update"
git push

# lokaler Pfad Projekt
C:\Users\Sebastian Bludau\Documents\stammtisch-app>

# Datenbank
https://supabase.com/dashboard/project/bcbqnkycjroiskwqcftc


```

**Owner:** @SBludau
**Projekt:** steinmetz-stammtisch-app

````

---

