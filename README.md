# MetzÄpp – Steinmetz Stammtisch App

Eine mobile App (Android) und Web-App zur Verwaltung des Steinmetz-Stammtischs.
Entwickelt mit **Expo (React Native)**, **TypeScript** und **Supabase**.

🌐 **Web-Version:** [stammtisch-app.vercel.app](https://stammtisch-app.vercel.app/)

---

## ⚡ Schnellstart – Was tun bei jedem Neustart?

### 1. Emulator starten

Android Studio öffnen → **Device Manager** (rechts oben) → **▶** bei „Medium Phone API 36.1" drücken → warten bis Android-Homescreen erscheint (~30–60 Sek.)

### 2. Expo Dev Server starten (PowerShell)

```powershell
cd "F:\GitHub\steinmetz-stammtisch-app"
npx expo start --clear
```

→ Im Terminal `a` drücken → App öffnet sich im Emulator
→ `r` drücken → App neu laden
→ `Ctrl+C` → Server beenden

### 3. Code ändern & testen

Änderungen im Code → App aktualisiert sich **automatisch** im Emulator. Falls nicht: `r` drücken.

### 4. Änderungen speichern (Git)

```powershell
git add .
git commit -m "feat: was wurde geändert"
git push
```

### 5. Update an alle App-Nutzer schicken (OTA)

```powershell
eas update --channel preview --message "kurze beschreibung der änderung"
```

Dauert ~1 Minute. Nutzer bekommen beim nächsten App-Start automatisch einen Update-Dialog.
**Kein neuer APK-Build nötig** – solange nur Code (JS/TS) geändert wurde.

---

## 📲 Wann brauche ich einen neuen APK-Build?

| Situation | Was tun? |
|---|---|
| Code geändert (Features, Bugfixes, Design) | `eas update` — fertig |
| Neue native Bibliothek installiert (`npx expo install ...`) | `eas build` → neue APK |
| Expo SDK-Version aktualisiert | `eas build` → neue APK |
| Icons, Splash-Screen, Berechtigungen geändert (`app.json`) | `eas build` → neue APK |

**Faustregel: 95% aller Änderungen → `eas update`. Neuer Build ist selten.**

```powershell
# Neuen APK-Build starten (nur wenn nötig, dauert ~15 Min in der Cloud):
eas build --profile preview --platform android
# → Download-Link erscheint im Terminal und auf expo.dev
# → Link per WhatsApp/E-Mail an alle Nutzer schicken (einmalig installieren)
```

---
---

## 🛠 Tech-Stack & Tools

| Technologie | Version | Zweck |
|---|---|---|
| Expo | 53 | App-Framework mit File-based Routing |
| React Native | 0.79 | Mobile UI |
| TypeScript | 5.8 | Programmiersprache |
| Supabase | 2.57 | Backend: PostgreSQL, Auth, Storage |
| expo-updates | – | OTA-Updates ohne neue APK |
| expo-dev-client | 5.2 | Development-Build für Emulator |
| expo-router | 5.1 | Navigation (File-based) |
| expo-av | 15.1 | Audio (Sounds) |
| react-native-calendars | 1.13 | Kalender |
| Vercel | – | Web-Hosting (auto-deploy via GitHub) |
| EAS | – | Android APK Cloud-Builds |

**Lokale Entwicklungsumgebung (Windows 11):**
- Node.js v24 · Android Studio · Android SDK · Java (JBR von Android Studio)
- `ANDROID_HOME = C:\Users\<USER>\AppData\Local\Android\Sdk`
- `JAVA_HOME = C:\Program Files\Android\Android Studio\jbr`

---

## 📁 Projektstruktur

```
steinmetz-stammtisch-app/
│
├── app/                          ← Alle Bildschirme (Expo Router)
│   ├── _layout.tsx               ← Root-Layout: Fonts, OTA-Update-Check
│   ├── login.tsx                 ← Login (Google OAuth + E-Mail)
│   ├── auth-callback.tsx         ← OAuth-Weiterleitung nach Login
│   ├── claim-profile.tsx         ← Neuer User verknüpft sich mit DB-Profil
│   ├── member-card.tsx           ← Mitglieds-Karte mit QR-Code
│   │
│   ├── (tabs)/                   ← Haupt-Navigation
│   │   ├── index.tsx             ← Startseite: Vegas-Counter, Events, Geburtstage
│   │   ├── new_stammtisch.tsx    ← Neues Event anlegen
│   │   ├── profile.tsx           ← Eigenes Profil bearbeiten
│   │   ├── stats.tsx             ← Jahresranglisten
│   │   ├── hall_of_fame.tsx      ← Mitgliederliste
│   │   └── stammtisch/[id].tsx   ← Event-Detailseite: Runden, Teilnehmer
│   │
│   └── admin/                    ← Admin-Bereich
│       ├── users.tsx             ← User verwalten
│       ├── claims.tsx            ← Profil-Verknüpfungs-Anfragen
│       ├── settings.tsx          ← App-Einstellungen
│       └── profile/[id].tsx      ← Einzelnes Profil bearbeiten
│
├── src/
│   ├── lib/supabase.ts           ← Supabase-Client
│   ├── theme/colors.ts           ← Farbpalette
│   ├── theme/typography.ts       ← Schrift-Styles
│   └── components/BottomNav.tsx  ← Custom Bottom-Navigation
│
├── assets/
│   ├── fonts/BROADW.ttf          ← Broadway-Schrift
│   ├── sounds/                   ← MP3-Sounds
│   ├── nav/                      ← Navigation-Icons
│   └── images/banner.png         ← Hero-Banner
│
├── supabase/functions/
│   └── admin-delete-user/        ← Edge Function: User vollständig löschen
│
├── .github/workflows/
│   └── supabase-ping.yml         ← Keep-Alive Ping alle 3 Tage (GitHub Actions)
│
├── app.json                      ← Expo-Konfiguration (Name, Icons, OTA-Channel)
├── eas.json                      ← EAS Build-Profile
└── package.json                  ← Abhängigkeiten
```

---

## 📱 App-Screens & Features

### Startseite (`index.tsx`)
- **Vegas-Counter** – aktueller Kassenstand der Stammtisch-Kasse (Startbetrag + Daueraufträge × Monate)
- **Nächster Stammtisch** – immer der 2. Freitag im Monat; zeigt überfällige Geburtstagsrunden
- **Geburtstags-Runden** – wer hat im Stammtisch-Monat Geburtstag, bereits gegeben?
- **Furz-Buttons** 🎺 – 8 Sounds + Bier + Explosion

### Stammtisch-Detailseite (`stammtisch/[id].tsx`)
- Geburtstagskinder + überfällige Runden aus Vormonaten
- „Gegeben"-Button nur bei persönlicher Anwesenheit aktiv
- Extra-Runden (Edle Spender)
- Teilnehmerliste: Going / Declined / Maybe (verknüpfte + unverknüpfte Profile)
- Moderationsbereich (Admin/Superuser): Runden bestätigen oder löschen

### Statistiken (`stats.tsx`)
- Jahresauswahl · Top 5 Teilnehmer · Top 3 Serien · Top 5 Spender

### Hall of Fame (`hall_of_fame.tsx`)
- Alle Mitglieder (aktiv/passiv), sortiert nach Nachname

### Profil (`profile.tsx`)
- Dienstgrad, Akademischer Grad, Lebensweisheit, Avatar-Upload
- Status: Aktiv / Dauerauftrag
- Admin-Bereich: Link zu Users, Claims, Settings

### Admin-Bereich (`admin/`)
- **users.tsx** – Rollen ändern, Profile entkoppeln, User löschen
- **claims.tsx** – Profil-Verknüpfungs-Anfragen genehmigen/ablehnen
- **settings.tsx** – Vegas-Startbetrag und -datum konfigurieren

---

## 🎨 Design-System

**Das Design darf nicht ohne Absprache geändert werden.**

### Farben (`src/theme/colors.ts`)

| Variable | Hex | Verwendung |
|---|---|---|
| `bg` | `#000000` | Schwarzer Hintergrund |
| `text` | `#FFFFFF` | Standardtext |
| `gold` | `#C8AD2D` | Überschriften, Highlights |
| `red` / `border` | `#7A1F17` | Rahmen, Akzente |
| `cardBg` | `#0E0E0E` | Karten-Hintergrund |

### Typografie (`src/theme/typography.ts`)

| Style | Größe | Farbe |
|---|---|---|
| `h1` | 28px bold | gold |
| `h2` | 22px bold | gold |
| `body` | 16px | weiß (Verdana) |
| `caption` | 12px | halbtransparent |

- **Broadway** (`assets/fonts/BROADW.ttf`) – Überschriften, wird beim App-Start geladen
- **Verdana** – Systemschrift für Fließtext

---

## 💾 Datenbank (Supabase)

**Projekt-URL:** `https://bcbqnkycjroiskwqcftc.supabase.co`
**Anon-Key:** in `src/lib/supabase.ts` (öffentlich, sicher im Frontend)
**Service-Role-Key:** ⚠️ Geheim! In `.env.local` (gitignored). Nie ins Frontend!

### Tabellen

| Tabelle | Zweck |
|---|---|
| `profiles` | Mitgliedsdaten: Name, Rang, Geburtstag, Avatar, Rolle, Status |
| `stammtisch` | Events (Datum, Uhrzeit, Ort) |
| `stammtisch_participants` | Anwesenheit verknüpfter User (going/declined/maybe) |
| `stammtisch_participants_unlinked` | Anwesenheit nicht-verknüpfter Profile |
| `birthday_rounds` | Geburtstags-Runden (offen/bezahlt, Datum, `due_month`) |
| `spender_rounds` | Edle-Spender-Runden |
| `profile_claims` | Anfragen neuer User zur Profilverknüpfung |
| `app_settings` | Vegas-Startbetrag, Startdatum, Monatsbeitrag |

### Rollen & Berechtigungen (RLS)

| Rolle | Rechte |
|---|---|
| `member` | Eigenes Profil, eigene Anwesenheit |
| `superuser` | + Claims genehmigen/ablehnen |
| `admin` | + Vollzugriff |

### RPC-Funktionen

- **`seed_birthday_rounds`** – Legt automatisch fällige Geburtstags-Runden an wenn eine Stammtisch-Detailseite geöffnet wird. Prüft ob die Person bereits eine genehmigte Runde im selben Jahr hat, um Duplikate zu vermeiden.

### Edge Function

- **`admin-delete-user`** – Löscht User vollständig aus Auth, DB und Storage. Nur mit Admin-Token aufrufbar. Pfad: `supabase/functions/admin-delete-user/index.ts`

### Live-Datenbankzugriff (für KI-Entwicklung mit Claude)

```bash
# Service-Role-Key aus .env.local verwenden
SUPA_URL="https://bcbqnkycjroiskwqcftc.supabase.co"
SUPA_KEY="<service_role_key>"

curl -s "$SUPA_URL/rest/v1/profiles?select=*" \
  -H "apikey: $SUPA_KEY" \
  -H "Authorization: Bearer $SUPA_KEY"
```

---

## ⚙️ Auth & Konfiguration

### Supabase Auth Redirect URLs

| Typ | URL |
|---|---|
| Site URL | `https://stammtisch-app.vercel.app` |
| Redirect Web | `https://stammtisch-app.vercel.app/**` |
| Redirect App | `stammtisch://auth-callback` |
| Redirect Dev | `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app` |

### OTA-Update Konfiguration (`app.json`)

```json
"runtimeVersion": { "policy": "appVersion" },
"updates": {
  "url": "https://u.expo.dev/333c92f5-6dd8-4ff8-813a-a846668c3be3",
  "enabled": true,
  "checkAutomatically": "ON_LOAD"
}
```

`runtimeVersion: appVersion` bedeutet: Ein OTA-Update für APK v1.0.0 wird nur auf APK v1.0.0 eingespielt. Verhindert inkompatible Updates wenn eine neue APK mit geänderter nativer Konfiguration rauskommt.

---

## ☁️ Deployments

### Web (Vercel) – vollautomatisch

Push auf `main` → Vercel baut automatisch → live auf [stammtisch-app.vercel.app](https://stammtisch-app.vercel.app)

> ⚠️ Login funktioniert **nur** auf der Produktions-Domain, nicht auf Vercel Preview-URLs.

### Android – EAS Build-Profile (`eas.json`)

| Profil | Zweck |
|---|---|
| `development` | Dev-APK mit Dev-Client (einmalig für Emulator) |
| `preview` | Standalone APK zum Weitergeben (OTA-Channel: preview) |
| `production` | Play-Store-Build (OTA-Channel: production) |

### Supabase Keep-Alive

GitHub Actions Workflow (`.github/workflows/supabase-ping.yml`) pingt die Datenbank alle 3 Tage, damit das kostenlose Supabase-Projekt nicht einschläft.

---

## 🚀 Ersteinrichtung (einmalig, z.B. auf neuem Rechner)

```powershell
# 1. Repo klonen
git clone https://github.com/SBludau/steinmetz-stammtisch-app.git
cd steinmetz-stammtisch-app
npm ci

# 2. Android Studio installieren
winget install Google.AndroidStudio --accept-package-agreements --accept-source-agreements
# → Setup-Assistent: Standard wählen → SDK wird heruntergeladen

# 3. Umgebungsvariablen setzen
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<USER>\AppData\Local\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# 4. EAS CLI installieren & einloggen
npm install -g eas-cli
eas login   # → Expo-Account: sbludau

# 5. Emulator erstellen: Android Studio → Device Manager → + → Medium Phone → API 36 → Finish

# 6. Development-APK bauen und auf Emulator installieren (einmalig)
eas build -p android --profile development
adb install <pfad-zur-apk.apk>
```

---

## ⚡ Alle Befehle auf einen Blick

### Tägliche Entwicklung
| Befehl | Was passiert |
|---|---|
| `npx expo start --clear` | Metro-Server starten |
| `a` (im Terminal) | App im Emulator öffnen |
| `r` (im Terminal) | App neu laden |
| `Ctrl+C` | Server beenden |

### Git
| Befehl | Was passiert |
|---|---|
| `git pull` | Neuesten Stand holen |
| `git add . && git commit -m "..."` | Speichern |
| `git push` | Auf GitHub hochladen |

### Updates & Builds
| Befehl | Was passiert |
|---|---|
| `eas update --channel preview --message "..."` | OTA-Update an alle Nutzer (~1 Min) |
| `eas build --profile preview --platform android` | Neue APK bauen (~15 Min, selten nötig) |

### Notfall
| Befehl | Was passiert |
|---|---|
| `npm ci` | Abhängigkeiten neu installieren |
| `git reset --hard origin/main` | Alle lokalen Änderungen verwerfen |
