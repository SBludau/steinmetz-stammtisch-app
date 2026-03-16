# MetzÄpp – Steinmetz Stammtisch App

Eine mobile App (Android) und Web-Anwendung zur Verwaltung des Steinmetz-Stammtischs.
Entwickelt mit **Expo (React Native)**, **TypeScript** und **Supabase** (Auth, Datenbank & Storage).

🌐 **Web-Version:** [https://stammtisch-app.vercel.app/](https://stammtisch-app.vercel.app/)

---

## 📑 Inhaltsverzeichnis

1. [🖥️ Entwicklungsumgebung (Windows 11)](#️-entwicklungsumgebung-windows-11)
2. [🔁 Nach jedem Neustart – Was tun?](#-nach-jedem-neustart--was-tun)
3. [🚀 Ersteinrichtung (einmalig)](#-ersteinrichtung-einmalig)
4. [🛠 Tech-Stack](#-tech-stack)
5. [📁 Projektstruktur](#-projektstruktur)
6. [📱 App-Screens & Features](#-app-screens--features)
7. [🎨 Design-System](#-design-system)
8. [💾 Datenbank (Supabase)](#-datenbank-supabase)
9. [⚙️ Konfiguration (Auth & Supabase)](#️-konfiguration-auth--supabase)
10. [☁️ Deployment: Web (Vercel)](#️-deployment-web-vercel)
11. [🤖 Deployment: Android (EAS Build)](#-deployment-android-eas-build)
12. [🔄 Git-Workflow](#-git-workflow)
13. [⚡ Spickzettel (Alle Befehle)](#-spickzettel-alle-befehle)

---

## 🖥️ Entwicklungsumgebung (Windows 11)

### Installierte Tools (Stand 16.03.2026)

| Tool | Pfad / Version | Zweck |
|---|---|---|
| Node.js | v24.14.0 | JavaScript-Laufzeit |
| npm | kommt mit Node | Paketmanager |
| EAS CLI | global installiert | Cloud-Builds für Android |
| Android Studio | `C:\Program Files\Android\Android Studio` | Emulator & SDK |
| Android SDK | `C:\Users\Sebastian Bludau\AppData\Local\Android\Sdk` | Android-Build-Tools |
| Java (JBR) | `C:\Program Files\Android\Android Studio\jbr` | Java-Laufzeit für Android-Tools |
| Git | vorhanden | Versionskontrolle |

### Umgebungsvariablen (permanent gesetzt)

```
ANDROID_HOME  = C:\Users\Sebastian Bludau\AppData\Local\Android\Sdk
JAVA_HOME     = C:\Program Files\Android\Android Studio\jbr
PATH          += %ANDROID_HOME%\platform-tools
PATH          += %ANDROID_HOME%\emulator
PATH          += %JAVA_HOME%\bin
```

### Emulator

- **Name:** Medium Phone API 36.1
- **Auflösung:** 1080 × 2400 px (420 dpi)
- **Architektur:** x86_64
- **API Level:** Android 16 (API 36.1)
- **Google Play:** Ja

---

## 🔁 Nach jedem Neustart – Was tun?

Das ist die Schritt-für-Schritt-Anleitung für die tägliche Entwicklung:

### Schritt 1 – Emulator starten

1. **Android Studio** öffnen (Startmenü → „Android Studio")
2. Rechts oben: **Device Manager** Symbol klicken
3. Beim **Medium Phone API 36.1** → **▶ Play-Button** drücken
4. Warten bis der Android-Homescreen erscheint (~30–60 Sekunden)

> 💡 Alternativ startet der Emulator auch automatisch wenn du `start-android.ps1` ausführst und `a` drückst.

---

### Schritt 2 – Metro-Bundler starten

**Option A – Doppelklick auf Skript:**
```
F:\GitHub\steinmetz-stammtisch-app\start-android.ps1
```
→ Rechtsklick → „Mit PowerShell ausführen"

**Option B – PowerShell manuell:**
```powershell
cd "F:\GitHub\steinmetz-stammtisch-app"
npx expo start -c
```

---

### Schritt 3 – App auf Emulator öffnen

Im Terminal erscheint nach ~10 Sekunden:
```
› Press a │ open Android
› Press w │ open web
```

**`a` drücken** → Die MetzÄpp öffnet sich im Emulator.

> 💡 Falls die App nicht automatisch startet: Im Emulator die App **„MetzÄpp"** manuell antippen (liegt im App-Drawer).

---

### Das war's! Ab jetzt:

- Änderungen im Code → App aktualisiert **sofort automatisch** im Emulator
- `r` im Terminal drücken → App neu laden
- `Ctrl + C` → Metro-Server beenden

---

## 🚀 Ersteinrichtung (einmalig)

Diese Schritte müssen nur einmal durchgeführt werden – z.B. auf einem neuen Rechner.

### 1. Repository klonen

```bash
git clone https://github.com/SBludau/steinmetz-stammtisch-app.git
cd steinmetz-stammtisch-app
npm ci
```

### 2. Android Studio installieren

```powershell
winget install Google.AndroidStudio --accept-package-agreements --accept-source-agreements
```

Nach der Installation:
- Android Studio öffnen → Setup-Assistent: **Standard** wählen → SDK wird heruntergeladen

### 3. Umgebungsvariablen setzen

```powershell
# In PowerShell (einmalig):
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<DEIN_USER>\AppData\Local\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

### 4. EAS CLI installieren & einloggen

```bash
npm install -g eas-cli
eas login
# → Expo-Account: sbludau
# → Passwort: dein Passwort auf expo.dev
```

### 5. Emulator erstellen

Android Studio → Device Manager → **+** → Create Virtual Device
- Gerät: **Medium Phone** → Next
- System Image: **API 36** → Next → Finish
- Mit **▶ Play** starten

### 6. Development-APK installieren (einmalig)

```bash
eas build -p android --profile development
# → APK herunterladen
# → Im Emulator installieren:
adb install <pfad-zur-apk.apk>
```

> ⚠️ **Wichtig:** Diesen Schritt musst du nur wiederholen wenn neue native Bibliotheken hinzukommen oder die Expo-Version aktualisiert wird. Für normale Code-Änderungen reicht immer `npx expo start`.

---

## 🛠 Tech-Stack

| Technologie | Version | Zweck |
|---|---|---|
| [Expo](https://expo.dev/) | 53.0.22 | App-Framework mit File-based Routing |
| React Native | 0.79.6 | Mobile UI |
| TypeScript | 5.8.3 | Typsichere Programmiersprache |
| [Supabase](https://supabase.com/) | 2.57.0 | Backend: PostgreSQL, Auth, Storage |
| expo-dev-client | 5.2.4 | Development-Build für lokales Testen |
| expo-router | 5.1.5 | Navigation (File-based) |
| expo-av | 15.1.7 | Audio (Furz-Sounds 🎺) |
| react-native-calendars | 1.1313.0 | Kalender für neue Stammtische |
| [Vercel](https://vercel.com/) | – | Web-Hosting (automatisch via GitHub) |
| EAS | – | Android APK Cloud-Builds |

---

## 📁 Projektstruktur

```
steinmetz-stammtisch-app/
│
├── app/                          ← Alle Bildschirme (Expo Router)
│   ├── _layout.tsx               ← Root-Layout: Fonts laden, Auth-Status prüfen
│   ├── login.tsx                 ← Login-Screen (Google OAuth + E-Mail)
│   ├── auth-callback.tsx         ← OAuth-Weiterleitung nach Login
│   ├── claim-profile.tsx         ← Neuer User verknüpft sich mit DB-Profil
│   ├── member-card.tsx           ← Mitglieds-Karte mit QR-Code
│   │
│   ├── (tabs)/                   ← Haupt-Navigation (4 Tabs)
│   │   ├── _layout.tsx           ← Tab-Konfiguration (versteckt native Tab-Bar)
│   │   ├── index.tsx             ← Startseite: Vegas-Counter, Events, Geburtstage
│   │   ├── new_stammtisch.tsx    ← Neues Event anlegen (mit Kalender)
│   │   ├── profile.tsx           ← Eigenes Profil bearbeiten
│   │   ├── stats.tsx             ← Jahresranglisten (Anwesenheit, Serien, Spenden)
│   │   ├── hall_of_fame.tsx      ← Mitgliederliste (aktiv/passiv)
│   │   └── stammtisch/
│   │       └── [id].tsx          ← Event-Detailseite: Runden, Teilnehmer
│   │
│   └── admin/                    ← Admin-Bereich (nur für Admins sichtbar)
│       ├── users.tsx             ← Alle User verwalten
│       ├── claims.tsx            ← Profil-Verknüpfungs-Anfragen
│       ├── settings.tsx          ← App-Einstellungen (Vegas-Startbetrag)
│       └── profile/
│           └── [id].tsx          ← Einzelnes Admin-Profil bearbeiten
│
├── src/
│   ├── lib/
│   │   └── supabase.ts           ← Supabase-Client (URL + Anon-Key)
│   ├── theme/
│   │   ├── colors.ts             ← Farbpalette (Schwarz/Gold/Dunkelrot)
│   │   └── typography.ts        ← Schrift-Styles (Größen, Gewichte, Farben)
│   └── components/
│       └── BottomNav.tsx         ← Custom Bottom-Navigation (4 Icons)
│
├── assets/
│   ├── fonts/
│   │   └── BROADW.ttf            ← Broadway-Schrift (Überschriften)
│   ├── sounds/                   ← 8 Furz-Sounds + Bier + Explosion (MP3)
│   ├── nav/                      ← 4 Navigation-Icons (PNG, 96×96 px)
│   └── images/
│       └── banner.png            ← Hero-Banner auf der Startseite
│
├── supabase/
│   └── functions/
│       └── admin-delete-user/    ← Edge Function: User vollständig löschen (Deno)
│
├── app.json                      ← Expo-Konfiguration (App-Name, Icons, Bundle-ID)
├── eas.json                      ← EAS Build-Profile (development/preview/production)
├── package.json                  ← Abhängigkeiten & npm-Scripts
├── tsconfig.json                 ← TypeScript-Konfiguration
├── start-android.ps1             ← Windows-Startskript für Emulator-Entwicklung
└── .gitignore                    ← android/ und ios/ sind NICHT im Git (werden generiert)
```

---

## 📱 App-Screens & Features

### 🏠 Startseite (`index.tsx`)

**Vegas-Counter:**
- Zeigt den aktuellen Kassenstand der Stammtisch-Kasse
- Berechnung: Startbetrag (01.08.2025) + 20 € × Anzahl aktiver Daueraufträge × vergangene Monate

**Nächster Stammtisch:**
- Zeigt Datum und Uhrzeit des nächsten Events
- Immer der 2. Freitag im Monat

**Geburtstags-Runden:**
- Mitglieder die im Monat des nächsten Stammtischs Geburtstag haben
- Zeigt ob die Runde bereits gegeben wurde

**Furz-Buttons 🎺:**
- 8 verschiedene Sounds für Druckabbau in Meetings
- Plus: Bier-Sound und Explosion

---

### 📊 Statistiken (`stats.tsx`)

- Jahresauswahl per Dropdown (Standard: aktuelles Jahr)
- **Top 5 Teilnehmer** – wer war am häufigsten dabei?
- **Top 5 Serien-Trinker** – längste Anwesenheits-Serie ohne Fehlen
- **Top 5 Schankwirtschaft** – wer hat am meisten ausgegeben/gespendet?

---

### 🏅 Hall of Fame (`hall_of_fame.tsx`)

- Komplette Mitgliederliste: **Aktive** und **Passive** Steinmetze
- Status-Anzeige:
  - 🟢 Aktiv / ⚪ Passiv
  - 💰 Dauerauftrag eingerichtet
  - Auszeichnungen (Emojis)
- Sortierbar

---

### 👤 Profil (`profile.tsx`)

- Eigene Daten bearbeiten: Dienstgrad, Akademischer Grad, Lebensweisheit
- Avatar-Upload (gespeichert in Supabase Storage)
- Status-Schalter: „Aktiv" und „Dauerauftrag"
- Verknüpfungs-Status: Zeigt ob Account mit Stammtisch-Profil verbunden ist
- **Admin-Bereich:** Nur für Admin/Superuser sichtbar

---

### 🍻 Stammtisch-Detailseite (`stammtisch/[id].tsx`)

**Runden-Management:**
- Geburtstagskinder des Monats + überfällige Runden aus Vormonaten
- „Gegeben"-Button (nur bei persönlicher Anwesenheit aktiv)
- Extra-Runden für freiwillige Spender

**Teilnehmerliste:**
- Toggle für jeden Teilnehmer: Going / Declined / Maybe
- Verknüpfte und unverknüpfte Profile

---

### 📅 Neuer Stammtisch (`new_stammtisch.tsx`)

- Kalender-Auswahl für das Datum
- Nur für Admins/Superuser

---

### 🔐 Admin-Bereich (`admin/`)

- **users.tsx** – Alle User anzeigen, Rollen ändern, User löschen
- **claims.tsx** – Profil-Verknüpfungs-Anfragen genehmigen/ablehnen
- **settings.tsx** – Vegas-Startbetrag und Datum konfigurieren
- **profile/[id].tsx** – Einzelnes Profil als Admin bearbeiten

---

## 🎨 Design-System

Das Design darf **nicht ohne Absprache** geändert werden!

### Farben (`src/theme/colors.ts`)

| Variable | Hex | Verwendung |
|---|---|---|
| `bg` | `#000000` | Schwarzer App-Hintergrund |
| `text` | `#FFFFFF` | Weißer Standardtext |
| `gold` | `#C8AD2D` | Überschriften, Highlights, Akzente |
| `red` / `border` | `#7A1F17` | Rahmen, Karten-Akzente |
| `cardBg` | `#0E0E0E` | Sehr dunkle Karten-Hintergründe |

### Typografie (`src/theme/typography.ts`)

| Style | Größe | Gewicht | Farbe |
|---|---|---|---|
| `h1` | 28px | bold | gold |
| `h2` | 22px | bold | gold |
| `body` | 16px | normal | weiß (Verdana) |
| `caption` | 12px | normal | halbtransparent |

### Schriften

- **Broadway** (`assets/fonts/BROADW.ttf`) – für besondere Überschriften, wird beim App-Start geladen
- **Verdana** – Systemschrift für Fließtext

---

## 💾 Datenbank (Supabase)

### Wichtige Tabellen

| Tabelle | Zweck |
|---|---|
| `profiles` | Mitgliedsdaten: Name, Rang, Geburtstag, Avatar, Rolle, Status |
| `stammtisch` | Stammtisch-Events (Datum, Uhrzeit) |
| `stammtisch_participants` | Anwesenheit verknüpfter User (going/declined/maybe) |
| `stammtisch_participants_unlinked` | Anwesenheit nicht-verknüpfter Profile |
| `birthday_rounds` | Geburtstags-Runden (offen/bezahlt, Betrag, Datum) |
| `profile_claims` | Anfragen neuer User zur Profilverknüpfung |
| `app_settings` | Vegas-Startbetrag, Startdatum, Monatsbeitrag |

### Rollen & Berechtigungen (RLS)

| Rolle | Rechte |
|---|---|
| `member` | Eigenes Profil bearbeiten, eigene Anwesenheit toggeln |
| `superuser` | + Claims genehmigen/ablehnen |
| `admin` | + Vollzugriff (User löschen, Rollen ändern, Settings) |

### Edge Function

- **`admin-delete-user`** – Löscht User vollständig aus Auth, DB und Storage
- Pfad: `supabase/functions/admin-delete-user/index.ts`
- Nur mit Admin-Token aufrufbar

### Wichtige RPC-Funktionen

- **`seed_birthday_rounds`** – Erstellt automatisch fällige Geburtstags-Runden für den aktuellen Monat

---

## ⚙️ Konfiguration (Auth & Supabase)

### Supabase-Projekt

- **URL:** `https://bcbqnkycjroiskwqcftc.supabase.co`
- **Anon-Key:** In `src/lib/supabase.ts` (öffentlich, sicher im Frontend)
- **Service-Role-Key:** ⚠️ Geheim! Nur für Edge Functions/Admin-Skripte, NIE im Frontend!

### Auth Redirect URLs

Im Supabase Dashboard unter **Authentication → URL Configuration**:

| Typ | URL |
|---|---|
| Site URL | `https://stammtisch-app.vercel.app` |
| Redirect (Web) | `https://stammtisch-app.vercel.app/**` |
| Redirect (App) | `stammtisch://auth-callback` |
| Redirect (Dev) | `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app` |

---

## ☁️ Deployment: Web (Vercel)

Das Web-Deployment läuft **vollautomatisch** bei jedem Push auf `main`.

1. Push auf GitHub `main`
2. Vercel erkennt den Push und führt `npm run build:web` aus
3. Neue Version ist live auf [stammtisch-app.vercel.app](https://stammtisch-app.vercel.app)

**`vercel.json`** (SPA-Routing, verhindert 404 bei Direktlinks):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> ⚠️ Auth (Login) funktioniert **nur** auf der Produktions-Domain. Vercel Preview-URLs funktionieren nicht mit Supabase-Login.

---

## 🤖 Deployment: Android (EAS Build)

### Build-Profile (`eas.json`)

| Profil | Zweck | Wann verwenden? |
|---|---|---|
| `development` | Development-APK mit Dev-Client | Einmalig für lokale Entwicklung |
| `preview` | Standalone APK zum Testen | Zum Weitergeben / auf echtem Gerät testen |
| `production` | Play-Store-Build | Für offizielle Releases |

### Development-Build (für lokale Entwicklung)

```bash
# Einmalig bauen (Cloud):
eas build -p android --profile development

# APK auf Emulator installieren:
adb install <pfad-zur-apk.apk>

# Danach täglich nur noch:
npx expo start -c
```

### Preview-APK (zum Weitergeben)

```bash
eas build -p android --profile preview
# → Link zum APK-Download per E-Mail + EAS-Dashboard
```

### Aktueller Development-Build

- **Build-ID:** `9abc537e-ed5c-4dd3-b4a4-d68e1699c703`
- **Erstellt:** 16.03.2026
- **Installiert auf:** Medium Phone API 36.1 Emulator

---

## 🔄 Git-Workflow

### Täglich (Änderungen einpflegen)

```bash
# 1. Aktuellen Stand holen:
git switch main
git pull

# 2. Feature-Branch erstellen:
git checkout -b feat/mein-neues-feature

# 3. Entwickeln, dann committen:
git add .
git commit -m "feat: kurze beschreibung was geändert wurde"
git push -u origin HEAD

# 4. Auf GitHub: Pull Request erstellen → Merge
```

### Commit-Message-Konventionen

| Präfix | Bedeutung |
|---|---|
| `feat:` | Neue Funktion |
| `fix:` | Bug-Fix |
| `design:` | Nur visuelle Änderungen |
| `docs:` | Dokumentation |
| `refactor:` | Code-Umstrukturierung ohne neue Funktion |

### Notfall-Reset

```bash
git fetch --all
git reset --hard origin/main
git clean -fdx
npm ci
```

---

## ⚡ Spickzettel (Alle Befehle)

### Tägliche Entwicklung

| Befehl | Beschreibung |
|---|---|
| `npx expo start -c` | Metro-Bundler starten (mit Cache-Reset) |
| `a` (im Metro-Terminal) | App auf Android-Emulator öffnen |
| `r` (im Metro-Terminal) | App neu laden |
| `w` (im Metro-Terminal) | Web-Version im Browser öffnen |

### Installation & Setup

| Befehl | Beschreibung |
|---|---|
| `npm ci` | Alle Abhängigkeiten installieren (nach git pull) |
| `npm install -g eas-cli` | EAS CLI global installieren |
| `eas login` | EAS-Account einloggen (expo.dev Passwort) |

### Android / Emulator

| Befehl | Beschreibung |
|---|---|
| `adb devices` | Verbundene Geräte/Emulatoren anzeigen |
| `adb install <datei.apk>` | APK auf Emulator installieren |

### EAS Cloud-Builds

| Befehl | Beschreibung |
|---|---|
| `eas build -p android --profile development` | Development-APK bauen (einmalig) |
| `eas build -p android --profile preview` | Standalone APK zum Weitergeben |
| `eas build -p android --profile production` | Play-Store-Build |

### Supabase

| Befehl | Beschreibung |
|---|---|
| `npx supabase login` | Supabase CLI einloggen |
| `npx supabase functions deploy admin-delete-user` | Edge Function hochladen |

### Git

| Befehl | Beschreibung |
|---|---|
| `git status` | Was hat sich geändert? |
| `git pull` | Neuesten Stand holen |
| `git checkout -b feat/name` | Neuen Feature-Branch erstellen |
| `git add . && git commit -m "..."` | Änderungen speichern |
| `git push -u origin HEAD` | Branch auf GitHub hochladen |
