
# Steinmetz Stammtisch App

Eine mobile App (Android/iOS) und Web-Anwendung zur Verwaltung des Steinmetz-Stammtischs.
Entwickelt mit **Expo (React Native)** und **Supabase** (Auth, DB & Storage).

🌐 **Web-Version:** [https://stammtisch-app.vercel.app/](https://stammtisch-app.vercel.app/)

![](https://img.shields.io/badge/-3DDC84?style=flat&logo=android&logoColor=white) **Android-Version:** [https://expo.dev/accounts/sbludau/projects/steinmetz-stammtisch-app/builds/5b0be1f8-2ada-47d3-993b-0cf7e3f776e4](Android APK, Alpha 1,17.12.2025)

---

## 📑 Inhaltsverzeichnis

1. [🚀 Schnellstart & Entwicklungsumgebung](#-schnellstart--entwicklungsumgebung)
2. [🛠 Tech-Stack & Voraussetzungen](#-tech-stack--voraussetzungen)
3. [⚙️ Konfiguration (Supabase & Auth)](#%EF%B8%8F-konfiguration-supabase--auth)
4. [📱 App-Struktur & Seiten (Tabs)](#-app-struktur--seiten-tabs)
5. [💾 Datenbank & Sicherheit](#-datenbank--sicherheit)
6. [☁️ Deployment: Web (Vercel)](#%EF%B8%8F-deployment-web-vercel)
7. [🤖 Deployment: Android (APK/EAS)](#-deployment-android-apkeas)
8. [🔄 Workflow & Git](#-workflow--git)
9. [⚡ Spickzettel (Befehle)](#-spickzettel-befehle)

---

## 🚀 Schnellstart & Entwicklungsumgebung

So startest du die lokale Entwicklungsumgebung:

### 1. Repository klonen & installieren
```bash
git clone [https://github.com/SBludau/steinmetz-stammtisch-app.git](https://github.com/SBludau/steinmetz-stammtisch-app.git)
cd steinmetz-stammtisch-app

# Installation der Abhängigkeiten (entsprechend package-lock.json)
npm ci

```

### 2. Dev-Server starten

Der Expo Dev-Server unterstützt Live-Reload für Web und Mobile.

```bash
# Startet den Metro Bundler & Dev Client
npx expo start -c

```

* Drücke `w` für **Web**.
* Drücke `a` für **Android Emulator**.
* Drücke `shift + r` um den Cache zu leeren (bei seltsamen Fehlern).

### 3. Android Emulator (Windows Tipps)

Falls der Emulator nicht startet, prüfe die Pfadvariablen in PowerShell:

```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\<DEIN_USER>\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\emulator;$env:PATH"

```

Überprüfung: `emulator -version`

---

## 🛠 Tech-Stack & Voraussetzungen

* **Framework:** React Native mit [Expo](https://expo.dev/) (File-based Routing mit Expo Router)
* **Sprache:** TypeScript
* **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions, Storage)
* **Web Hosting:** [Vercel](https://vercel.com/)
* **Build Tool:** EAS (Expo Application Services)

**Benötigte Tools:**

* Node.js & npm
* Git
* Android Studio (für Emulator)
* EAS CLI: `npm i -g eas-cli`

---

## ⚙️ Konfiguration (Supabase & Auth)

Damit Login und Datenbankzugriff funktionieren, müssen die Keys und Redirect-URLs stimmen.

### Supabase Projekt

* **URL:** `https://bcbqnkycjroiskwqcftc.supabase.co`
* **Keys:**
* `anon key`: Public (in `src/lib/supabase.ts`)
* `service_role`: **Geheim!** (Nur für Edge Functions/Admin-Scripte nutzen, nie im Frontend!)



### Auth Redirect URLs

Damit OAuth (Google Login) sowohl in der App als auch im Web funktioniert, müssen im Supabase Dashboard unter **Authentication → URL Configuration** folgende Werte eingetragen sein:

1. **Site URL:** `https://stammtisch-app.vercel.app`
2. **Redirect URLs:**
* `https://stammtisch-app.vercel.app/**` (Wichtig für Web)
* `stammtisch://auth-callback` (Wichtig für App Deep-Link)
* `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app` (Expo Go / Dev Client)



---

## 📱 App-Struktur & Seiten (Tabs)

Die Hauptnavigation befindet sich im Ordner `app/(tabs)`.

### 🏠 Startseite (`index.tsx`)

* **Vegas Counter:** Zeigt den aktuellen Kassenstand an.
* Logik: Startbetrag 1500 € (01.08.2025) + 20 € pro aktivem Dauerauftrag/Monat.


* **Geburtstags-Runden:** Zeigt Mitglieder, die im *Monat des nächsten Stammtischs* Geburtstag haben.

### 📊 Statistiken (`stats.tsx`)

* **Dropdown:** Auswahl des Jahres (Standard: aktuelles Jahr).
* **Rankings (Top 5):**
* 🏆 Teilnehmer (Anwesenheit)
* 🍺 Serien-Trinker (Längste Serie ohne Fehlen)
* 💸 Schankwirtschaft (Höchste Ausgaben/Spenden)



### 🏅 Hall of Fame (`hall_of_fame.tsx`)

* Liste aller **Aktiven** und **Passiven** Steinmetze.
* Zeigt Status-Icons:
* 🟢 Aktiv / ⚪ Passiv
* 💰 Dauerauftrag eingerichtet
* Auszeichnungen (Emojis)



### 👤 Profil (`profile.tsx`)

* Bearbeitung der eigenen Daten (Dienstgrad, Akademischer Grad, Lebensweisheit).
* **Status-Switches:** "Aktiv" und "Dauerauftrag".
* **Verknüpfungs-Status:** Zeigt an, ob der Account mit einem Stammtisch-Profil (DB) verknüpft ist.
* **Admin-Bereich:** (Nur sichtbar für Admin/Superuser) Links zur Benutzerverwaltung.

### 🍻 Einzel-Stammtisch (`stammtisch/[id].tsx`)

* **Runden-Management:**
* Geburtstagskinder des Monats + Überfällige Runden aus Vormonaten.
* "Gegeben"-Button (nur bei Anwesenheit aktiv).
* **Extra-Runden:** Button für freiwillige Runden ("Edle Spender").


* **Teilnehmerliste:** Toggle für Anwesenheit (Going/Declined).

---

## 💾 Datenbank & Sicherheit

### Wichtige Tabellen (`public`)

* **`profiles`**:
* Verknüpft `auth.users` (UUID) mit Stammtisch-Daten.
* Felder: `role` (member/superuser/admin), `degree` (Dr./Prof.), `is_active`, `avatar_url`.


* **`birthday_rounds`**:
* Verwaltet offene und bezahlte Runden.
* Logik via RPC `seed_birthday_rounds`: Erstellt automatisch fällige Runden für den Monat.



### Rollen & Rechte (RLS)

* **Member:** Kann eigenes Profil bearbeiten und Teilnahme toggeln.
* **SuperUser:** Kann Claims (Profil-Verknüpfungen) genehmigen.
* **Admin:** Vollzugriff (Löschen, Entkoppeln, Rollen ändern).

### Edge Function: `admin-delete-user`

Löscht einen User komplett aus `auth.users`, der DB und dem Storage.

* Pfad: `supabase/functions/admin-delete-user/index.ts`
* Darf nur mit Admin-Token aufgerufen werden.

---

## ☁️ Deployment: Web (Vercel)

Das Web-Deployment erfolgt **automatisch** bei jedem Push auf `main`.

1. **Trigger:** Push auf GitHub `main`.
2. **Build:** Vercel führt `npm run build:web` aus (Expo Export).
3. **Config (`vercel.json`):**
Zwingend notwendig für SPA-Routing (verhindert 404 bei Refresh auf Unterseiten):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

```



⚠️ **Wichtig:** Auth (Login) funktioniert **nur** auf der Produktions-Domain (`stammtisch-app.vercel.app`), da Preview-URLs (z.B. `...git-fork...`) nicht in der Supabase Allow-List stehen.

---

## 🤖 Deployment: Android (APK/EAS)

Erstellung der Android-App (`.apk`) für die manuelle Installation.

### Konfiguration (`eas.json`)

Das Profil `preview` ist für APK-Builds konfiguriert:

```json
"preview": { "distribution": "internal", "android": { "buildType": "apk" } }

```

### Build Befehl

```bash
eas build -p android --profile preview

```

Nach Abschluss erhältst du einen Link zum Download der APK.

---

## 🔄 Workflow & Git

Bitte arbeite mit Feature-Branches, um den `main` sauber zu halten.

1. **Aktualisieren:**
```bash
git switch main
git pull

```


2. **Branch erstellen:**
```bash
git checkout -b feat/mein-neues-feature

```


3. **Arbeiten & Committen:**
```bash
git add .
git commit -m "feat: beschreibung was gemacht wurde"
git push -u origin HEAD

```


4. **Merge:** Erstelle einen Pull Request (PR) auf GitHub oder merge lokal zurück.

**Notfall-Reset (alles lokal verwerfen):**

```bash
git fetch --all
git reset --hard origin/main
git clean -fdx
npm ci

```

---

## ⚡ Spickzettel (Befehle)

| Befehl | Beschreibung |
| --- | --- |
| `npm ci` | Saubere Installation aller Abhängigkeiten |
| `npx expo start -c` | Dev-Server starten (mit Cache Clean) |
| `eas build -p android --profile preview` | Android APK bauen |
| `npx supabase login` | Login in Supabase CLI |
| `npx supabase functions deploy admin-delete-user` | Edge Function hochladen |

```

```
