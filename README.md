# Steinmetz Stammtisch App

Eine kleine mobile App (Android/iOS/Web) mit **Expo + React Native** und **Supabase** (Auth, DB & Storage).
Ziel: Stammtische anlegen/anzeigen, Benutzerprofile pflegen (inkl. Avatar), Anmeldung via **Google** oder **E-Mail/Passwort**.
Anzeige als Webpage oder als Android App

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
9. [Seiten: Statistiken, Hall of Fame, Admin & Claim](#seiten-statistiken-hall-of-fame-admin--claim)
10. [Datenbank, Rollen & Sicherheit](#datenbank-rollen--sicherheit)
11. [Serverless: Edge Function „admin-delete-user“](#serverless-edge-function-admin-delete-user)
12. [Theme (Farben & Schriftarten)](#theme-farben--schriftarten)
13. [Weiterentwickeln (Workflow & Git)](#weiterentwickeln-workflow--git)
14. [Sicherheitshinweise](#sicherheitshinweise)
15. [Nützliche Befehle (Spickzettel)](#nützliche-befehle-spickzettel)

---

## Was macht die App?

* **Stammtische** erstellen, anzeigen und verwalten
* **Profile** mit Avatar (Upload) + **Avatar-Fallback** aus Google-Identität (falls kein Upload vorhanden)
* **Teilnahme** („going/maybe/declined“)
* **Login** via Google oder E-Mail/Passwort
* **Statistiken** (Top-5-Teilnehmer, Top-5-Serien, Top-5-Spender – alle jahresbezogen, per Jahr-Dropdown)
* **Hall of Fame**: aktive & passive Steinmetze (2 listen), inkl. Auszeichnungen & Status-Icons
* **Vegas Counter** auf der Startseite: Kassenstand (Startbetrag + Daueraufträge)
* **Geburtstags-Runden**: pro Stammtisch-Monat aktuelle Geburtstage (+ Alter) und überfällige Runden; Runden können nur bei Anwesenheit als „gegeben“ verbucht werden; **Extra-Runden** möglich
* **Claim-Workflow**: Profile verknüpfen & bestätigen
* **Admin-Seiten**:

  * Verknüpfungs-Anfragen genehmigen/ablehnen (`/admin/claims`)
  * Benutzerverwaltung (`/admin/users`): Rollen vergeben, Profile entkoppeln/löschen, Accounts löschen (Edge Function)

---

## Voraussetzungen & Versionen

* **Node.js** (inkl. npm)
* **Git**
* **Expo CLI** via `npx expo …`
* **EAS CLI** (`npm i -g eas-cli`) für Builds
* **Android Studio** + SDK + Emulator

> Windows (für Emulator):
>
> * `ANDROID_SDK_ROOT` setzen
> * `platform-tools` und `emulator` in den PATH aufnehmen

---

## Schnellstart

```bash
# 1) Repo klonen
git clone https://github.com/SBludau/steinmetz-stammtisch-app.git
cd steinmetz-stammtisch-app

# 2) Abhängigkeiten (wie im lockfile)
npm ci

```

---

## Dev-Server & Arbeitsweise

**Expo Dev-Server** liefert Live-Reload & Fast Refresh.

  ```cmd
  cd C:\Users\Sebastian Bludau\Documents\stammtisch-app
  ```
* **Mit Dev Client (falls native Module nötig):**

  ```cmd
  npx expo start -c --dev-client
  ```
  * `w` → Web
  * `a` → Android Emulator
  * `r` → Reload
  * `shift+r` → Cache leeren

**Tipp:** Bei seltsamen Zuständen → mit `-c` neu starten und dann expo Server neu starten

---

## Konfiguration (Supabase, OAuth, Deep-Link)

### Supabase Projekt

* **Project URL**: `https://bcbqnkycjroiskwqcftc.supabase.co`
* **anon public key**: in `src/lib/supabase.ts`
* **Wichtig**: *Kein `service_role` Key im Frontend!*

### Auth URLs (Authentication → URL configuration)

* **Site URL**: `stammtisch://auth-callback`
* **Additional Redirect URLs**:

  * `stammtisch://auth-callback`
  * `https://auth.expo.io/@sbludau/steinmetz-stammtisch-app`


---


**Windows-Pfadvariablen (temporär):**

```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\<DU>\AppData\Local\Android\Sdk"
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
```

---

## Projektstruktur & Dateien

```
stammtisch-app/
├─ app/
│  ├─ _layout.tsx
│  ├─ auth-callback.tsx
│  ├─ login.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx            # Startseite (+ Vegas Counter, Geburtstags-Runden pro Event-Monat)
│  │  ├─ new_stammtisch.tsx
│  │  ├─ profile.tsx          # Profil (+ Degree, Standing Order, is_active, Verknüpfungsanzeige, Admin-Links)
│  │  ├─ stats.tsx            # Statistiken (Top-5, Jahr-Dropdown)
│  │  ├─ hall_of_fame.tsx     # Aktive/Passive, Auszeichnungen, Avatar-Fallback
│  │  └─ stammtisch/[id].tsx  # Einzel-Event (3-Spalten-Layout, Runden-Handling, Extra-Runden, Teilnehmer)
│  ├─ claim-profile.tsx       # Profil-Auswahl (Claim durch Member)
│  └─ admin/
│     ├─ claims.tsx           # Claims genehmigen/ablehnen
│     └─ users.tsx            # Rollen, Entkoppeln, Löschen (inkl. Edge Function)
├─ src/
│  ├─ lib/supabase.ts
│  ├─ components/BottomNav.tsx
│  └─ theme/
│     ├─ colors.ts
│     └─ typography.ts        # Verdana/Arial/… System-Font
├─ supabase/functions/admin-delete-user/index.ts  # Edge Function
├─ assets/
│  ├─ images/banner.png
│  ├─ images/favicon.png
│  └─ nav/...
├─ app.json
├─ eas.json
├─ package.json
└─ README.md
```

---

## Seiten: **Statistiken, Hall of Fame, Admin & Claim**

### Startseite (`/(tabs)/index.tsx`)

* Banner, Profilkarte, Tabs (Bevorstehend/Früher)
* **Vegas Counter**:
  Startbetrag **1500 €** ab **01.08.2025** (fix im Code) + pro aktivem **Standing Order** 20 €/Monat ab jeweiligem Monatsanfang. Anzeige ist tagesgenau.
* **Geburtstags-Runden pro Event-Monat**:
  Wenn ein Mitglied im **Monat des Stammtischs** Geburtstag hat, wird es genannt – mit **Grad**, Vor-/Mittel-/Nachname, **Avatar** (Upload oder Google), **Geburtsdatum (de)** und **Alter**.

### Statistiken (`/(tabs)/stats.tsx`)

* Jahr-Dropdown (Standard = aktuelles Jahr)
* **Top 5 – Teilnehmer** („🏆 Beharrlichkeit führt zum Ziel“)
* **Top 5 – Serien-Trinker** (längste Serien)
* **Top 5 – Schankwirtschafts Runden** (größte Spender, `birthday_rounds.settled_at` im Jahr)
* Avatare mit **Google-Fallback** (falls kein Upload)

### Hall of Fame (`/(tabs)/hall_of_fame.tsx`)

* Zwei Listen: **Aktive Steinmetze** (is\_active = true) und **Passive** (false)
* Pro Zeile: Grad (Dr./Prof.), Vor-/Mittel-/Nachname, Aktiv-Icon (grün/weiß), Dauerauftrag-Icon (💰 bei true), Auszeichnungen (🏆/🔥/🍻), **kleines Thumbnail** (Upload oder Google)

### Einzel-Stammtisch (`/(tabs)/stammtisch/[id].tsx`)

* Oberer Bereich = **große Box** mit drei Spalten (gleiche Höhe):

  1. **Kalender** (Datum wählen)
  2. **Geburtstags-Runden** – Überschrift „Geburtstags-Runden – \<Monat/Jahr>“

     * **Diesen Monat**: alle Geburtstagskinder (mit Datum + Alter)
     * **Überfällig**: alle offenen Runden aus Vormonaten
     * **Gegeben**-Button in beiden Listen; **nur bei Anwesenheit** buchbar
  3. **Edle Spender dieses Stammtischs** (scrollbar) + runder Button **„Eine Runde geben“** (Extra-Runden, mehrfach möglich; nur bei Anwesenheit)
* Unterer Bereich = **große Box** über volle Breite:

  * Links: **Ort** & **„Geniale Ideen für die Nachwelt“**
  * Rechts: hoher **Speichern**-Button in Rot/Gold
* **Teilnehmerliste**: einklappbar; Tap toggelt Anwesenheit
* **Löschen**-Button nur für **Admin**

### Profil (`/(tabs)/profile.tsx`)

* Felder: Vorname, **Zweitname (nur Admin)**, Nachname, **Steinmetz Dienstgrad** (Text), Geburtstag (YYYY-MM-DD), **Akademischer Grad** (Dropdown: none/Dr./Prof.), **Lebensweisheit** (max. 500), **Aktiv** (Switch), **Dauerauftrag** (Switch)
* Verknüpfungsstatus („🔗/🟡 Mit … verknüpft …“)
* **Admin-Links**: „Verknüpfungs-Anfragen prüfen“ (`/admin/claims`) & „Benutzerverwaltung“ (`/admin/users`)
* Zugriffsrechte-Footer:

  * member → „DAU“
  * superuser → „SuperUser“
  * admin → „Admin – Wile E. Coyote – Genius“

### Claim-Workflow

* **/claim-profile**: Member wählt ein vorbereitetes Profil; erzeugt **Claim (pending)**.
* **/admin/claims**: Admin/SuperUser genehmigen/ablehnen.
  Bei Genehmigung: Profil wird **mit User verknüpft**, **self\_check = true**, **is\_active = true**.

### Admin – Benutzerverwaltung (`/admin/users`)

* **Rollen** zuweisen (member/superuser/admin)
* **Entkoppeln** (Profil lose, inaktiv)
* **Profil löschen**
* **Account + Profil löschen** (Edge Function, inkl. Avatar-Dateien)
* **Nur Account löschen** (Profil bleibt, nur entkoppelt)
* **Profil bearbeiten** (Admin) – Sprung in Profil-Edit

---

## Datenbank, Rollen & Sicherheit

### Tabelle `public.profiles` (relevante Felder)

* `auth_user_id uuid unique` – Verknüpfung zu `auth.users`
* `first_name text`, `middle_name text`, `last_name text`
* `title text` (Steinmetz Dienstgrad – freier Text)
* `birthday date`
* `quote text` (Lebensweisheit, max. 500 in der UI begrenzt)
* `avatar_url text` (Storage-Pfad im öffentlichen Bucket `avatars`)
* `role enum('member','superuser','admin')` – Standard: `member`
* `degree enum('none','dr','prof')` – Standard: `none`
* `is_active boolean` – Standard: `true`
* `self_check boolean` – Standard: `false` (wird bei Claim-Genehmigung `true`)
* `standing_order boolean` – Standard: `false`

### Geburtstags-Runden `public.birthday_rounds`

* `auth_user_id uuid`
* `due_month date` – **Monats- bzw. Tagesstempel** (für Extra-Runden kann ein Tag verwendet werden)
* `settled_stammtisch_id int` / `settled_at timestamptz`
* **RPC** `seed_birthday_rounds(p_due_month date, p_stammtisch_id int)`
  → Legt fällige Monatsrunden an (wenn noch nicht vorhanden)

### Rollen & Policies (Kurz)

* **Member**: eigenes Profil bearbeiten (ohne `role` & `self_check` & `middle_name`), Teilnahme toggeln, Runden sehen
* **SuperUser**: Admin-Seiten sehen (lesen), Claims genehmigen/ablehnen
* **Admin**: alles (Rollen zuweisen, entkoppeln, löschen, Edge Function auslösen)
* **RLS**: Hilfsfunktionen wie `is_admin()` / `is_superuser()`; Policies passend gesetzt

---

## Serverless: Edge Function „admin-delete-user“

**Achtung:** nur Admins dürfen diese Funktion triggern (Prüfung über das Access-Token).

### Struktur

```
supabase/functions/admin-delete-user/index.ts
```

### Secrets (im Supabase-Projekt)

```bash
npx supabase login
npx supabase secrets set \
  PROJECT_URL="https://<project>.supabase.co" \
  ANON_KEY="<anon>" \
  SERVICE_ROLE_KEY="<service_role>"
```

### Deploy

```bash
npx supabase functions deploy admin-delete-user
```

### Aufruf (im Admin-UI)

Die App ruft die Function mit dem **Bearer**-Token des Admins auf und übergibt:

* `user_id`
* `delete_profile: boolean`
* `delete_storage: boolean`

---

## Theme (Farben & Schriftarten)

* **Farben** in `src/theme/colors.ts` (Gold/Rot/Border/CardBg etc.)
* **Schrift** in `src/theme/typography.ts`:

  * **Keine Custom-Fonts mehr**. Verwendung von **Verdana**, Fallback **Arial**, sonst **System Sans**.
  * Überschriften = fett/größer, Body = normal, Caption = klein & dezent

---

## Weiterentwickeln (Workflow & Git)

```bash
# Vor dem Arbeiten
git fetch --all
git switch main
git pull

# Feature-Branch
git checkout -b feat/<kürzel>-<kurzbeschreibung>

# Änderungen committen
git add .
git commit -m "feat: <kurzbeschreibung>"
git push -u origin HEAD

# Merge per PR → zurück auf main
git switch main
git pull
```

**Reset (hart auf Remote):**

```bash
git fetch --all
git switch -C main
git reset --hard origin/main
git clean -fdx
npm ci
npx expo start -c
```

---

## Sicherheitshinweise

* **service\_role** niemals im Frontend verwenden oder committen
* **RLS/Policies** prüfen (gerade bei neuen Tabellen/Funktionen)
* **Public-Bucket** nur für harmlose Medien
* **Edge Function** nur via Admin-Token nutzbar

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

# Supabase CLI (einloggen & deploy)
npx supabase login
npx supabase secrets set PROJECT_URL="..." ANON_KEY="..." SERVICE_ROLE_KEY="..."
npx supabase functions deploy admin-delete-user
```

**Owner:** @SBludau
**Projekt:** steinmetz-stammtisch-app

---
