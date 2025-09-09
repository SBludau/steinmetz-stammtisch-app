````markdown
# Steinmetz Stammtisch App

Eine kleine mobile App (Android/iOS/Web) mit **Expo + React Native** und **Supabase** (Auth, DB & Storage).  
Ziel: Stammtische anlegen/anzeigen, Benutzerprofile pflegen (inkl. Avatar), Anmeldung via **Google** oder **E-Mail/Passwort**.

---

## Inhaltsverzeichnis

1. [Was macht die App?](#was-macht-die-app)
2. [Voraussetzungen & Versionen](#voraussetzungen--versionen)
3. [Schnellstart](#schnellstart)
4. [Konfiguration (Supabase, OAuth, Deep-Link)](#konfiguration-supabase-oauth-deep-link)
5. [Entwicklung (Web & Android-Emulator)](#entwicklung-web--android-emulator)
6. [Builds (APK mit EAS)](#builds-apk-mit-eas)
7. [Projektstruktur & Dateien](#projektstruktur--dateien)
8. [Datenbank & Storage](#datenbank--storage)
9. [Theme (Farben & Schriftarten)](#theme-farben--schriftarten)
10. [Troubleshooting](#troubleshooting)
11. [Sicherheitshinweise](#sicherheitshinweise)
12. [Nützliche Befehle (Spickzettel)](#nützliche-befehle-spickzettel)

---

## Was macht die App?

- **Startseite**  
  - Banner ganz oben  
  - Profil-Karte (Name/Avatar, Link zum Profil)  
  - **Bevorstehende** & **Frühere** Stammtische (jeweils scrollbar), sortiert  
  - Echtzeit-Update bei neuen Einträgen (Realtime + Broadcast)

- **Neuer Stammtisch**  
  - Formular mit **Kalender**  
  - Markiert immer den **2. Freitag** des sichtbaren Monats  
  - Vorauswahl ist der **nächste 2. Freitag** ab heute  
  - Nach Speichern geht’s automatisch zurück zur Startseite (mit Reload)

- **Profil**  
  - Vorname, Nachname, Titel, Geburtstag, Zitat  
  - **Avatar** wählen (Galerie) oder Kamera → Upload in Supabase Storage → Pfad in `profiles.avatar_url`

- **Login**  
  - **Google OAuth** oder **E-Mail/Passwort**  
  - **Deep Link** zurück in die App (kein `localhost`)

- **Bottom-Navigation**  
  - Startseite, Neuer Stammtisch, Statistiken (Platzhalter), Hall of Fame (Platzhalter)

---

## Voraussetzungen & Versionen

**Getestete Versionen auf diesem Rechner:**
```bash
node -v          # v22.19.0
npm -v
npx expo --version
eas --version
git --version
adb version      # Android Debug Bridge version 1.0.41 (36.0.0-13206524)
emulator -version# Android emulator version 36.1.9.0
````

**Installierte Software (kurz):**

* **Node.js** (inkl. npm)
* **Expo CLI** (wird via `npx expo …` genutzt)
* **EAS CLI** (`npm i -g eas-cli`) – für APK-Builds
* **Git** (und optional GitHub Desktop)
* **Android Studio** inkl. **SDK, Emulator, Platform-Tools**, AVD (z. B. `Medium_Phone_API_36.0`)

---

## Schnellstart

```bash
# 1) Repo klonen
git clone https://github.com/SBludau/steinmetz-stammtisch-app.git
cd steinmetz-stammtisch-app

# 2) Abhängigkeiten
npm install

# 3) Entwickeln/Starten
npx expo start
# Web: 'w' drücken
# Android-Emulator: 'a' drücken (Emulator muss laufen)
```

---

## Konfiguration (Supabase, OAuth, Deep-Link)

### Supabase Projekt

* **Project URL**: `https://bcbqnkycjroiskwqcftc.supabase.co`
* **anon public key**: (im Code in `src/lib/supabase.ts` hinterlegt)
  **Wichtig:** *Nie den service\_role key ins Frontend/Repo packen!*

### Auth URLs in Supabase (Authentication → URL configuration)

* **Site URL**: `stammtisch://auth-callback`
* **Additional Redirect URLs**:

  * `stammtisch://auth-callback`
  * `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app`

### Google OAuth (Authentication → Providers → Google)

* **Client ID** & **Client Secret** aus Google Cloud Console eintragen (Provider aktivieren)
* Consent Screen: App-Name, Support-E-Mail, ggf. Logo/Branding

### Deep Link in der App

* `app.json`:

  ```json
  { "expo": { "scheme": "stammtisch" } }
  ```
* **Callback-Screen**: `app/auth-callback.tsx`
  – tauscht den OAuth-Code/Token gegen eine Supabase-Session und leitet auf `/` (Startseite) um.

---

## Entwicklung (Web & Android-Emulator)

### Web

```bash
npx expo start
# 'w' drücken
```

### Android-Emulator

1. Emulator per AVD Manager anlegen (z. B. `Medium_Phone_API_36.0`), starten:

   ```bash
   emulator -list-avds
   emulator -avd Medium_Phone_API_36.0
   ```
2. Expo starten:

   ```bash
   npx expo start
   # dann 'a' drücken
   ```
3. Wenn Expo Go im Emulator fehlt: im Play Store installieren, dann erneut `a`.

**Hinweis zu SDK-Pfaden (Windows, temporär in der Session):**

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
│  ├─ _layout.tsx                # Root-Layout: lädt Font "Broadway", StatusBar, importiert global.css (Web)
│  ├─ auth-callback.tsx          # Deep-Link-Ziel: tauscht OAuth-Code/Token gegen Session, leitet zu "/"
│  ├─ login.tsx                  # Login (Google OAuth + E-Mail/Passwort) mit Deep-Link-Redirect
│  └─ (tabs)/
│     ├─ _layout.tsx             # (Tabs-Layout, Header aus, wir nutzen eigene BottomNav)
│     ├─ index.tsx               # Startseite (Banner, Profil-Karte, Listen Bevorstehend/Früher, Reload)
│     ├─ new_stammtisch.tsx      # Formular + Kalender (2. Freitag markiert, nächster 2. Freitag vorausgewählt)
│     └─ profile.tsx             # Profil bearbeiten (Textfelder + Avatar-Upload in Storage)
├─ src/
│  ├─ lib/
│  │  └─ supabase.ts             # Supabase-Client (Project URL + anon key)
│  ├─ components/
│  │  └─ BottomNav.tsx           # Eigene Bottom-Navigation (Icons aus assets/nav)
│  └─ theme/
│     ├─ colors.ts               # Farbschema (Schwarz, Gold, Rot, Weiß) + Radius
│     └─ typography.ts           # Textstile (Broadway für Headlines, System Sans für Body)
├─ assets/
│  ├─ images/
│  │  ├─ banner.png              # Banner oben
│  │  └─ favicon.png             # App-Icon (auch Android adaptive foreground)
│  ├─ nav/
│  │  ├─ startseite.png
│  │  ├─ neuer_stammtisch.png
│  │  ├─ statistiken.png
│  │  └─ hallo_of_fame.png
│  └─ fonts/
│     └─ BROADW.ttf              # Überschrift/Highlight (Broadway)
├─ app.json                      # Expo-App-Konfiguration
├─ eas.json                      # EAS Build-Profile
├─ app/global.css                # Scrollbar-Farben (nur Web)
├─ package.json                  # Dependencies & Scripts
└─ README.md                     # Diese Datei
```

### Wichtige Dateiinhalte (Kurzbeschreibung)

* **`src/lib/supabase.ts`**
  Initialisiert den Supabase-Client mit `createClient(PROJECT_URL, ANON_PUBLIC_KEY)`.

* **Startseite `app/(tabs)/index.tsx`**

  * Lädt Profil (`profiles`), Avatar (Storage), Stammtisch-Einträge (`stammtisch`).
  * Teilt in „Bevorstehend“ vs. „Früher“, sortiert, listet in Cards.
  * Realtime (`postgres_changes` auf `stammtisch`) + Broadcast (`stammtisch-saved`) → Live-Updates.

* **Neuer Stammtisch `app/(tabs)/new_stammtisch.tsx`**

  * Kalender via `react-native-calendars`.
  * Hilfsfunktionen bestimmen 2. Freitag / nächsten 2. Freitag.
  * Speichert in DB, sendet Broadcast, navigiert zurück.

* **Profil `app/(tabs)/profile.tsx`**

  * Textfelder + Bildauswahl/Kamera via `expo-image-picker`.
  * Upload in **Bucket `avatars`** (public), Pfad `auth_user_id/timestamp.ext`.
  * Speichert Pfad in `profiles.avatar_url`.

* **Login `app/login.tsx`**

  * E-Mail/Passwort (`signInWithPassword`, `signUp`).
  * Google OAuth mit `expo-web-browser` + `expo-linking`, **Deep-Link** statt localhost.
  * `redirectTo` (native) = `stammtisch://auth-callback`.
  * Web-Redirect = `window.location.origin`.

* **Auth-Callback `app/auth-callback.tsx`**

  * Liest `code`/`access_token` aus dem Deep Link.
  * `exchangeCodeForSession` / `getSession` → Weiterleitung auf `/`.

* **BottomNav `src/components/BottomNav.tsx`**

  * Feste Höhe + Safe-Area.
  * Schwarzer Hintergrund, Icons aus `assets/nav`, responsiv skalierend.

* **Theme**

  * `colors.ts`: zentrale Farben (Schwarz/Gold/Rot/Weiß) + `radius`.
  * `typography.ts`: `type.h1/h2/body/button` etc., Headlines `Broadway`, Body = System Sans.

---

## Datenbank & Storage

### Tabellen (vereinfacht)

* **`public.profiles`**
  `auth_user_id uuid` (FK → `auth.users`), `first_name`, `last_name`, `title`, `birthday date`, `quote`, `avatar_url`.
* **`public.stammtisch`**
  `id bigint` (PK), `date date`, `location text`, `notes text`.
* **`public.stammtisch_participants`**
  `stammtisch_id bigint`, `auth_user_id uuid`, `status ('going'|'maybe'|'declined')`.

### Storage

* **Bucket**: `avatars` (public).
* Pfade: `<auth_user_id>/<timestamp>.<ext>`.
* Policies: Upload/Read für eingeloggte Nutzer (über Dashboard konfiguriert).

---

## Theme (Farben & Schriftarten)

* **Farben** (aus Banner entnommen, leicht angenähert):

  * `bg` **#000000** (Hintergrund)
  * `text` **#FFFFFF** (Schrift)
  * `gold` **#C8AD2D** (Headlines/Highlights)
  * `red` **#7A1F17** (Akzent/Umrandung)
  * `cardBg` **#0E0E0E** (Karten)
  * `border` **#7A1F17** (Rahmen)

* **Fonts**

  * Headlines: **BROADW\.ttf** (Broadway) – liegt in `assets/fonts/`, wird im Root-Layout geladen.
  * Fließtext/Buttons: **System Sans** (keine extra Font nötig; Arial/Roboto/SF je Plattform).

* **Web Scrollbars**: `app/global.css` (goldener Thumb, dunkler Track).

---

## Troubleshooting

* **Google Login öffnet `localhost`**
  → In Supabase **Site URL** = `stammtisch://auth-callback`, Additional Redirects wie oben.
  → `login.tsx` nutzt `Linking.createURL('auth-callback')` (kein localhost).

* **Nach Speichern sieht man den Eintrag erst nach Klick**
  → Startseite hat `useFocusEffect` + Realtime + Broadcast `stammtisch-saved`.

* **UI überlappt mit Bottom-Nav**
  → Seiten nutzen `ScrollView` mit `style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}`.

* **SDK/adb nicht gefunden**
  → PATH/Umgebungsvariablen temporär setzen (siehe Entwicklung/Emulator).

* **Font-Fehler „Unable to resolve module … .TTF“**
  → Dateiendung klein: `BROADW.ttf`, Pfad korrekt, Metro-Cache leeren: `npx expo start -c`.

* **Icons in Bottom-Nav zu groß/klein**
  → In `BottomNav.tsx` `icon`-Breite feinjustieren (z. B. `width: '58%'` → `62%`).

---

## Sicherheitshinweise

* **Service Role Key niemals** ins Frontend/Repo.
* **RLS/Policies** in DB & Storage prüfen.
* Public-Bucket nur für harmlose Medien (Avatare).
* Für Produktion später: **eigene Domain**, sauberes **Branding** im Google Consent Screen, **Privacy Policy** & **Terms** hinterlegen.

---

## Nützliche Befehle (Spickzettel)

```bash
# Entwicklung
npx expo start

# Android Emulator
emulator -list-avds
emulator -avd Medium_Phone_API_36.0

# APK Build (Preview)
eas build -p android --profile preview

# Git
git add .
git commit -m "Update"
git push
```

---

**Owner:** @SBludau
**Projekt:** steinmetz-stammtisch-app

```

---
```
