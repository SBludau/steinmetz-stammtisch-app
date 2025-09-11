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
type Degree = 'none' | 'dr' | 'prof' | null
type Role = 'member' | 'superuser' | 'admin'
type Profile = {
  auth_user_id: string
  first_name: string | null
  middle_name?: string | null
  last_name: string | null
  degree?: Degree
  birthday?: string | null
  avatar_url: string | null
}

// Helpers
const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const firstOfMonth = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}-${m}-01`
}
const germanMonthYear = (iso: string) => {
  if (!iso) return '–'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}
const germanDate = (iso: string) => {
  if (!iso) return '–'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}
const ageOnDate = (birthdayIso: string, refIso: string) => {
  const [by, bm, bd] = birthdayIso.split('-').map(Number)
  const [ry, rm, rd] = refIso.split('-').map(Number)
  let age = ry - by
  if (rm < bm || (rm === bm && rd < bd)) age -= 1
  return age
}
const degPrefix = (d?: Degree) => (d === 'dr' ? 'Dr. ' : d === 'prof' ? 'Prof. ' : '')

const AVATAR_BASE_URL =
  'https://bcbqnkycjroiskwqcftc.supabase.co/storage/v1/object/public/avatars'

export default function StammtischEditScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams()
  const raw = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const idNum = Number(raw)

  const [row, setRow] = useState<Row | null>(null)
  const [date, setDate] = useState('')         // YYYY-MM-DD
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  // Teilnehmer-Status
  type AttStatus = 'going' | 'declined' | 'maybe'
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [attendingMap, setAttendingMap] = useState<Record<string, AttStatus>>({})
  const [loadingAtt, setLoadingAtt] = useState(true)
  const [participantsCollapsed, setParticipantsCollapsed] = useState(false)

  // Rolle für Löschbutton
  const [myRole, setMyRole] = useState<Role>('member')
  const isAdmin = myRole === 'admin'

  // Geburtstags-Runden
  type BR = { id: number; auth_user_id: string; due_month: string; settled_stammtisch_id: number | null }
  const [dueRounds, setDueRounds] = useState<BR[]>([])
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [roundsErr, setRoundsErr] = useState<string | null>(null)

  // Edle Spender
  type Donor = { auth_user_id: string; settled_at: string | null }
  const [donors, setDonors] = useState<Donor[]>([])
  const [loadingDonors, setLoadingDonors] = useState(true)

  // load event
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

  // role
  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u?.user?.id
      if (!uid) return
      const { data: me } = await supabase.from('profiles').select('role').eq('auth_user_id', uid).maybeSingle()
      setMyRole(((me?.role as Role) ?? 'member'))
    })()
  }, [])

  // participants
  const loadParticipants = useCallback(async () => {
    if (!Number.isFinite(idNum)) return
    setLoadingAtt(true)
    try {
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('auth_user_id, first_name, middle_name, last_name, degree, birthday, avatar_url')
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
      for (const p of list) map[p.auth_user_id] = 'declined'
      for (const row of parts ?? []) map[row.auth_user_id as string] = (row.status as AttStatus) || 'declined'
      setAttendingMap(map)
    } catch (e: any) {
      console.error('Teilnehmer laden Fehler:', e.message)
    } finally {
      setLoadingAtt(false)
    }
  }, [idNum])

  // rounds
  const loadBirthdayRounds = useCallback(async () => {
    setLoadingRounds(true)
    setRoundsErr(null)
    try {
      if (!Number.isFinite(idNum) || !date) {
        setDueRounds([])
        return
      }
      const dueMonth = firstOfMonth(date)
      try {
        await supabase.rpc('seed_birthday_rounds', { p_due_month: dueMonth, p_stammtisch_id: idNum })
      } catch { /* ignore */ }

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

  // donors
  const loadDonors = useCallback(async () => {
    setLoadingDonors(true)
    try {
      if (!Number.isFinite(idNum)) { setDonors([]); return }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id, settled_stammtisch_id, settled_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: true })
      if (error) throw error
      setDonors((data ?? []).map(d => ({ auth_user_id: d.auth_user_id as string, settled_at: d.settled_at as string | null })))
    } catch {
      setDonors([])
    } finally {
      setLoadingDonors(false)
    }
  }, [idNum])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadParticipants() }, [loadParticipants])
  useEffect(() => { loadBirthdayRounds() }, [loadBirthdayRounds])
  useEffect(() => { loadDonors() }, [loadDonors])

  async function save() {
    if (!Number.isFinite(idNum)) { setError('Ungültige ID.'); return }
    try {
      setSaving(true); setStatus(null); setError(null)
      const { error } = await supabase.from('stammtisch').update({ date, location, notes }).eq('id', idNum)
      if (error) throw error
      setStatus('Gespeichert.')
      await supabase.channel('client-refresh').send({ type: 'broadcast', event: 'stammtisch-saved', payload: { id: idNum } })
      await loadBirthdayRounds()
    } catch (e: any) {
      setError(e?.message ?? 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete() {
    if (!Number.isFinite(idNum)) { Alert.alert('Fehler', 'Ungültige ID.'); return }
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
              const { error } = await supabase.from('stammtisch').delete().eq('id', idNum)
              if (error) throw error
              await supabase.channel('client-refresh').send({ type: 'broadcast', event: 'stammtisch-saved', payload: { id: idNum } })
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

  // calendar theme
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

  // name + avatar helpers
  const fullName = useMemo(
    () => (p: Profile) => {
      const fn = (p.first_name || '').trim()
      const mid = p.middle_name ? ` ${p.middle_name.trim()}` : ''
      const ln = (p.last_name || '').trim()
      return `${degPrefix(p.degree)}${fn}${mid} ${ln}`.trim() || 'Ohne Namen'
    },
    []
  )
  const avatarUrlFor = (p: Profile | undefined | null) =>
    p?.avatar_url ? `${AVATAR_BASE_URL}/${p.avatar_url}` : null

  // attendance toggle
  async function toggleAttendance(userId: string) {
    if (!Number.isFinite(idNum)) return
    const prev = attendingMap[userId] || 'declined'
    const next: AttStatus = prev === 'going' ? 'declined' : 'going'
    setAttendingMap(m => ({ ...m, [userId]: next }))
    try {
      const { error } = await supabase
        .from('stammtisch_participants')
        .upsert([{ stammtisch_id: idNum, auth_user_id: userId, status: next }], { onConflict: 'stammtisch_id,auth_user_id' })
      if (error) throw error
    } catch {
      setAttendingMap(m => ({ ...m, [userId]: prev }))
      Alert.alert('Fehler', 'Konnte Anwesenheit nicht speichern.')
    }
  }

  // settle or create&settle
  async function givenCurrentOrOverdue(userId: string, roundId?: number) {
    if (!Number.isFinite(idNum) || !date) return
    const attending = (attendingMap[userId] || 'declined') === 'going'
    if (!attending) {
      Alert.alert('Hinweis', 'Runden können nur von anwesenden Mitgliedern gegeben werden.')
      return
    }
    try {
      if (roundId) {
        const { error } = await supabase
          .from('birthday_rounds')
          .update({ settled_stammtisch_id: idNum, settled_at: new Date().toISOString() })
          .eq('id', roundId)
        if (error) throw error
      } else {
        const due = firstOfMonth(date)
        const { error } = await supabase
          .from('birthday_rounds')
          .insert([{ auth_user_id: userId, due_month: due, settled_stammtisch_id: idNum, settled_at: new Date().toISOString() }])
        if (error) throw error
      }
      await loadDonors()
      await loadBirthdayRounds()
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

  // extra rounds
  async function giveExtraRound() {
    if (!Number.isFinite(idNum) || !date) return
    const { data: sess } = await supabase.auth.getUser()
    const uid = sess?.user?.id
    if (!uid) { Alert.alert('Fehler', 'Nicht eingeloggt.'); return }
    if ((attendingMap[uid] || 'declined') !== 'going') {
      Alert.alert('Hinweis', 'Extra-Runden können nur gegeben werden, wenn du anwesend bist.')
      return
    }

    const base = new Date(date + 'T00:00:00')
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
    const tryInsert = async (dayOffset: number) => {
      const d = new Date(base.getFullYear(), base.getMonth(), 1 + dayOffset)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(Math.min(d.getDate(), daysInMonth)).padStart(2, '0')
      const due = `${yyyy}-${mm}-${dd}`
      const { error } = await supabase
        .from('birthday_rounds')
        .insert([{ auth_user_id: uid, due_month: due, settled_stammtisch_id: idNum, settled_at: new Date().toISOString() }])
      return error
    }

    try {
      let err = await tryInsert(0)
      let step = 1
      while (err && step < 5) {
        const msg = (err as any)?.message?.toLowerCase?.() || ''
        if (!(msg.includes('duplicate') || msg.includes('unique') || (err as any)?.code === '23505')) break
        err = await tryInsert(step)
        step += 1
      }
      if (err) throw err
      await loadDonors()
      await loadBirthdayRounds()
      Alert.alert('Danke!', 'Runde wurde verbucht.')
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

  // derived for lists
  const currentMonthKey = date ? firstOfMonth(date) : ''
  const currentMonth = date ? date.slice(5,7) : ''
  const currentMonthBirthdays = useMemo(() => {
    if (!date) return []
    return profiles
      .filter(p => !!p.birthday && (p.birthday as string).slice(5,7) === currentMonth)
      .sort((a, b) =>
        (a.last_name || '').localeCompare((b.last_name || ''), 'de', { sensitivity: 'base' }) ||
        (a.first_name || '').localeCompare((b.first_name || ''), 'de', { sensitivity: 'base' })
      )
  }, [profiles, date, currentMonth])

  const openCurrentMap = useMemo(() => {
    const map = new Map<string, BR>()
    for (const r of dueRounds) { if (r.due_month === currentMonthKey) map.set(r.auth_user_id, r) }
    return map
  }, [dueRounds, currentMonthKey])

  const overdueRounds = useMemo(() => {
    return dueRounds.filter(r => r.due_month < currentMonthKey)
  }, [dueRounds, currentMonthKey])

  // small "Gegeben" button (always pressable; checks attendance inside)
  const SmallGivenBtn = ({ onPress, highlight }: { onPress: () => void; highlight?: boolean }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: highlight ? colors.gold : colors.border,
        backgroundColor: colors.cardBg,
      }}
    >
      <Text style={{ color: highlight ? colors.gold : '#999', fontFamily: type.bold }}>Gegeben</Text>
    </Pressable>
  )

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
          <Text style={{ ...type.body, color: colors.red, marginTop: 12 }}>{error}</Text>
        ) : (
          <>
            {/* OBERER BLOCK – rote Rahmen-Box, darin 3 Spalten die gleich hoch sind (Höhe vom Kalender) */}
            <View
              style={{
                marginTop: 8,
                borderWidth: 2,
                borderColor: '#B00020',
                borderRadius: radius.lg,
                padding: 8,
                backgroundColor: 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'stretch' }}>
                {/* Kalender */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: radius.md,
                    backgroundColor: colors.cardBg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 10,
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

                {/* Geburtstags-Runden */}
                <View
                  style={{
                    flex: 1,
                    borderRadius: radius.md,
                    backgroundColor: colors.cardBg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 10,
                  }}
                >
                  <Text style={{ ...type.caption, marginBottom: 8 }}>
                    Geburtstags-Runden – {date ? germanMonthYear(firstOfMonth(date)) : '–'}
                  </Text>

                  {loadingRounds ? (
                    <View style={{ padding: 8, alignItems: 'center' }}>
                      <ActivityIndicator color={colors.gold} />
                    </View>
                  ) : roundsErr ? (
                    <Text style={{ ...type.body, color: colors.red }}>{roundsErr}</Text>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {/* Diesen Monat */}
                      <Text style={{ ...type.body, fontWeight: '600' }}>Diesen Monat</Text>
                      {currentMonthBirthdays.length === 0 ? (
                        <Text style={type.body}>Niemand hat Geburtstag.</Text>
                      ) : (
                        currentMonthBirthdays.map(p => {
                          const open = openCurrentMap.get(p.auth_user_id) || null
                          const attending = (attendingMap[p.auth_user_id] || 'declined') === 'going'
                          return (
                            <View
                              key={p.auth_user_id}
                              style={{
                                paddingVertical: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                {avatarUrlFor(p) ? (
                                  <Image
                                    source={{ uri: avatarUrlFor(p)! }}
                                    style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
                                  />
                                ) : (
                                  <View
                                    style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    <Text style={{ color: colors.text, fontSize: 12 }}>🎂</Text>
                                  </View>
                                )}
                                <View style={{ flex: 1 }}>
                                  <Text style={type.body}>{fullName(p)}</Text>
                                  <Text style={type.caption}>
                                    {p.birthday ? `${germanDate(p.birthday)} – ${ageOnDate(p.birthday, date)} Jahre` : '—'}
                                  </Text>
                                </View>
                              </View>
                              <SmallGivenBtn
                                highlight={attending}
                                onPress={() => givenCurrentOrOverdue(p.auth_user_id, open?.id)}
                              />
                            </View>
                          )
                        })
                      )}

                      {/* Überfällig */}
                      <Text style={{ ...type.body, fontWeight: '600', marginTop: 6 }}>Überfällig</Text>
                      {overdueRounds.length === 0 ? (
                        <Text style={type.body}>Keine offenen Runden aus Vormonaten.</Text>
                      ) : (
                        overdueRounds.map(r => {
                          const p = profiles.find(x => x.auth_user_id === r.auth_user_id)
                          const attending = (attendingMap[r.auth_user_id] || 'declined') === 'going'
                          return (
                            <View
                              key={r.id}
                              style={{
                                paddingVertical: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                {avatarUrlFor(p || null) ? (
                                  <Image
                                    source={{ uri: avatarUrlFor(p || null)! }}
                                    style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
                                  />
                                ) : (
                                  <View
                                    style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    <Text style={{ color: colors.text, fontSize: 12 }}>🎁</Text>
                                  </View>
                                )}
                                <View style={{ flex: 1 }}>
                                  <Text style={type.body}>{p ? fullName(p) : r.auth_user_id}</Text>
                                  <Text style={type.caption}>fällig: {germanMonthYear(r.due_month)}</Text>
                                </View>
                              </View>
                              <SmallGivenBtn
                                highlight={attending}
                                onPress={() => givenCurrentOrOverdue(r.auth_user_id, r.id)}
                              />
                            </View>
                          )
                        })
                      )}
                    </View>
                  )}
                </View>

                {/* Spender + runder Extra-Button */}
                <View style={{ flex: 1, gap: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      borderRadius: radius.md,
                      backgroundColor: colors.cardBg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                    }}
                  >
                    <Text style={{ ...type.caption, marginBottom: 8 }}>Edle Spender dieses Stammtischs</Text>
                    {loadingDonors ? (
                      <View style={{ padding: 8, alignItems: 'center' }}>
                        <ActivityIndicator color={colors.gold} />
                      </View>
                    ) : donors.length === 0 ? (
                      <Text style={type.body}>Noch keine Runde gegeben.</Text>
                    ) : (
                      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 6 }} showsVerticalScrollIndicator>
                        {donors.map((d, idx) => {
                          const p = profiles.find(x => x.auth_user_id === d.auth_user_id)
                          const name = p ? fullName(p) : d.auth_user_id
                          const avatar = avatarUrlFor(p || null)
                          return (
                            <View
                              key={`${d.auth_user_id}-${idx}`}
                              style={{
                                flexDirection: 'row', alignItems: 'center', gap: 10,
                                borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8,
                              }}
                            >
                              {avatar ? (
                                <Image
                                  source={{ uri: avatar }}
                                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
                                />
                              ) : (
                                <View
                                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Text style={{ color: colors.text, fontSize: 12 }}>🥂</Text>
                                </View>
                              )}
                              <Text style={type.body}>{name}</Text>
                            </View>
                          )
                        })}
                      </ScrollView>
                    )}
                  </View>

                  <View
                    style={{
                      borderRadius: radius.md,
                      backgroundColor: colors.cardBg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                    }}
                  >
                    <Pressable
                      onPress={giveExtraRound}
                      style={{
                        width: 120, height: 120, borderRadius: 60,
                        borderWidth: 2, borderColor: colors.gold,
                        backgroundColor: '#B00020',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: colors.gold, fontFamily: type.bold, textAlign: 'center' }}>
                        Eine{'\n'}Runde{'\n'}geben
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            {/* UNTERER BLOCK – große rote Box über die volle Breite */}
            <View
              style={{
                marginTop: 12,
                borderWidth: 2,
                borderColor: '#B00020',
                borderRadius: radius.lg,
                padding: 8,
                backgroundColor: 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                {/* Felder links (2/3) */}
                <View style={{ flex: 2 }}>
                  <View style={{ gap: 8 }}>
                    <Text style={type.caption}>Ort</Text>
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Ort"
                      placeholderTextColor={colors.gold}
                      style={{
                        borderWidth: 1, borderColor: colors.gold, padding: 10,
                        borderRadius: radius.lg, color: colors.gold, backgroundColor: colors.cardBg,
                      }}
                    />
                  </View>

                  <View style={{ gap: 8, marginTop: 12 }}>
                    <Text style={type.caption}>Geniale Ideen für die Nachwelt</Text>
                    <TextInput
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Notizen"
                      placeholderTextColor={colors.gold}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      style={{
                        borderWidth: 1, borderColor: colors.gold, padding: 10,
                        borderRadius: radius.lg, color: colors.gold, minHeight: 120, backgroundColor: colors.cardBg,
                      }}
                    />
                  </View>
                </View>

                {/* Speichern rechts (1/3) */}
                <View style={{ flex: 1 }}>
                  <Pressable
                    onPress={save}
                    disabled={saving}
                    style={{
                      borderRadius: radius.md,
                      borderWidth: 2,
                      borderColor: colors.gold,
                      backgroundColor: '#B00020',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12,
                      minHeight: 180,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: colors.gold, fontFamily: type.bold, fontSize: 18 }}>
                      {saving ? 'Speichere…' : 'Speichern'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Teilnehmer (minimierbar) */}
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
              <Pressable
                onPress={() => setParticipantsCollapsed(v => !v)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ ...type.caption, marginBottom: participantsCollapsed ? 0 : 8 }}>Teilnehmer</Text>
                <Text style={type.caption}>{participantsCollapsed ? 'aufklappen ▾' : 'zuklappen ▴'}</Text>
              </Pressable>

              {!participantsCollapsed && (
                <>
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
                            <Text style={type.body}>{fullName(p)}</Text>
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
                              {isGoing ? <Text style={{ color: colors.bg, fontWeight: 'bold' }}>✓</Text> : null}
                            </View>
                          </Pressable>
                        )
                      })}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* unten: Löschen (nur Admin) */}
            <View style={{ gap: 10, marginTop: 16, marginBottom: 6 }}>
              {isAdmin ? (
                <Button color="#B00020" title={deleting ? 'Lösche…' : 'Eintrag löschen'} onPress={confirmDelete} />
              ) : null}
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
