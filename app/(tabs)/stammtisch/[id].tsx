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
  settled_at: string | null
  approved_at?: string | null
  first_due_stammtisch_id?: number | null
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

const normalizeProfileId = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const roundOwnerKey = (
  authUserId: string | null | undefined,
  profileId: unknown,
  dueMonth: string | null | undefined
) => {
  if (!dueMonth) return ''
  const normalizedProfile = normalizeProfileId(profileId)
  const month = firstOfMonth(dueMonth)
  if (authUserId) return `auth:${authUserId}:${month}`
  if (normalizedProfile != null) return `profile:${normalizedProfile}:${month}`
  return ''
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
const CONFIRMED_COLOR = '#4CAF50'
const PENDING_COLOR = '#9E9E9E'

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
      const rawList = (profs ?? []) as any[]
      const list = rawList
        .map((p: any) => {
          const normalizedId = normalizeProfileId(p.id)
          if (normalizedId == null) return null
          return { ...(p as Profile), id: normalizedId }
        })
        .filter(Boolean) as Profile[]
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
        const pid = normalizeProfileId((row as any).profile_id)
        if (pid != null) {
          unlinkedMap[pid] = ((row as any).status as AttStatus) || 'declined'
        }
      }

      setAttLinked(linkedMap)
      setAttUnlinked(unlinkedMap)
    } catch (e: any) {
      console.error('Teilnehmer laden Fehler:', e.message)
    } finally {
      setLoadingAtt(false)
    }
  }, [idNum])

  const ensureProfileLinks = useCallback(
    async (rows: { id: number; auth_user_id: string | null; profile_id: number | null }[]) => {
      if (!rows || rows.length === 0) return new Map<number, number>()
      if (profiles.length === 0) return new Map<number, number>()
      const updates: { id: number; profile_id: number }[] = []
      for (const row of rows) {
        if (row.profile_id != null || !row.auth_user_id) continue
        const prof = profiles.find(p => p.auth_user_id === row.auth_user_id)
        const profileId = prof ? normalizeProfileId(prof.id) : null
        if (profileId != null) {
          updates.push({ id: row.id, profile_id: profileId })
        }
      }
      if (updates.length === 0) return new Map<number, number>()
      const { error } = await supabase
        .from('birthday_rounds')
        .upsert(
          updates.map((u) => ({ id: u.id, profile_id: u.profile_id })),
          { onConflict: 'id' }
        )
      if (error) throw error
      const map = new Map<number, number>()
      updates.forEach((u) => map.set(u.id, u.profile_id))
      return map
    },
    [profiles]
  )

  // Offene Geburtstags-Runden
  const loadBirthdayRounds = useCallback(async () => {
    setLoadingRounds(true)
    setRoundsErr(null)
    try {
      if (!Number.isFinite(idNum) || !date) {
        setDueRounds([])
        return
      }

      const currentFirst = firstOfMonth(date)
      if (!currentFirst) {
        setDueRounds([])
        return
      }

      const monthsToBackfill = 12
      const months: string[] = []
      for (let i = monthsToBackfill - 1; i >= 0; i--) {
        months.push(addMonths(currentFirst, -i))
      }

      const fetchRounds = async () => {
        const { data, error } = await supabase
          .from('birthday_rounds')
          .select('id, auth_user_id, profile_id, due_month, settled_stammtisch_id, settled_at, approved_at, first_due_stammtisch_id')
          .lte('due_month', currentFirst)
          .order('due_month', { ascending: true })
          .order('settled_at', { ascending: true, nullsFirst: true })
        if (error) throw error
        return (data ?? []) as BR[]
      }

      let rounds = await fetchRounds()
      const ensuredLinks = await ensureProfileLinks(rounds)
      if (ensuredLinks.size > 0) {
        rounds = rounds.map(r =>
          ensuredLinks.has(r.id) ? { ...r, profile_id: ensuredLinks.get(r.id)! } : r
        )
      }

      const activeWithBirthday = profiles.filter(p => p.is_active !== false && !!p.birthday)
      if (activeWithBirthday.length > 0) {
        const existingKeys = new Set<string>()
        for (const r of rounds) {
          const key = roundOwnerKey(r.auth_user_id, r.profile_id, r.due_month)
          if (key) existingKeys.add(key)
        }

        const linkedPayloads: Record<string, any>[] = []
        const unlinkedPayloads: Record<string, any>[] = []

        for (const monthFirst of months) {
          const monthKey = monthFirst.slice(5, 7)
          for (const prof of activeWithBirthday) {
            const bday = prof.birthday as string | null | undefined
            if (!bday || bday.slice(5, 7) !== monthKey) continue

            const profileId = normalizeProfileId(prof.id)
            const ownerKey = roundOwnerKey(prof.auth_user_id ?? null, profileId, monthFirst)
            if (ownerKey && existingKeys.has(ownerKey)) continue

            const base: Record<string, any> = {
              due_month: monthFirst,
              first_due_stammtisch_id: idNum,
              profile_id: profileId,
            }

            if (prof.auth_user_id) {
              linkedPayloads.push({ ...base, auth_user_id: prof.auth_user_id })
            } else if (profileId != null) {
              unlinkedPayloads.push({ ...base, auth_user_id: null })
            }
          }
        }

        let inserted = false
        if (linkedPayloads.length > 0) {
          const { error: linkedErr } = await supabase
            .from('birthday_rounds')
            .upsert(linkedPayloads, { onConflict: 'auth_user_id,due_month' })
          if (linkedErr) throw linkedErr
          inserted = true
        }

        if (unlinkedPayloads.length > 0) {
          const { error: unlinkedErr } = await supabase
            .from('birthday_rounds')
            .upsert(unlinkedPayloads, { onConflict: 'profile_id,due_month' })
          if (unlinkedErr) throw unlinkedErr
          inserted = true
        }

        if (inserted) {
          rounds = await fetchRounds()
          const ensuredAfter = await ensureProfileLinks(rounds)
          if (ensuredAfter.size > 0) {
            rounds = rounds.map(r =>
              ensuredAfter.has(r.id) ? { ...r, profile_id: ensuredAfter.get(r.id)! } : r
            )
          }
        }
      }

      const deduped: BR[] = []
      const seen = new Map<string, number>()
      for (const r of rounds) {
        const key = roundOwnerKey(r.auth_user_id, r.profile_id, r.due_month)
        if (!key) continue
        const normalizedProfileId = normalizeProfileId(r.profile_id)
        const existingIndex = seen.get(key)
        if (existingIndex != null) {
          const existing = deduped[existingIndex]
          const existingApproved = !!existing.approved_at
          const currentApproved = !!r.approved_at
          const hasBetterProfile = existing.profile_id == null && normalizedProfileId != null
          const shouldReplace = (!currentApproved && existingApproved) || hasBetterProfile
          if (shouldReplace) {
            deduped[existingIndex] = { ...r, profile_id: normalizedProfileId }
          }
          continue
        }
        deduped.push({
          ...r,
          profile_id: normalizedProfileId,
        })
        seen.set(key, deduped.length - 1)
      }

      const open = deduped.filter(r => !r.approved_at)
      setDueRounds(open)
    } catch (e: any) {
      setRoundsErr(e?.message ?? 'Fehler beim Laden der Geburtstags-Runden.')
    } finally {
      setLoadingRounds(false)
    }
  }, [idNum, date, profiles, ensureProfileLinks])

  // Gegebene Runden dieses Stammtischs (inkl. profile_id & due_month)
  const loadDonors = useCallback(async () => {
    setLoadingDonors(true)
    try {
      if (!Number.isFinite(idNum)) {
        setDonors([])
        return
      }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, profile_id, due_month, settled_stammtisch_id, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: true })
      if (error) throw error

      let mapped = ((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: (d.auth_user_id ?? null) as string | null,
        profile_id: normalizeProfileId(d.profile_id),
        due_month: (d.due_month ?? null) as string | null,
        settled_at: d.settled_at as string | null,
        approved_at: d.approved_at as string | null,
      })) as Donor[]

      const ensured = await ensureProfileLinks(mapped)
      if (ensured.size > 0) {
        mapped = mapped.map(r => (ensured.has(r.id) ? { ...r, profile_id: ensured.get(r.id)! } : r))
      }

      setDonors(mapped)
    } catch {
      setDonors([])
    } finally {
      setLoadingDonors(false)
    }
  }, [idNum, ensureProfileLinks])

  // Moderation
  const loadModeration = useCallback(async () => {
    setLoadingModeration(true)
    try {
      if (!Number.isFinite(idNum)) {
        setModeration([])
        return
      }
      const { data, error } = await supabase
        .from('birthday_rounds')
        .select('id, auth_user_id, profile_id, due_month, settled_at, approved_at')
        .eq('settled_stammtisch_id', idNum)
        .order('settled_at', { ascending: false })
      if (error) throw error

      let mapped = ((data ?? []) as any[]).map(d => ({
        id: d.id as number,
        auth_user_id: (d.auth_user_id ?? null) as string | null,
        profile_id: normalizeProfileId(d.profile_id),
        due_month: (d.due_month ?? null) as string | null,
        settled_at: d.settled_at as string | null,
        approved_at: d.approved_at as string | null,
      })) as Donor[]

      const ensured = await ensureProfileLinks(mapped)
      if (ensured.size > 0) {
        mapped = mapped.map(r => (ensured.has(r.id) ? { ...r, profile_id: ensured.get(r.id)! } : r))
      }

      setModeration(mapped)
    } catch {
      setModeration([])
    } finally {
      setLoadingModeration(false)
    }
  }, [idNum, ensureProfileLinks])

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
      if (r.auth_user_id && !r.settled_stammtisch_id && r.due_month.slice(0,7) === currentMonthYYYYMM) {
        map.set(r.auth_user_id, r)
      }
    }
    return map
  }, [dueRounds, currentMonthYYYYMM])

  const openCurrentUnlinkedMap = useMemo(() => {
    const map = new Map<number, BR>()
    for (const r of dueRounds) {
      if (!r.auth_user_id && r.profile_id != null && !r.settled_stammtisch_id && r.due_month.slice(0,7) === currentMonthYYYYMM) {
        map.set(r.profile_id, r)
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
      const prof = profiles.find(p => p.auth_user_id === userId) || null
      const settledAt = new Date().toISOString()
      if (roundId) {
        const update: Record<string, any> = {
          settled_stammtisch_id: idNum,
          settled_at: settledAt,
        }
        if (prof?.id) update.profile_id = prof.id
        const { error } = await supabase
          .from('birthday_rounds')
          .update(update)
          .eq('id', roundId)
        if (error) throw error
      } else {
        const dueFirst = firstOfMonth(date)
        const payload: Record<string, any> = {
          auth_user_id: userId,
          profile_id: prof?.id ?? null,
          due_month: dueFirst,
          first_due_stammtisch_id: idNum,
          settled_stammtisch_id: idNum,
          settled_at: settledAt,
        }
        const { error } = await supabase
          .from('birthday_rounds')
          .upsert([payload], { onConflict: 'auth_user_id,due_month' })
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
  async function givenForUnlinkedProfile(
    profileId: number,
    options?: { roundId?: number | null; dueMonth?: string | null | undefined }
  ) {
    if (!Number.isFinite(idNum) || !date) return
    if (!isAdmin) {
      Alert.alert('Nicht erlaubt', 'Nur Admin/Superuser können unverknüpfte Runden verbuchen.')
      return
    }
    const profileNumeric = normalizeProfileId(profileId)
    if (profileNumeric == null) {
      Alert.alert('Fehler', 'Ungültiges Profil für unverknüpfte Runde.')
      return
    }
    try {
      const dueCandidate = options?.dueMonth ?? firstOfMonth(date)
      const dueFirst = dueCandidate && dueCandidate.length > 0 ? dueCandidate : firstOfMonth(date)
      if (!dueFirst) {
        Alert.alert('Fehler', 'Kein Datum für den Stammtisch gesetzt.')
        return
      }
      const settledAt = new Date().toISOString()
      if (options?.roundId) {
        const { error } = await supabase
          .from('birthday_rounds')
          .update({
            settled_stammtisch_id: idNum,
            settled_at: settledAt,
            profile_id: profileNumeric,
          })
          .eq('id', options.roundId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('birthday_rounds')
          .upsert([
            {
              profile_id: profileNumeric,
              auth_user_id: null,
              due_month: dueFirst,
              first_due_stammtisch_id: idNum,
              settled_stammtisch_id: idNum,
              settled_at: settledAt,
            },
          ], { onConflict: 'profile_id,due_month' })
        if (error) throw error
      }

      await loadDonors()
      await loadBirthdayRounds()
      if (isAdmin) await loadModeration()
      Alert.alert('Erfasst', 'Runde wurde verbucht (unverknüpft).')
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Konnte Runde nicht verbuchen.')
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

  const renderRoundStatus = ({
    hasGiven,
    isPending,
    canPress,
    showButton,
    onPress,
  }: {
    hasGiven: boolean
    isPending: boolean
    canPress: boolean
    showButton: boolean
    onPress: () => void
  }) => {
    if (hasGiven) {
      if (isPending) {
        return (
          <Text style={{ ...type.caption, color: PENDING_COLOR }}>⏳ Wartet auf Bestätigung</Text>
        )
      }
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: CONFIRMED_COLOR, fontSize: 16 }}>✓</Text>
          <Text style={{ ...type.caption, color: CONFIRMED_COLOR, fontWeight: '600' }}>Bestätigt</Text>
        </View>
      )
    }
    if (!showButton) return null
    return (
      <Pressable disabled={!canPress} onPress={onPress}>
        <Text style={{ color: canPress ? colors.gold : '#999' }}>Gegeben</Text>
      </Pressable>
    )
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
                        const openLinked = p.auth_user_id ? openCurrentMap.get(p.auth_user_id) || null : null
                        const openUnlinked = !p.auth_user_id ? openCurrentUnlinkedMap.get(p.id) || null : null
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

                        const onPress = () => {
                          if (p.auth_user_id) {
                            return givenCurrentOrOverdue(p.auth_user_id!, openLinked?.id)
                          }
                          const dueMonthForUnlinked = openUnlinked?.due_month ?? (currentMonthKey || undefined)
                          return givenForUnlinkedProfile(p.id, {
                            roundId: openUnlinked?.id,
                            dueMonth: dueMonthForUnlinked,
                          })
                        }

                        const statusNode = renderRoundStatus({
                          hasGiven,
                          isPending,
                          canPress: canClick,
                          showButton: !!p.auth_user_id || isAdmin,
                          onPress,
                        })

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

                            {/* rechts: Status/Action */}
                            {statusNode}
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
                            : (r.profile_id != null
                                ? givenForUnlinkedProfile(r.profile_id, { roundId: r.id, dueMonth: r.due_month })
                                : Alert.alert('Hinweis', 'Unverknüpft: bitte über Teilnehmerliste verbuchen.'))

                        const statusNode = renderRoundStatus({
                          hasGiven,
                          isPending,
                          canPress: canClick,
                          showButton: !!r.auth_user_id || isAdmin,
                          onPress,
                        })

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

                            {statusNode}
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
                                    await loadBirthdayRounds()
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
                                        await loadBirthdayRounds()
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
