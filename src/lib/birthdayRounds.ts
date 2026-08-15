// src/lib/birthdayRounds.ts
//
// Gemeinsame Regeln fuer Geburtstagsrunden.
//
// Diese Datei ist die EINZIGE Quelle fuer die Frage "in welchen Monat gehoert
// eine Geburtstagsrunde und ab wann ist sie ueberfaellig?". Vorher stand die
// Rechnung doppelt im Code (Startbildschirm und Stammtisch-Detail) und die
// beiden Fassungen sind auseinandergelaufen – der Startbildschirm hat den
// Jahreswechsel nicht beruecksichtigt und Dezember-Geburtstage verschluckt.
// Wer die Regeln aendert, aendert sie bitte nur hier.

// Stichtag: Vor diesem Monat wird nichts eingefordert.
export const EARLIEST_DUE_MONTH = '2025-09-01'

// Faelligkeitsmonat (YYYY-MM) einer Geburtstagsrunde.
//
// Massgeblich ist der Geburtsmonat. Der in der Datenbank gespeicherte Monat
// liefert nur das Jahr – und den ganzen Wert, wenn im Profil kein Geburtstag
// hinterlegt ist.
//
// Zwei Faelle sind zu unterscheiden, weil die Datenbank frueher anders gerechnet
// hat: entweder steht dort bereits der Geburtsmonat, oder der Monat danach.
// Steht dort Januar und der Geburtstag ist im Dezember, gehoert die Runde in den
// Dezember des VORJAHRES – sonst verschwindet sie beim Stammtisch im Januar aus
// der Liste der ueberfaelligen Runden (Regel R-17).
export function birthdayRoundMonth(
  birthday: string | null | undefined,
  dbDueMonth: string | null | undefined,
  fallbackYear: string
): string {
  const raw = (dbDueMonth ?? '').slice(0, 7)
  if (!birthday) return raw

  const bm = birthday.slice(5, 7)
  if (!raw) return `${fallbackYear}-${bm}`

  const dbYear = Number(raw.slice(0, 4))
  const dbMonth = raw.slice(5, 7)
  if (dbMonth === bm) return `${dbYear}-${bm}`

  const monthBefore = String(((Number(dbMonth) + 10) % 12) + 1).padStart(2, '0')
  if (monthBefore === bm) {
    const year = dbMonth === '01' ? dbYear - 1 : dbYear
    return `${year}-${bm}`
  }

  // Weder das eine noch das andere (z. B. Geburtsdatum nachtraeglich geaendert):
  // der Geburtstag im Profil zaehlt.
  return `${dbYear}-${bm}`
}

// In welchen Monat faellt die zuletzt faellig gewordene Geburtstagsrunde einer
// Person – gemessen an einem Bezugsmonat (Stammtisch-Monat bzw. laufender
// Monat)?
//
// Regel R-17: Ueberfaellige Runden verfallen zum Jahreswechsel NICHT. Liegt der
// Geburtsmonat im Bezugsjahr schon hinter uns, zaehlt das Bezugsjahr; sonst der
// gleiche Monat im Vorjahr. Beispiel: Bezugsmonat Januar 2026, Geburtstag im
// Dezember -> Dezember 2025.
//
// Der Bezugsmonat selbst gilt nie als ueberfaellig (Regel R-5a: eine Runde wird
// erst am Geburtstag selbst faellig, also fruehestens im laufenden Monat – und
// "ueberfaellig" ist sie erst danach).
//
// Rueckgabe null bedeutet: kein Geburtstag hinterlegt oder der Monat liegt vor
// dem Stichtag.
export function overdueBirthdayMonth(
  birthday: string | null | undefined,
  referenceMonthYYYYMM: string
): string | null {
  if (!birthday) return null
  const year = Number(referenceMonthYYYYMM.slice(0, 4))
  if (!Number.isFinite(year)) return null

  const bMonth = birthday.slice(5, 7)
  const thisYear = `${year}-${bMonth}`
  const monat = thisYear < referenceMonthYYYYMM ? thisYear : `${year - 1}-${bMonth}`

  if (monat < EARLIEST_DUE_MONTH.slice(0, 7)) return null
  return monat
}

// Regel R-5a (Stichtag): Eine Geburtstagsrunde wird erst am Geburtstag selbst
// oder danach faellig. Beispiel: Geburtstag am 13. September, Stammtisch am
// 11. September -> an diesem Abend noch nicht faellig. Faellig wird sie dann
// beim naechsten Stammtisch (und taucht dort unter "ueberfaellig" auf).
//
// GELTUNGSBEREICH: Diese Funktion beantwortet nur die Tagesfrage INNERHALB
// eines Monats – also "Der Stammtisch ist im Geburtsmonat, aber ist der
// Geburtstag an diesem Abend schon gewesen?". Beide Aufrufer (Startbildschirm
// und Stammtisch-Detail) filtern vorher auf den Geburtsmonat.
//
// Liegt der Termin in einem ANDEREN Monat, ist die Frage hier nicht
// entscheidbar – dafuer ist overdueBirthdayMonth() zustaendig, das auch den
// Jahreswechsel kennt (Dezember-Geburtstag, Termin im Januar). In dem Fall
// gibt es hier true zurueck, damit niemand faelschlich als "noch nicht
// faellig" ausgeblendet wird.
//
// Sonderfall 29. Februar: in Jahren ohne Schalttag gilt der 28. Februar.
//
// Ohne hinterlegten Geburtstag oder ohne Termin gilt ebenfalls true – ein
// fehlendes Datum darf niemanden dauerhaft aus der Liste kippen.
export function isBirthdayDueOn(
  birthday: string | null | undefined,
  referenceDateIso: string | null | undefined
): boolean {
  if (!referenceDateIso || !birthday) return true

  const year = Number(referenceDateIso.slice(0, 4))
  if (!Number.isFinite(year)) return true

  const mm = birthday.slice(5, 7)
  // Anderer Monat -> ausserhalb des Geltungsbereichs, nichts ausblenden.
  if (referenceDateIso.slice(5, 7) !== mm) return true

  let dd = birthday.slice(8, 10)
  if (mm === '02' && dd === '29') {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    if (!isLeapYear) dd = '28'
  }

  return referenceDateIso >= `${year}-${mm}-${dd}`
}
