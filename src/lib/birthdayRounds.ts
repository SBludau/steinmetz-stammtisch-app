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
