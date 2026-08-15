// scripts/backup-supabase.js
//
// Datensicherung der Supabase-Datenbank.
//
// Warum es das gibt: Im kostenlosen Supabase-Tarif gibt es keine automatischen
// Sicherungen, die man selbst zurueckspielen koennte. Geht die Datenbank
// verloren oder loescht jemand versehentlich Eintraege, ist alles weg.
//
// Was das Skript macht: Es liest jede Tabelle vollstaendig aus und schreibt sie
// in eine einzige JSON-Datei im Projektordner:
//
//     supabase-backup-2026-08-15T20-13-00.json
//
// Diese Dateien sind in .gitignore ausgeschlossen und landen NICHT auf GitHub –
// sie enthalten echte Namen und Betraege. Am besten regelmaessig eine Kopie auf
// eine externe Platte oder in die eigene Cloud legen.
//
// Aufruf:
//     npm run backup
//
// Voraussetzung: Die Datei .env.local im Projektordner mit SUPABASE_URL und
// SUPABASE_SERVICE_ROLE_KEY. Der Service-Role-Key umgeht absichtlich die
// Zeilen-Sicherheit (RLS), damit wirklich alle Zeilen mitkommen. Er gehoert
// niemals in die App und niemals auf GitHub.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

// Alle Tabellen im Schema "public". Neue Tabelle angelegt? Hier eintragen.
const TABELLEN = [
  'profiles',
  'stammtisch',
  'stammtisch_participants',
  'stammtisch_participants_unlinked',
  'birthday_rounds',
  'spender_rounds',
  'profile_claims',
  'app_settings',
]

function ladeEnv() {
  const datei = path.join(ROOT, '.env.local')
  if (!fs.existsSync(datei)) {
    console.error('Fehler: .env.local nicht gefunden.')
    console.error('Erwartet werden dort SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }
  const env = {}
  for (const zeile of fs.readFileSync(datei, 'utf8').split(/\r?\n/)) {
    const treffer = zeile.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (treffer) env[treffer[1]] = treffer[2].replace(/^["']|["']$/g, '')
  }
  return env
}

async function holeTabelle(url, key, tabelle) {
  // In Seiten laden, damit auch groessere Tabellen vollstaendig ankommen.
  const SEITE = 1000
  const zeilen = []
  for (let von = 0; ; von += SEITE) {
    const antwort = await fetch(`${url}/rest/v1/${tabelle}?select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${von}-${von + SEITE - 1}`,
      },
    })
    if (!antwort.ok) {
      throw new Error(`${tabelle}: HTTP ${antwort.status} ${antwort.statusText}`)
    }
    const teil = await antwort.json()
    zeilen.push(...teil)
    if (teil.length < SEITE) break
  }
  return zeilen
}

async function main() {
  const env = ladeEnv()
  const url = (env.SUPABASE_URL || '').replace(/\/+$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Fehler: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local.')
    process.exit(1)
  }

  const sicherung = { erstellt_am: new Date().toISOString(), tabellen: {} }
  let gesamt = 0

  for (const tabelle of TABELLEN) {
    const zeilen = await holeTabelle(url, key, tabelle)
    sicherung.tabellen[tabelle] = zeilen
    gesamt += zeilen.length
    console.log(`  ${tabelle}: ${zeilen.length} Zeilen`)
  }

  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const ziel = path.join(ROOT, `supabase-backup-${stempel}.json`)
  fs.writeFileSync(ziel, JSON.stringify(sicherung, null, 2), 'utf8')

  console.log(`\nFertig: ${gesamt} Zeilen in ${path.basename(ziel)}`)
  console.log('Diese Datei enthaelt echte Nutzerdaten – bitte nicht weitergeben.')
}

main().catch(fehler => {
  console.error('Sicherung fehlgeschlagen:', fehler.message)
  process.exit(1)
})
