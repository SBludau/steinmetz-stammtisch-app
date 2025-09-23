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
type BR = {
  id: number
  auth_user_id: string | null
  profile_id: number | null
  due_month: string
  settled_stammtisch_id: number | null
  approved_at?: string | null
}

const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const firstOfMonth = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}-${m}-01`
}
const addMonths = (yyyyMmDd: string, diff: number) => {
  const d = new Date(yyyyMmDd + 'T00:00:00')
  d.setMonth(d.getMonth() + diff)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
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

const AVATAR_BASE_URL = 'https://bcbqnkycjroiskwqcftc.supabase.co/storage/v1/object/public/avatars'

export default function StammtischEditScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams()
  const raw = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const idNum = Number(raw)

  const [row, setRow] = useState<Row | null>(null)
  const [date, setDate] = useState('') // YYYY-MM-DD
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
  type Donor = {
    id: number
    auth_user_id: string | null
    profile_id: number | null
    due_month: string | null
    settled_at: string | null
    approved_at?: string | null
  }
  const [donors, setDonors] = useState<Donor[]>([])
  const [loadingDonors, setLoadingDonors] = useState(true)

  // Moderation (alle Runden dieses Stammtischs)
  const [moderation, setModeration] = useState<Donor[]>([])
  const [loadingModeration, setLoadingModeration] = useState(true)

  // Zeitfenster-Logik ist für Tests deaktiviert (wir prüfen sie unten nicht)
  const isWithinGivingWindow = useMemo(() => {
    if (!date) return true
    const eventStart = new Date(date + 'T00:00:00')
    const eventEnd = new Date(eventStart)
    eventEnd.setDate(eventEnd.getDate() + 1)
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
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('id, auth_user_id, first_name, middle_name, last_name, degree, birthday, avatar_url, is_active')
        .order('last_name', { ascending: true })
      if (pErr) throw pErr
      const list = (profs ?? []) as Profile[]
      setProfiles(list)

      const { data: partsLinked, error: aErr } = await supabase
        .from('stammtisch_participants')
        .select('auth_user_id, status')
        .eq('stammtisch_id', idNum)
      if (aErr) throw aErr
      const linkedMap: Record<string, AttStatus> = {}
      for (const row of partsLinked ?? []) {
        if (row.auth_user_id) linkedMap[row.auth_user_id as string] = (row.status as AttStatus) || 'declined'
      }

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

  // Offene Geburtstags-Runden
  const loadBirthdayRounds = useCallback(async () => {
    setLoadingRounds(true)
    setRoundsErr(null)
    try {
      if (!Number.isFinite(idNum) || !date) { setDueRounds([]); return }

      const currentFirst = firstOfMonth(date)
      const monthsToBackfill = 12
      for (let i = monthsToBackfill - 1; i >= 0; i--) {
        const m = addMonths(currentFirst, -i)
        try {
          await supabase.rpc('seed_birthday_rounds', { p_due_month: m, p_stammtisch_id: idNum })
        } catch {}
      }

      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, profile_id, due_month, settled_stammtisch_id, approved_at')
        .lte('due_month', currentFirst)
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

  // Gegebene Runden dieses Stammtischs (inkl. profile_id & due_month)
  const loadDonors = useCallback(async () => {
    setLoadingDonors(true)
    try {
      if (!Number.isFinite(idNum)) { setDonors([]); return }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, profile_id, due_month, settled_stammtisch_id, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: true })
      if (error) throw error
      setDonors(((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: (d.auth_user_id ?? null) as string | null,
        profile_id: (d.profile_id ?? null) as number | null,
        due_month: (d.due_month ?? null) as string | null,
        settled_at: d.settled_at as string | null,
        approved_at: d.approved_at as string | null,
      })))
    } catch {
      setDonors([])
    } finally {
      setLoadingDonors(false)
    }
  }, [idNum])

  // Moderation
  const loadModeration = useCallback(async () => {
    setLoadingModeration(true)
    try {
      if (!Number.isFinite(idNum)) { setModeration([]); return }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, profile_id, due_month, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: false })
      if (error) throw error
      setModeration(((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: (d.auth_user_id ?? null) as string | null,
        profile_id: (d.profile_id ?? null) as number | null,
        due_month: (d.due_month ?? null) as string | null,
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

  // Löschen (RPC)
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

  // Monatsschlüssel
  const currentMonthKey = date ? firstOfMonth(date) : ''
  const currentMonthYYYYMM = currentMonthKey.slice(0, 7)
  const currentMonth = date ? date.slice(5,7) : ''

  // Geburtstagsliste für den Monat
  const currentMonthBirthdays = useMemo(() => {
    if (!date) return []
    return profiles
      .filter(p => !!p.birthday && (p.birthday as string).slice(5,7) === currentMonth)
      .sort((a, b) =>
        (a.last_name || '').localeCompare((b.last_name || ''), 'de', { sensitivity: 'base' }) ||
        (a.first_name || '').localeCompare((b.first_name || ''), 'de', { sensitivity: 'base' })
      )
  }, [profiles, date, currentMonth])

  // offene (unsettled) Runden im aktuellen Monat – verknüpft (für Open-Map)
  const openCurrentMap = useMemo(() => {
    const map = new Map<string, BR>()
    for (const r of dueRounds) {
      if (r.auth_user_id && r.due_month.slice(0,7) === currentMonthYYYYMM) {
        map.set(r.auth_user_id, r)
      }
    }
    return map
  }, [dueRounds, currentMonthYYYYMM])

  // Überfällig
  const overdueRounds = useMemo(() => {
    return dueRounds.filter(r => r.due_month.slice(0,7) < currentMonthYYYYMM)
  }, [dueRounds, currentMonthYYYYMM])

  // aus allen Donors (settled) Maps für "gegeben" und "pending" machen
  const donorsPending = useMemo(() => donors.filter(d => !d.approved_at), [donors])
  const givenLinkedByMonth = useMemo(() => {
    const map = new Map<string, Set<string>>() // auth_user_id -> months
    for (const d of donors) {
      if (d.auth_user_id && d.due_month) {
        const m = d.due_month.slice(0,7)
        if (!map.has(d.auth_user_id)) map.set(d.auth_user_id, new Set())
        map.get(d.auth_user_id)!.add(m)
      }
    }
    return map
  }, [donors])
  const givenUnlinkedByMonth = useMemo(() => {
    const map = new Map<number, Set<string>>() // profile_id -> months
    for (const d of donors) {
      if (!d.auth_user_id && d.profile_id && d.due_month) {
        const m = d.due_month.slice(0,7)
        if (!map.has(d.profile_id)) map.set(d.profile_id, new Set())
        map.get(d.profile_id)!.add(m)
      }
    }
    return map
  }, [donors])
  const pendingLinkedByMonth = useMemo(() => {
    const map = new Map<string, Set<string>>() // auth_user_id -> months
    for (const d of donorsPending) {
      if (d.auth_user_id && d.due_month) {
        const m = d.due_month.slice(0,7)
        if (!map.has(d.auth_user_id)) map.set(d.auth_user_id, new Set())
        map.get(d.auth_user_id)!.add(m)
      }
    }
    return map
  }, [donorsPending])
  const pendingUnlinkedMonthsByProfile = useMemo(() => {
    const map = new Map<number, Set<string>>() // profile_id -> months
    for (const d of donorsPending) {
      if (!d.auth_user_id && d.profile_id && d.due_month) {
        const m = d.due_month.slice(0,7)
        if (!map.has(d.profile_id)) map.set(d.profile_id, new Set())
        map.get(d.profile_id)!.add(m)
      }
    }
    return map
  }, [donorsPending])

  // „Gegeben“ (linked) – Admin darf Attendance ignorieren
  async function givenCurrentOrOverdue(userId: string, roundId?: number) {
    if (!Number.isFinite(idNum) || !date) return
    const attending = (attLinked[userId] || 'declined') === 'going'
    if (!attending && !isAdmin) {
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
        const dueFirst = firstOfMonth(date)
        // profile_id befüllen (stabiler Name später)
        const prof = profiles.find(p => p.auth_user_id === userId)
        const payload: any = {
          auth_user_id: userId,
          due_month: dueFirst,
          settled_stammtisch_id: idNum,
          settled_at: new Date().toISOString(),
        }
        if (prof?.id) payload.profile_id = prof.id
        const { error } = await supabase.from('birthday_rounds').insert([payload])
        if (error) throw error
      }
      await loadDonors()
      await loadBirthdayRounds()
      if (isAdmin) await loadModeration()
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

  // „Gegeben“ für unverknüpfte Profile (nur Admin/SU)
  async function givenForUnlinkedProfile(profileId: number) {
    if (!Number.isFinite(idNum) || !date) return
    if (!isAdmin) {
      Alert.alert('Nicht erlaubt', 'Nur Admin/Superuser können unverknüpfte Runden verbuchen.')
      return
    }
    try {
      const dueFirst = firstOfMonth(date)
      const { error } = await supabase.rpc('admin_give_unlinked_birthday_round', {
        p_profile_id: profileId,
        p_stammtisch_id: idNum,
        p_due_month: dueFirst,
      })
      if (error) throw error

      await loadDonors()
      await loadBirthdayRounds()
      await loadModeration()
      Alert.alert('Erfasst', 'Geburtstagsrunde wurde verbucht (unverknüpft).')
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'RPC admin_give_unlinked_birthday_round fehlt oder schlug fehl.')
    }
  }

  // Extra-Runde (Zeitfenster-Check aus, Admin darf immer)
  async function giveExtraRound() {
    if (!Number.isFinite(idNum) || !date) return
    const { data: sess } = await supabase.auth.getUser()
    const uid = sess?.user?.id
    if (!uid && !isAdmin) { Alert.alert('Fehler', 'Nicht eingeloggt.'); return }
    if (!isAdmin) {
      if ((attLinked[uid!] || 'declined') !== 'going') {
        Alert.alert('Hinweis', 'Extra-Runden können nur gegeben werden, wenn du anwesend bist.')
        return
      }
    }
    try {
      const dueFirst = firstOfMonth(date)
      const prof = uid ? profiles.find(p => p.auth_user_id === uid) : null
      const payload: any = {
        auth_user_id: uid ?? null,
        profile_id: prof?.id ?? null,
        due_month: dueFirst,
        settled_stammtisch_id: idNum,
        settled_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('birthday_rounds').insert([payload])
      if (error) throw error

      await loadDonors()
      await loadBirthdayRounds()
      if (isAdmin) await loadModeration()
      Alert.alert('Danke!', 'Runde wurde verbucht.')
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
    }
  }

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

  // Sichtbarkeiten
  const showBirthdayBox = !loadingRounds && !roundsErr && (currentMonthBirthdays.length > 0 || overdueRounds.length > 0)
  const showDonorsBox = !loadingDonors && donors.length > 0

  // Helpers
  const findProfileBy = (authUserId: string | null, profileId: number | null): Profile | null => {
    if (profileId != null) {
      const byId = profiles.find(p => p.id === profileId)
      if (byId) return byId
    }
    if (authUserId) {
      const byAuth = profiles.find(p => p.auth_user_id === authUserId)
      if (byAuth) return byAuth
    }
    return null
  }

  const checkGiven = (authUserId: string | null, profileId: number | null, monthYYYYMM: string) => {
    if (authUserId && givenLinkedByMonth.get(authUserId)?.has(monthYYYYMM)) return true
    if (profileId != null && givenUnlinkedByMonth.get(profileId)?.has(monthYYYYMM)) return true
    return false
  }

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

            {/* Geburtstags-Runden */}
            {showBirthdayBox && (
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

                        // bereits gegeben (pending oder approved)?
                        const hasGiven = checkGiven(p.auth_user_id, p.id, currentMonthYYYYMM)

                        // pending speziell (für evtl. Styling)
                        const isPending =
                          p.auth_user_id
                            ? (pendingLinkedByMonth.get(p.auth_user_id)?.has(currentMonthYYYYMM) ?? false)
                            : (pendingUnlinkedMonthsByProfile.get(p.id)?.has(currentMonthYYYYMM) ?? false)

                        const canClick =
                          !hasGiven && (
                            isAdmin
                              ? true
                              : (p.auth_user_id ? attending : false)
                          )

                        const onPress = () =>
                          p.auth_user_id
                            ? givenCurrentOrOverdue(p.auth_user_id!, open?.id)
                            : givenForUnlinkedProfile(p.id)

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

                            {/* rechts: Button oder Haken */}
                            {hasGiven ? (
                              <Text style={{ color: isPending ? '#999' : colors.gold }}>✓ Gegeben</Text>
                            ) : (p.auth_user_id || isAdmin) ? (
                              <Pressable disabled={!canClick} onPress={onPress}>
                                <Text style={{ color: canClick ? colors.gold : '#999' }}>Gegeben</Text>
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
                        const month = r.due_month.slice(0,7)
                        const prof = findProfileBy(r.auth_user_id, r.profile_id)
                        const attending = r.auth_user_id ? (attLinked[r.auth_user_id] || 'declined') === 'going' : false

                        const hasGiven = checkGiven(r.auth_user_id, r.profile_id, month)
                        const isPending =
                          r.auth_user_id
                            ? (pendingLinkedByMonth.get(r.auth_user_id)?.has(month) ?? false)
                            : (r.profile_id != null && (pendingUnlinkedMonthsByProfile.get(r.profile_id)?.has(month) ?? false))

                        const canClick =
                          !hasGiven && (
                            isAdmin
                              ? true
                              : (r.auth_user_id ? attending : false)
                          )

                        const onPress = () =>
                          r.auth_user_id
                            ? givenCurrentOrOverdue(r.auth_user_id, r.id)
                            : (r.profile_id != null ? givenForUnlinkedProfile(r.profile_id) : Alert.alert('Hinweis', 'Unverknüpft: bitte über Teilnehmerliste verbuchen.'))

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
                              {avatarUrlFor(prof) ? (
                                <Image
                                  source={{ uri: avatarUrlFor(prof)! }}
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
                                <Text style={type.body}>{prof ? fullName(prof) : (r.auth_user_id ?? 'Unverknüpft')}</Text>
                                <Text style={type.caption}>fällig: {germanMonthYear(r.due_month)}</Text>
                              </View>
                            </View>

                            {hasGiven ? (
                              <Text style={{ color: isPending ? '#999' : colors.gold }}>✓ Gegeben</Text>
                            ) : (
                              <Pressable disabled={!canClick} onPress={onPress}>
                                <Text style={{ color: canClick ? colors.gold : '#999' }}>Gegeben</Text>
                              </Pressable>
                            )}
                          </View>
                        )
                      })
                    )}
                  </View>
                )}
              </Box>
            )}

            {/* Edle Spender – nur anzeigen, wenn es Runden für diesen Stammtisch gibt */}
            {showDonorsBox && (
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
                      const prof = findProfileBy(d.auth_user_id, d.profile_id)
                      const name = prof ? fullName(prof) : (d.auth_user_id ?? 'Unverknüpft')
                      const avatar = avatarUrlFor(prof || null)
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
            )}

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
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: 8,
                backgroundColor: colors.cardBg,
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
                      borderRadius: radius.md, color: colors.gold, backgroundColor: colors.cardBg,
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
                      borderRadius: radius.md, color: colors.gold, minHeight: 120, backgroundColor: colors.cardBg,
                    }}
                  />
                </View >

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
                          <View
                            key={key}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                            }}
                          >
                            <Text style={type.body}>{fullName(p)}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              {/* Anwesenheit */}
                              <Pressable
                                onPress={() => isLinked ? toggleAttendanceLinked(p.auth_user_id!) : toggleAttendanceUnlinked(p.id)}
                                style={{
                                  width: 22, height: 22, borderRadius: 6, borderWidth: 1,
                                  borderColor: isGoing ? colors.gold : colors.border,
                                  backgroundColor: isGoing ? colors.gold : 'transparent',
                                  alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                {isGoing ? <Text style={{ color: colors.bg, fontWeight: 'bold' }}>✓</Text> : null}
                              </Pressable>

                              {/* Admin/SU – Spender-Runde auch für Unlinked */}
                              {isAdmin && !isLinked ? (
                                <Pressable
                                  onPress={() => givenForUnlinkedProfile(p.id)}
                                  style={{
                                    paddingVertical: 6, paddingHorizontal: 10,
                                    borderRadius: 8, borderWidth: 1,
                                    borderColor: colors.border, backgroundColor: colors.cardBg,
                                  }}
                                >
                                  <Text style={{ color: colors.gold }}>Runde (Admin)</Text>
                                </Pressable>
                              ) : null}
                            </View>
                          </View>
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
                      const prof = findProfileBy(r.auth_user_id, r.profile_id)
                      const name = prof ? fullName(prof) : (r.auth_user_id ?? 'Unverknüpft')
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
                            {name}{isApproved ? ' — bestätigt' : ' — unbestätigt'}
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
