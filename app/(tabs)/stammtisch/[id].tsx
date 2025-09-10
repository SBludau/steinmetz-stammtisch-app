// app/(tabs)/stammtisch/[id].tsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, TextInput, Button, ScrollView, Alert, Pressable, ActivityIndicator, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Calendar } from 'react-native-calendars'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../../src/components/BottomNav'
import { supabase } from '../../../src/lib/supabase'
import { colors, radius } from '../../../src/theme/colors'
import { type } from '../../../src/theme/typography'

type Row = { id: number; date: string; location: string; notes: string | null }
type Profile = { auth_user_id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }

// Hilfen
const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const firstOfMonth = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}-${m}-01`
}

// Route-Param sicher normalisieren (expo-router kann string ODER string[] liefern)
function normalizeId(param: unknown): number {
  const raw = Array.isArray(param) ? param[0] : (param as string | number | undefined)
  const n = Number(raw)
  return Number.isFinite(n) ? n : NaN
}

const AVATAR_BASE_URL =
  'https://bcbqnkycjroiskwqcftc.supabase.co/storage/v1/object/public/avatars'

export default function StammtischEditScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams()
  const idNum = normalizeId(params?.id)

  const [row, setRow] = useState<Row | null>(null)
  const [date, setDate] = useState('')         // YYYY-MM-DD
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  // Teilnehmer-Status (public.stammtisch_participants)
  type AttStatus = 'going' | 'declined' | 'maybe'
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [attendingMap, setAttendingMap] = useState<Record<string, AttStatus>>({})
  const [loadingAtt, setLoadingAtt] = useState(true)

  // Geburtstags-Runden (public.birthday_rounds)
  type BR = { id: number; auth_user_id: string; due_month: string; settled_stammtisch_id: number | null }
  const [dueRounds, setDueRounds] = useState<BR[]>([])
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [roundsErr, setRoundsErr] = useState<string | null>(null)

  // Edle Spender dieses Stammtischs (alle, die ihre Runde HIER gegeben haben)
  type Donor = { auth_user_id: string; settled_at: string | null }
  const [donors, setDonors] = useState<Donor[]>([])
  const [loadingDonors, setLoadingDonors] = useState(true)

  const load = useCallback(async () => {
    if (!Number.isFinite(idNum)) {
      setError('Ungültige ID.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('stammtisch')
        .select('id,date,location,notes')
        .eq('id', idNum)
        .maybeSingle()
      if (error) throw error
      if (!data) {
        setError('Eintrag nicht gefunden.')
        return
      }
      setRow(data as Row)
      setDate(data.date ?? '')
      setLocation(data.location ?? '')
      setNotes(data.notes ?? '')
    } catch (e: any) {
      setError(e?.message ?? 'Fehler beim Laden.')
    } finally {
      setLoading(false)
    }
  }, [idNum])

  // Profile & Teilnehmer-Status laden
  const loadParticipants = useCallback(async () => {
    if (!Number.isFinite(idNum)) return
    setLoadingAtt(true)
    try {
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('auth_user_id, first_name, last_name, avatar_url')
        .order('last_name', { ascending: true })
      if (pErr) throw pErr
      const list = (profs ?? []) as Profile[]
      setProfiles(list)

      const { data: parts, error: aErr } = await supabase
        .from('stammtisch_participants')
        .select('auth_user_id, status')
        .eq('stammtisch_id', idNum)
      if (aErr) throw aErr

      const map: Record<string, AttStatus> = {}
      for (const p of list) map[p.auth_user_id] = 'declined' // Default: nicht anwesend
      for (const row of parts ?? []) map[row.auth_user_id as string] = (row.status as AttStatus) || 'declined'
      setAttendingMap(map)
    } catch (e: any) {
      console.error('Teilnehmer laden Fehler:', e.message)
    } finally {
      setLoadingAtt(false)
    }
  }, [idNum])

  // Geburtstags-Runden laden (alle fälligen bis einschließlich Monat dieses Stammtischs, ungeklärt)
  const loadBirthdayRounds = useCallback(async () => {
    setLoadingRounds(true)
    setRoundsErr(null)
    try {
      if (!Number.isFinite(idNum) || !date) {
        setDueRounds([])
        return
      }
      const dueMonth = firstOfMonth(date)

      // sicherstellen, dass der Monat befüllt ist
      try {
        await supabase.rpc('seed_birthday_rounds', {
          p_due_month: dueMonth,
          p_stammtisch_id: idNum,
        })
      } catch {
        // ignore
      }

      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, due_month, settled_stammtisch_id')
        .lte('due_month', dueMonth)
        .is('settled_stammtisch_id', null)
        .order('due_month', { ascending: true })
      if (error) throw error

      setDueRounds((data ?? []) as BR[])
    } catch (e: any) {
      setRoundsErr(e?.message ?? 'Fehler beim Laden der Geburtstags-Runden.')
    } finally {
      setLoadingRounds(false)
    }
  }, [idNum, date])

  // Edle Spender (alle, die bei DIESEM Stammtisch ihre Runde gegeben haben)
  const loadDonors = useCallback(async () => {
    setLoadingDonors(true)
    try {
      if (!Number.isFinite(idNum)) {
        setDonors([])
        return
      }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id, settled_stammtisch_id, settled_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: true })
      if (error) throw error
      setDonors((data ?? []).map(d => ({ auth_user_id: d.auth_user_id as string, settled_at: d.settled_at as string | null })))
    } catch (e) {
      setDonors([])
    } finally {
      setLoadingDonors(false)
    }
  }, [idNum])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadParticipants()
  }, [loadParticipants])

  useEffect(() => {
    loadBirthdayRounds()
  }, [loadBirthdayRounds])

  useEffect(() => {
    loadDonors()
  }, [loadDonors])

  async function save() {
    if (!Number.isFinite(idNum)) {
      setError('Ungültige ID.')
      return
    }
    try {
      setSaving(true)
      setStatus(null)
      setError(null)
      const { error } = await supabase
        .from('stammtisch')
        .update({ date, location, notes })
        .eq('id', idNum)
      if (error) throw error

      setStatus('Gespeichert.')
      await supabase.channel('client-refresh').send({
        type: 'broadcast',
        event: 'stammtisch-saved',
        payload: { id: idNum },
      })

      // Falls Datum geändert wurde → Runden neu laden
      await loadBirthdayRounds()
    } catch (e: any) {
      setError(e?.message ?? 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete() {
    if (!Number.isFinite(idNum)) {
      Alert.alert('Fehler', 'Ungültige ID.')
      return
    }
    Alert.alert(
      'Eintrag löschen?',
      'Dieser Vorgang kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: deleting ? 'Lösche…' : 'Löschen',
          style: 'destructive',
          onPress: async () => {
            if (deleting) return
            try {
              setDeleting(true)
              const { error } = await supabase
                .from('stammtisch')
                .delete()
                .eq('id', idNum)
              if (error) throw error

              await supabase.channel('client-refresh').send({
                type: 'broadcast',
                event: 'stammtisch-saved',
                payload: { id: idNum },
              })

              router.back()
            } catch (e: any) {
              Alert.alert('Fehler', e?.message ?? 'Löschen fehlgeschlagen.')
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  // Kalender-Theme (wie new_stammtisch), keine Quick-Buttons
  const calendarTheme = {
    backgroundColor: colors.cardBg,
    calendarBackground: colors.cardBg,
    textSectionTitleColor: colors.text,
    dayTextColor: colors.text,
    monthTextColor: colors.text,
    selectedDayBackgroundColor: colors.gold,
    selectedDayTextColor: colors.bg,
    todayTextColor: colors.gold,
    arrowColor: colors.text,
  } as const

  const marked = date ? { [date]: { selected: true } } : undefined
  const initialDate = date || ymd(new Date())

  // Vollständiger Name
  const nameOf = useMemo(
    () => (p: Profile) => {
      const fn = (p.first_name || '').trim()
      const ln = (p.last_name || '').trim()
      const full = `${fn} ${ln}`.trim()
      return full || 'Ohne Namen'
    },
    []
  )

  // Anwesenheit toggeln (going <-> declined) und SOFORT speichern (upsert)
  async function toggleAttendance(userId: string) {
    if (!Number.isFinite(idNum)) return
    const prev = attendingMap[userId] || 'declined'
    const next: AttStatus = prev === 'going' ? 'declined' : 'going'

    // Optimistisches Update
    setAttendingMap(m => ({ ...m, [userId]: next }))

    try {
      const { error } = await supabase
        .from('stammtisch_participants')
        .upsert(
          [{ stammtisch_id: idNum, auth_user_id: userId, status: next }],
          { onConflict: 'stammtisch_id,auth_user_id' }
        )
      if (error) throw error
    } catch (e: any) {
      console.error('toggleAttendance Fehler:', e.message)
      // Revert bei Fehler
      setAttendingMap(m => ({ ...m, [userId]: prev }))
      Alert.alert('Fehler', 'Konnte Anwesenheit nicht speichern.')
    }
  }

  // Geburtstags-Runde „gegeben“ → älteste offene Runde abschließen (für DIESEN Stammtisch)
  async function settleRoundForUser(userId: string) {
    if (!Number.isFinite(idNum) || !date) return
    const dueMonth = firstOfMonth(date)
    const candidates = dueRounds
      .filter(r => r.auth_user_id === userId && r.due_month <= dueMonth && r.settled_stammtisch_id == null)
      .sort((a, b) => a.due_month.localeCompare(b.due_month))
    if (candidates.length === 0) return

    const target = candidates[0]
    // Optimistisch aus der offenen Liste entfernen
    setDueRounds(list => list.filter(r => r.id !== target.id))

    try {
      const { error } = await supabase
        .from('birthday_rounds')
        .update({ settled_stammtisch_id: idNum, settled_at: new Date().toISOString() })
        .eq('id', target.id)
      if (error) throw error

      // Spender-Liste optimistisch ergänzen
      setDonors(prev => [...prev, { auth_user_id: userId, settled_at: new Date().toISOString() }])
    } catch (e: any) {
      // Revert bei Fehler
      setDueRounds(list => [...list, target].sort((a, b) => a.due_month.localeCompare(b.due_month)))
      Alert.alert('Fehler', 'Konnte Runde nicht bestätigen.')
    }
  }

  // Format-Helfer
  const monthLabel = (ymd: string) => {
    // erwartet 'YYYY-MM-01'
    const [y, m] = ymd.split('-').map(Number)
    const d = new Date(y, (m || 1) - 1, 1)
    return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  }

  // Avatar-URL
  const avatarUrlFor = (p: Profile | undefined | null) =>
    p?.avatar_url ? `${AVATAR_BASE_URL}/${p.avatar_url}` : null

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 12,
          paddingHorizontal: 12,
          paddingBottom: insets.bottom + NAV_BAR_BASE_HEIGHT + 12,
        }}
      >
        <Text style={type.h1}>Stammtisch bearbeiten</Text>

        {loading ? (
          <Text style={type.body}>Lade…</Text>
        ) : error ? (
          <>
            <Text style={{ ...type.body, color: colors.red, marginBottom: 12 }}>{error}</Text>
            <Button title="Zurück" onPress={() => router.back()} />
          </>
        ) : (
          <>
            {/* Datum */}
            <View
              style={{
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                marginTop: 8,
              }}
            >
              <Text style={{ ...type.caption, marginBottom: 8 }}>Datum</Text>
              <Calendar
                initialDate={initialDate}
                markedDates={marked}
                onDayPress={(day) => setDate(day.dateString)}
                theme={calendarTheme}
                enableSwipeMonths
              />
              <View style={{ marginTop: 8 }}>
                <Text style={type.body}>Ausgewählt: {date || '–'}</Text>
              </View>
            </View>

            {/* Ort */}
            <View style={{ gap: 8, marginTop: 12 }}>
              <Text style={type.caption}>Ort</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Ort"
                placeholderTextColor={colors.gold}
                style={{
                  borderWidth: 1,
                  borderColor: colors.gold,
                  padding: 10,
                  borderRadius: radius.lg,
                  color: colors.gold,
                  backgroundColor: colors.cardBg,
                }}
              />
            </View>

            {/* Notizen */}
            <View style={{ gap: 8, marginTop: 12 }}>
              <Text style={type.caption}>Notizen</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notizen"
                placeholderTextColor={colors.gold}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: colors.gold,
                  padding: 10,
                  borderRadius: radius.lg,
                  color: colors.gold,
                  minHeight: 120,
                  backgroundColor: colors.cardBg,
                }}
              />
            </View>

            {/* Edle Spender des Monats */}
            <View
              style={{
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                marginTop: 12,
              }}
            >
              <Text style={{ ...type.caption, marginBottom: 8 }}>
                Edle Spender des Monats
              </Text>

              {loadingDonors ? (
                <View style={{ padding: 8, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.gold} />
                </View>
              ) : donors.length === 0 ? (
                <Text style={type.body}>Noch keine Runde gegeben.</Text>
              ) : (
                <View style={{ gap: 8 }}>
                  {donors.map((d, idx) => {
                    const p = profiles.find(x => x.auth_user_id === d.auth_user_id)
                    const name = p ? nameOf(p) : d.auth_user_id
                    const avatar = avatarUrlFor(p)
                    return (
                      <View
                        key={`${d.auth_user_id}-${idx}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          paddingVertical: 8,
                        }}
                      >
                        {avatar ? (
                          <Image
                            source={{ uri: avatar }}
                            style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: colors.border,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: colors.text, fontSize: 12 }}>🥂</Text>
                          </View>
                        )}
                        <Text style={type.body}>{name}</Text>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>

            {/* Teilnehmer */}
            <View
              style={{
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                marginTop: 12,
              }}
            >
              <Text style={{ ...type.caption, marginBottom: 8 }}>Teilnehmer</Text>

              {loadingAtt ? (
                <View style={{ padding: 8, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.gold} />
                </View>
              ) : profiles.length === 0 ? (
                <Text style={type.body}>Keine Nutzer gefunden.</Text>
              ) : (
                <View>
                  {profiles.map((p) => {
                    const st = attendingMap[p.auth_user_id] || 'declined'
                    const isGoing = st === 'going'
                    return (
                      <Pressable
                        key={p.auth_user_id}
                        onPress={() => toggleAttendance(p.auth_user_id)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={type.body}>{nameOf(p)}</Text>

                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isGoing ? colors.gold : colors.border,
                            backgroundColor: isGoing ? colors.gold : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isGoing ? (
                            <Text style={{ color: colors.bg, fontWeight: 'bold' }}>✓</Text>
                          ) : null}
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              )}
            </View>

            {/* Geburtstags-Runden (offen, mit Carry-over) */}
            <View
              style={{
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                marginTop: 12,
              }}
            >
              <Text style={{ ...type.caption, marginBottom: 8 }}>
                Geburtstags-Runden (offen bis einschl. {date ? monthLabel(firstOfMonth(date)) : '–'})
              </Text>

              {loadingRounds ? (
                <View style={{ padding: 8, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.gold} />
                </View>
              ) : roundsErr ? (
                <Text style={{ ...type.body, color: colors.red }}>{roundsErr}</Text>
              ) : dueRounds.length === 0 ? (
                <Text style={type.body}>Keine fälligen Runden.</Text>
              ) : (
                <View>
                  {dueRounds.map((r) => {
                    const p = profiles.find(x => x.auth_user_id === r.auth_user_id)
                    const label = p ? nameOf(p) : r.auth_user_id
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => settleRoundForUser(r.auth_user_id)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={type.body}>{label}</Text>
                          <Text style={type.caption}>fällig: {monthLabel(r.due_month)}</Text>
                        </View>
                        <View
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.gold,
                            backgroundColor: colors.cardBg,
                          }}
                        >
                          <Text style={{ color: colors.gold, fontFamily: type.bold }}>Gegeben ✓</Text>
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              )}
            </View>

            {/* Aktionen */}
            <View style={{ gap: 10, marginTop: 16 }}>
              <Button title={saving ? 'Speichere…' : 'Speichern'} onPress={save} disabled={saving} />
              <Button title="Zurück" onPress={() => router.back()} />
              <View style={{ height: 8 }} />
              <Button color="#B00020" title={deleting ? 'Lösche…' : 'Eintrag löschen'} onPress={confirmDelete} />
            </View>

            {status ? <Text style={{ ...type.body, color: colors.gold, marginTop: 8 }}>{status}</Text> : null}
            {error ? <Text style={{ ...type.body, color: colors.red, marginTop: 4 }}>{error}</Text> : null}
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
