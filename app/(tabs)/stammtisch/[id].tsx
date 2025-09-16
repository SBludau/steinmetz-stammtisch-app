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
  id: number
  auth_user_id: string | null
  first_name: string | null
  middle_name?: string | null
  last_name: string | null
  degree?: Degree
  birthday?: string | null
  avatar_url: string | null
  is_active?: boolean | null
}

type AttStatus = 'going' | 'declined' | 'maybe'
type BR = { id: number; auth_user_id: string; due_month: string; settled_stammtisch_id: number | null; approved_at?: string | null }

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

  // Teilnehmer (verknüpft & unverknüpft)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [attLinked, setAttLinked] = useState<Record<string, AttStatus>>({})
  const [attUnlinked, setAttUnlinked] = useState<Record<number, AttStatus>>({})
  const [loadingAtt, setLoadingAtt] = useState(true)
  const [participantsCollapsed, setParticipantsCollapsed] = useState(false)

  // Kalender einklappbar
  const [calendarCollapsed, setCalendarCollapsed] = useState(true)

  // Rollen/Moderation
  const [myRole, setMyRole] = useState<Role>('member')
  const isAdmin = myRole === 'admin' || myRole === 'superuser'

  // Offene Geburtstags-Runden (fällige)
  const [dueRounds, setDueRounds] = useState<BR[]>([])
  const [loadingRounds, setLoadingRounds] = useState(true)
  const [roundsErr, setRoundsErr] = useState<string | null>(null)

  // Gegebene Runden (dieser Stammtisch)
  type Donor = { id: number; auth_user_id: string; settled_at: string | null; approved_at?: string | null }
  const [donors, setDonors] = useState<Donor[]>([])
  const [loadingDonors, setLoadingDonors] = useState(true)

  // Moderation (alle Runden dieses Stammtischs)
  const [moderation, setModeration] = useState<Donor[]>([])
  const [loadingModeration, setLoadingModeration] = useState(true)

  // nur am Tag + Folgetag erlauben
  const isWithinGivingWindow = useMemo(() => {
    if (!date) return false
    const eventStart = new Date(date + 'T00:00:00')
    const eventEnd = new Date(eventStart)
    eventEnd.setDate(eventEnd.getDate() + 1)          // +1 Tag
    eventEnd.setHours(23, 59, 59, 999)
    const now = new Date()
    return now >= eventStart && now <= eventEnd
  }, [date])

  // Stammtisch laden
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
      if (!data) { setError('Eintrag nicht gefunden.'); return }
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

  // Rolle
  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u?.user?.id
      if (!uid) return
      const { data: me } = await supabase.from('profiles').select('role').eq('auth_user_id', uid).maybeSingle()
      setMyRole(((me?.role as Role) ?? 'member'))
    })()
  }, [])

  // Teilnehmer laden
  const loadParticipants = useCallback(async () => {
    if (!Number.isFinite(idNum)) return
    setLoadingAtt(true)
    try {
      // aktive Profile (inkl. unverknüpft)
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('id, auth_user_id, first_name, middle_name, last_name, degree, birthday, avatar_url, is_active')
        .eq('is_active', true)
        .order('last_name', { ascending: true })
      if (pErr) throw pErr
      const list = (profs ?? []) as Profile[]
      setProfiles(list)

      // verknüpfte Teilnehmer
      const { data: partsLinked, error: aErr } = await supabase
        .from('stammtisch_participants')
        .select('auth_user_id, status')
        .eq('stammtisch_id', idNum)
      if (aErr) throw aErr
      const linkedMap: Record<string, AttStatus> = {}
      for (const row of partsLinked ?? []) {
        if (row.auth_user_id) linkedMap[row.auth_user_id as string] = (row.status as AttStatus) || 'declined'
      }

      // unverknüpfte Teilnehmer
      const { data: partsUnlinked, error: uErr } = await supabase
        .from('stammtisch_participants_unlinked')
        .select('profile_id, status')
        .eq('stammtisch_id', idNum)
      if (uErr) throw uErr
      const unlinkedMap: Record<number, AttStatus> = {}
      for (const row of partsUnlinked ?? []) {
        unlinkedMap[(row as any).profile_id as number] = ((row as any).status as AttStatus) || 'declined'
      }

      setAttLinked(linkedMap)
      setAttUnlinked(unlinkedMap)
    } catch (e: any) {
      console.error('Teilnehmer laden Fehler:', e.message)
    } finally {
      setLoadingAtt(false)
    }
  }, [idNum])

  // Offene Geburtstags-Runden (zum „Gegeben“)
  const loadBirthdayRounds = useCallback(async () => {
    setLoadingRounds(true)
    setRoundsErr(null)
    try {
      if (!Number.isFinite(idNum) || !date) { setDueRounds([]); return }
      const dueMonth = firstOfMonth(date)
      try { await supabase.rpc('seed_birthday_rounds', { p_due_month: dueMonth, p_stammtisch_id: idNum }) } catch {}

      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, due_month, settled_stammtisch_id, approved_at')
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

  // Gegebene Runden dieses Stammtischs
  const loadDonors = useCallback(async () => {
    setLoadingDonors(true)
    try {
      if (!Number.isFinite(idNum)) { setDonors([]); return }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, settled_stammtisch_id, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: true })
      if (error) throw error
      setDonors(((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: d.auth_user_id as string,
        settled_at: d.settled_at as string | null,
        approved_at: d.approved_at as string | null,
      })))
    } catch {
      setDonors([])
    } finally {
      setLoadingDonors(false)
    }
  }, [idNum])

  // Moderation (alle gegebenen Runden dieses Stammtischs)
  const loadModeration = useCallback(async () => {
    setLoadingModeration(true)
    try {
      if (!Number.isFinite(idNum)) { setModeration([]); return }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: false })
      if (error) throw error
      setModeration(((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: d.auth_user_id as string,
        settled_at: d.settled_at as string | null,
        approved_at: d.approved_at as string | null,
      })))
    } catch {
      setModeration([])
    } finally {
      setLoadingModeration(false)
    }
  }, [idNum])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadParticipants() }, [loadParticipants])
  useEffect(() => { loadBirthdayRounds() }, [loadBirthdayRounds])
  useEffect(() => { loadDonors() }, [loadDonors])
  useEffect(() => { if (isAdmin) loadModeration() }, [isAdmin, loadModeration])

  // Speichern
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

  // Löschen: immer RPC (SECURITY DEFINER) verwenden – zuverlässiger für Admin/SU
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
              const { error: rpcErr } = await supabase.rpc('admin_delete_stammtisch', { p_id: idNum })
              if (rpcErr) throw rpcErr

              await supabase
                .channel('client-refresh')
                .send({ type: 'broadcast', event: 'stammtisch-saved', payload: { id: idNum } })

              router.back()
            } catch (e: any) {
              Alert.alert('Fehler', e?.message ?? 'Löschen fehlgeschlagen (RPC nicht vorhanden oder RLS?).')
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  // Calendar theme
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

  // Name + Avatar
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

  // Toggle attendance (linked)
  async function toggleAttendanceLinked(userId: string) {
    if (!Number.isFinite(idNum)) return
    const prev = attLinked[userId] || 'declined'
    const next: AttStatus = prev === 'going' ? 'declined' : 'going'
    setAttLinked(m => ({ ...m, [userId]: next }))
    try {
      const { error } = await supabase
        .from('stammtisch_participants')
        .upsert([{ stammtisch_id: idNum, auth_user_id: userId, status: next }], { onConflict: 'stammtisch_id,auth_user_id' })
      if (error) throw error
    } catch {
      setAttLinked(m => ({ ...m, [userId]: prev }))
      Alert.alert('Fehler', 'Konnte Anwesenheit nicht speichern.')
    }
  }

  // Toggle attendance (unlinked)
  async function toggleAttendanceUnlinked(profileId: number) {
    if (!Number.isFinite(idNum)) return
    const prev = attUnlinked[profileId] || 'declined'
    const next: AttStatus = prev === 'going' ? 'declined' : 'going'
    setAttUnlinked(m => ({ ...m, [profileId]: next }))
    try {
      const { error } = await supabase
        .from('stammtisch_participants_unlinked')
        .upsert([{ stammtisch_id: idNum, profile_id: profileId, status: next }], { onConflict: 'stammtisch_id,profile_id' })
      if (error) throw error
    } catch {
      setAttUnlinked(m => ({ ...m, [profileId]: prev }))
      Alert.alert('Fehler', 'Konnte Anwesenheit nicht speichern (unverknüpft).')
    }
  }

  // „Gegeben“ (nur im Zeitfenster)
  async function givenCurrentOrOverdue(userId: string, roundId?: number) {
    if (!Number.isFinite(idNum) || !date) return
    if (!isWithinGivingWindow) {
      Alert.alert('Nicht möglich', 'Runden dürfen nur am Stammtisch-Tag und am Folgetag verbucht werden.')
      return
    }
    const attending = (attLinked[userId] || 'declined') === 'going'
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
      if (isAdmin) await loadModeration()
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

  // Extra-Runde (nur im Zeitfenster)
  async function giveExtraRound() {
    if (!Number.isFinite(idNum) || !date) return
    if (!isWithinGivingWindow) {
      Alert.alert('Nicht möglich', 'Extra-Runden nur am Stammtisch-Tag und am Folgetag.')
      return
    }
    const { data: sess } = await supabase.auth.getUser()
    const uid = sess?.user?.id
    if (!uid) { Alert.alert('Fehler', 'Nicht eingeloggt.'); return }
    if ((attLinked[uid] || 'declined') !== 'going') {
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
      if (isAdmin) await loadModeration()
      Alert.alert('Danke!', 'Runde wurde verbucht.')
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

  // abgeleitete Helfer
  const currentMonthKey = date ? firstOfMonth(date) : ''
  const currentMonth = date ? date.slice(5,7) : ''
  const currentMonthBirthdays = useMemo(() => {
    if (!date) return []
    // nur verknüpfte (FK auf birthday_rounds)
    return profiles
      .filter(p => !!p.auth_user_id)
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

  const Box = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        borderRadius: radius.md,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 10,
        marginTop: 10,
      }}
    >
      {children}
    </View>
  )

  const activeProfiles = useMemo(
    () => profiles.filter(p => p.is_active !== false),
    [profiles]
  )

  // nur bestätigte Spender oben anzeigen
  const approvedDonors = useMemo(
    () => donors.filter(d => !!d.approved_at),
    [donors]
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
            {/* Kalender – einklappbar */}
            <Box>
              <Pressable
                onPress={() => setCalendarCollapsed(v => !v)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}
              >
                <Text style={type.caption}>Datum</Text>
                <Text style={type.caption}>{calendarCollapsed ? '▸' : '▾'}</Text>
              </Pressable>

              {!calendarCollapsed && (
                <>
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
                </>
              )}

              {calendarCollapsed && (
                <View style={{ marginTop: 4 }}>
                  <Text style={type.body}>Ausgewählt: {date || '–'}</Text>
                </View>
              )}
            </Box>

            {/* Geburtstags-Runden (Erfassung bleibt sichtbar) */}
            <Box>
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
                  <Text style={{ ...type.body, fontWeight: '600' }}>Diesen Monat</Text>
                  {currentMonthBirthdays.length === 0 ? (
                    <Text style={type.body}>Niemand hat Geburtstag.</Text>
                  ) : (
                    currentMonthBirthdays.map(p => {
                      const open = p.auth_user_id ? openCurrentMap.get(p.auth_user_id) || null : null
                      const attending = p.auth_user_id ? (attLinked[p.auth_user_id] || 'declined') === 'going' : false
                      return (
                        <View
                          key={p.auth_user_id ?? `unlinked-${p.id}`}
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
                          {p.auth_user_id ? (
                            <Pressable onPress={() => givenCurrentOrOverdue(p.auth_user_id!, open?.id)}>
                              <Text style={{ color: (attending ? colors.gold : '#999') }}>Gegeben</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      )
                    })
                  )}

                  <Text style={{ ...type.body, fontWeight: '600', marginTop: 6 }}>Überfällig</Text>
                  {overdueRounds.length === 0 ? (
                    <Text style={type.body}>Keine offenen Runden aus Vormonaten.</Text>
                  ) : (
                    overdueRounds.map(r => {
                      const p = profiles.find(x => x.auth_user_id === r.auth_user_id)
                      const attending = (attLinked[r.auth_user_id] || 'declined') === 'going'
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
                          <Pressable onPress={() => givenCurrentOrOverdue(r.auth_user_id, r.id)}>
                            <Text style={{ color: (attending ? colors.gold : '#999') }}>Gegeben</Text>
                          </Pressable>
                        </View>
                      )
                    })
                  )}
                </View>
              )}
            </Box>

            {/* Edle Spender – nur bestätigte anzeigen */}
            <Box>
              <Text style={{ ...type.caption, marginBottom: 8 }}>Edle Spender dieses Stammtischs</Text>
              {loadingDonors ? (
                <View style={{ padding: 8, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.gold} />
                </View>
              ) : approvedDonors.length === 0 ? (
                <Text style={type.body}>Noch keine bestätigten Runden.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ paddingBottom: 6 }} showsVerticalScrollIndicator>
                  {approvedDonors.map((d) => {
                    const p = profiles.find(x => x.auth_user_id === d.auth_user_id)
                    const name = p ? fullName(p) : d.auth_user_id
                    const avatar = avatarUrlFor(p || null)
                    return (
                      <View
                        key={`donor-${d.id}`}
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
            </Box>

            {/* Eine Runde geben – volle Breite, ohne Box */}
            <Pressable
              onPress={giveExtraRound}
              style={{
                marginTop: 10,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: colors.gold,
                backgroundColor: '#B00020',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                alignSelf: 'stretch',
              }}
            >
              <Text style={{ color: colors.gold, fontFamily: type.bold, fontSize: 18 }}>
                Eine Runde geben
              </Text>
            </Pressable>

            {/* Felder + Speichern */}
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
              <View style={{ gap: 12 }}>
                <View style={{ gap: 6 }}>
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

                <View style={{ gap: 6 }}>
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
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: colors.gold, fontFamily: type.bold, fontSize: 18 }}>
                    {saving ? 'Speichere…' : 'Speichern'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Teilnehmer – aktive inkl. unverknüpfte */}
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
                  ) : activeProfiles.length === 0 ? (
                    <Text style={type.body}>Keine aktiven Profile.</Text>
                  ) : (
                    <View>
                      {activeProfiles.map((p) => {
                        const key = p.auth_user_id ?? `unlinked-${p.id}`
                        const isLinked = !!p.auth_user_id
                        const st = isLinked ? (attLinked[p.auth_user_id!] || 'declined') : (attUnlinked[p.id] || 'declined')
                        const isGoing = st === 'going'
                        return (
                          <Pressable
                            key={key}
                            onPress={() => isLinked ? toggleAttendanceLinked(p.auth_user_id!) : toggleAttendanceUnlinked(p.id)}
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

            {/* Moderation – nur Admin/Superuser */}
            {isAdmin && (
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
                <Text style={{ ...type.caption, marginBottom: 8 }}>Runden-Moderation</Text>

                {loadingModeration ? (
                  <ActivityIndicator color={colors.gold} />
                ) : moderation.length === 0 ? (
                  <Text style={type.body}>Keine Runden vorhanden.</Text>
                ) : (
                  <View>
                    {moderation.map((r) => {
                      const p = profiles.find(x => x.auth_user_id === r.auth_user_id)
                      const name = p ? fullName(p) : r.auth_user_id
                      const isApproved = !!r.approved_at
                      return (
                        <View
                          key={`mod-${r.id}`}
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
                          <Text style={type.body}>
                            {name}
                            {isApproved ? ' — bestätigt' : ' — unbestätigt'}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {!isApproved ? (
                              <Pressable
                                onPress={async () => {
                                  try {
                                    const { error } = await supabase.rpc('admin_approve_round', { p_id: r.id })
                                    if (error) throw error
                                    await loadDonors()
                                    await loadModeration()
                                    setStatus('Runde bestätigt.')
                                  } catch (e: any) {
                                    Alert.alert('Fehler', e?.message ?? 'Bestätigung fehlgeschlagen (RLS?).')
                                  }
                                }}
                                style={{
                                  paddingVertical: 6, paddingHorizontal: 10,
                                  borderRadius: 8, borderWidth: 1,
                                  borderColor: colors.border, backgroundColor: colors.cardBg,
                                }}
                              >
                                <Text style={{ color: colors.gold }}>Bestätigen</Text>
                              </Pressable>
                            ) : null}
                            <Pressable
                              onPress={() => {
                                Alert.alert('Löschen?', 'Runde wirklich löschen?', [
                                  { text: 'Abbrechen', style: 'cancel' },
                                  {
                                    text: 'Löschen', style: 'destructive', onPress: async () => {
                                      try {
                                        const { error } = await supabase.rpc('admin_delete_round', { p_id: r.id })
                                        if (error) throw error
                                        await loadDonors()
                                        await loadModeration()
                                        setStatus('Runde gelöscht.')
                                      } catch (e: any) {
                                        Alert.alert('Fehler', e?.message ?? 'Löschen fehlgeschlagen (RLS?).')
                                      }
                                    }
                                  }
                                ])
                              }}
                              style={{
                                paddingVertical: 6, paddingHorizontal: 10,
                                borderRadius: 8, borderWidth: 1,
                                borderColor: colors.border, backgroundColor: colors.cardBg,
                              }}
                            >
                              <Text style={{ color: '#ff6b6b' }}>Löschen</Text>
                            </Pressable>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )}

            {/* unten: Löschen (Admin/SU) */}
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
