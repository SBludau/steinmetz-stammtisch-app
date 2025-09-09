import { useState, useMemo } from 'react'
import { View, Text, TextInput, Button, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Calendar } from 'react-native-calendars'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

// --- Datumshilfen ---
const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function getSecondFriday(year: number, month0: number): Date {
  const first = new Date(year, month0, 1)
  const day = first.getDay() // 0=So ... 5=Fr
  const offsetToFriday = (5 - day + 7) % 7
  const firstFriday = 1 + offsetToFriday
  return new Date(year, month0, firstFriday + 7)
}
function nextSecondFridayFrom(today: Date): string {
  const thisMonthSecond = getSecondFriday(today.getFullYear(), today.getMonth())
  const todayStr = ymd(today)
  const thisStr = ymd(thisMonthSecond)
  if (todayStr <= thisStr) return thisStr
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return ymd(getSecondFriday(nextMonth.getFullYear(), nextMonth.getMonth()))
}

export default function NewStammtischScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Vorauswahl: nächster 2. Freitag
  const initialDate = useMemo(() => nextSecondFridayFrom(new Date()), [])
  const [date, setDate] = useState(initialDate)     // YYYY-MM-DD
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>('')  // sichtbare Statusmeldung
  const [error, setError] = useState<string>('')    // sichtbare Fehlermeldung

  // Sichtbarer Monat im Kalender (für Markierung 2. Freitag)
  const [visibleYM, setVisibleYM] = useState(() => ({
    year: parseInt(date.slice(0, 4), 10),
    month0: parseInt(date.slice(5, 7), 10) - 1,
  }))

  // Markierungen: 2. Freitag des sichtbaren Monats + ausgewähltes Datum
  const markedDates = useMemo(() => {
    const m: Record<string, any> = {}
    const secondFridayStr = ymd(getSecondFriday(visibleYM.year, visibleYM.month0))
    m[secondFridayStr] = { marked: true, dotColor: colors.gold }
    m[date] = { ...(m[date] ?? {}), selected: true, selectedColor: colors.red, selectedTextColor: colors.text }
    return m
  }, [visibleYM, date])

  async function save() {
    setStatus('')
    setError('')

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Ungültiges Datum. Bitte YYYY-MM-DD.')
      return
    }
    if (!location.trim()) {
      setError('Ort fehlt. Bitte eingeben.')
      return
    }

    try {
      setSaving(true)
      setStatus('Speichere …')

      const { data, error } = await supabase
        .from('stammtisch')
        .insert({ date, location: location.trim(), notes: notes.trim() || null })
        .select('id')

      if (error) {
        setSaving(false)
        setError(`Fehler: ${error.message}`)
        setStatus('')
        return
      }

      const newId = data?.[0]?.id
      setStatus(`Gespeichert (ID: ${newId ?? 'unbekannt'})`)

      // Broadcast an Startseite: neu laden
      try {
        const ch = supabase.channel('client-refresh', { config: { broadcast: { self: true } } })
        await ch.subscribe()
        await ch.send({ type: 'broadcast', event: 'stammtisch-saved', payload: {} })
        await supabase.removeChannel(ch)
      } catch {
        // ignorieren – fallback ist useFocusEffect
      }

      setLocation('')
      setNotes('')
      setTimeout(() => router.replace('/'), 2000)
    } catch (e: any) {
      setError(`Unerwarteter Fehler: ${e?.message ?? String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        // Scroll-Viewport endet VOR der Bottom-Bar
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        persistentScrollbar
        indicatorStyle="white" // iOS: heller Indikator auf dunklem Hintergrund
        showsVerticalScrollIndicator
      >
        <Text style={[type.h1]}>Neuer Stammtisch</Text>

        <Text style={[type.body, { marginTop: 4 }]}>Datum auswählen (2. Freitag ist markiert)</Text>

        {/* Kalender in Karten-Optik */}
        <View
          style={{
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <Calendar
            current={date}
            markedDates={markedDates}
            onDayPress={(d) => setDate(d.dateString)}
            onMonthChange={(m) => setVisibleYM({ year: m.year, month0: m.month - 1 })}
            theme={{
              backgroundColor: colors.cardBg,
              calendarBackground: colors.cardBg,
              textSectionTitleColor: colors.text,
              monthTextColor: colors.gold,
              arrowColor: colors.gold,
              dayTextColor: colors.text,
              todayTextColor: colors.gold,
              textDisabledColor: '#666',
              selectedDayBackgroundColor: colors.red,
              selectedDayTextColor: colors.text,
            }}
          />
        </View>

        <Text style={[type.h2, { marginTop: 8 }]}>Ort</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Kneipe zum Löwen"
          placeholderTextColor="#bfbfbf"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 10,
            backgroundColor: colors.cardBg,
            color: colors.text,
          }}
        />

        <Text style={[type.h2, { marginTop: 8 }]}>Notiz (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="z. B. Erster Testeintrag"
          placeholderTextColor="#bfbfbf"
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 10,
            minHeight: 60,
            backgroundColor: colors.cardBg,
            color: colors.text,
          }}
        />

        <View style={{ gap: 10, marginTop: 4 }}>
          <Button title={saving ? 'Speichere…' : 'Speichern'} onPress={save} disabled={saving} />
          <Button title="Abbrechen" onPress={() => router.back()} />
        </View>

        {status ? <Text style={{ ...type.body, color: colors.gold }}>{status}</Text> : null}
        {error ? <Text style={{ ...type.body, color: colors.red }}>{error}</Text> : null}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
