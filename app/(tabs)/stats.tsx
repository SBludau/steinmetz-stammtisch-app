// app/(tabs)/stats.tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

// ——————————————————————————————————————————
// Types
// ——————————————————————————————————————————
type Profile = {
  id: number
  auth_user_id: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

type EventRow = { id: number; date: string }

// Teilnehmer-Tabellen (linked & unlinked)
type ParticipantLinkedRow = { auth_user_id: string; status: 'going' | 'declined' | 'maybe' }
type ParticipantUnlinkedRow = { profile_id: number; status: 'going' | 'declined' | 'maybe' }

// Runden (Spender)
type DonorRow = {
  auth_user_id: string | null
  profile_id: number | null
  settled_at: string | null
  approved_at: string | null
  settled_stammtisch_id: number | null
}

// Vereinheitlichte Schlüssel
type Key = `auth:${string}` | `profile:${number}`

type Ranked = { key: Key; value: number; rank: number }

// ——————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————
const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
const todayYMD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

const keyFromAuth = (uid: string): Key => `auth:${uid}`
const keyFromProfile = (pid: number): Key => `profile:${pid}`

function fullName(p: Profile | undefined): string {
  if (!p) return 'Unbekannt'
  const fn = (p.first_name || '').trim()
  const ln = (p.last_name || '').trim()
  return `${fn} ${ln}`.trim() || 'Ohne Namen'
}

function getPublicAvatarUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl || undefined
}

// Gleichstände: alle auf geteilten #1/#2/#3
function rankTop3(entries: Array<{ key: Key; value: number }>): Ranked[] {
  if (!entries.length) return []
  const sorted = [...entries].sort((a, b) => b.value - a.value)
  const uniqueValues: number[] = []
  for (const e of sorted) {
    if (!uniqueValues.includes(e.value)) uniqueValues.push(e.value)
    if (uniqueValues.length >= 3) break
  }
  const allowed = new Set(uniqueValues)
  const withRank: Ranked[] = sorted
    .filter(e => allowed.has(e.value))
    .map(e => ({ ...e, rank: uniqueValues.indexOf(e.value) + 1 }))
  return withRank
}

// Kleine Bausteine
function Box({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

function Header({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={type.h2}>{emoji} {title}</Text>
      {subtitle ? <Text style={type.bodyMuted}>{subtitle}</Text> : null}
    </View>
  )
}

function PersonRow({ rank, name, avatar, detail }: { rank: number; name: string; avatar?: string; detail: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            minWidth: 34,
            height: 24,
            paddingHorizontal: 8,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: rank === 1 ? '#F1E5A8' : rank === 2 ? '#EEE' : rank === 3 ? '#F7D7A6' : '#222',
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>#{rank}</Text>
        </View>
        <View
          style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#222', borderWidth: 1, borderColor: colors.border, marginRight: 10 }}
        >
          {avatar ? <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} /> : null}
        </View>
        <Text style={{ ...type.body, fontWeight: '600' }}>{name}</Text>
      </View>
      <Text style={type.bodyMuted}>{detail}</Text>
    </View>
  )
}

// Native-sichere Jahresauswahl (Chips)
function YearChips({
  years,
  value,
  onChange,
}: {
  years: number[]
  value: number
  onChange: (y: number) => void
}) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {years.map((y, idx) => {
        const active = y === value
        const isLast = idx === years.length - 1
        return (
          <Pressable
            key={y}
            onPress={() => onChange(y)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: active ? colors.gold : colors.border,
              backgroundColor: active ? '#2a2a2a' : '#0d0d0d',
              marginRight: isLast ? 0 : 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={type.body}>{`Jahr ${y}`}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

// ——————————————————————————————————————————
// Hauptseite
// ——————————————————————————————————————————
export default function StatsScreen() {
  const insets = useSafeAreaInsets()

  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [events, setEvents] = useState<EventRow[]>([])
  // Für jede Event-ID: Set der Keys (auth:.. / profile:..) mit status 'going'
  const [goingKeysByEvent, setGoingKeysByEvent] = useState<Record<number, Set<Key>>>({})
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [donors, setDonors] = useState<DonorRow[]>([])
  const [fallbackAvatars, setFallbackAvatars] = useState<Record<string, string>>({}) // Google-Fallback für auth-User

  // nur aktuelles Jahr und die letzten zwei
  const years = useMemo(() => [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2], [])

  // Grenzen: bis heute (für aktuelles Jahr) sonst bis 31.12.
  const startDate = useMemo(() => `${selectedYear}-01-01`, [selectedYear])
  const endDate = useMemo(
    () => (selectedYear === CURRENT_YEAR ? todayYMD : `${selectedYear}-12-31`),
    [selectedYear]
  )

  // zusätzlich: UTC-zeitbasierte Grenzen für approved_at (halb-offen)
  const startApprovedInclusive = useMemo(() => `${startDate}T00:00:00Z`, [startDate])
  const endApprovedExclusive = useMemo(() => {
    if (selectedYear === CURRENT_YEAR) {
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) // morgen (lokal), JS erzeugt UTC-ISO
      // auf YYYY-MM-DDT00:00:00Z normalisieren
      const y = next.getUTCFullYear()
      const m = pad(next.getUTCMonth() + 1)
      const d = pad(next.getUTCDate())
      return `${y}-${m}-${d}T00:00:00Z`
    } else {
      // 01.01.(Jahr+1) 00:00Z
      return `${selectedYear + 1}-01-01T00:00:00Z`
    }
  }, [selectedYear])

  // Profile-Maps
  const profileByKey = useMemo(() => {
    const map: Record<Key, Profile> = {}
    for (const p of profiles) {
      if (p.auth_user_id) map[keyFromAuth(p.auth_user_id)] = p
      map[keyFromProfile(p.id)] = p
    }
    return map
  }, [profiles])

  const avatarForKey = (key: Key | undefined) => {
    if (!key) return undefined
    const p = profileByKey[key]
    if (key.startsWith('auth:')) {
      const uid = key.slice(5)
      return getPublicAvatarUrl(p?.avatar_url) || fallbackAvatars[uid]
    }
    return getPublicAvatarUrl(p?.avatar_url)
  }

  const nameForKey = (key: Key | undefined) => fullName(key ? profileByKey[key] : undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1) Events im gewählten Jahr – NUR bis endDate (heute bei aktuellem Jahr)
      const { data: eventsData, error: e1 } = await supabase
        .from('stammtisch')
        .select('id,date')
        .gte('date', startDate)
        .lte('date', endDate) // keine zukünftigen Stammtische
        .order('date', { ascending: true })
      if (e1) throw e1
      const evs = (eventsData ?? []) as EventRow[]
      setEvents(evs)

      // 2) Teilnehmer je Event – *linked* und *unlinked* zusammenführen
      const byEvent: Record<number, Set<Key>> = {}
      for (const ev of evs) {
        const goingSet: Set<Key> = new Set()

        // linked
        const { data: linked, error: errL } = await supabase
          .from('stammtisch_participants')
          .select('auth_user_id,status')
          .eq('stammtisch_id', ev.id)
        if (errL) throw errL
        for (const row of (linked ?? []) as ParticipantLinkedRow[]) {
          if (row.status === 'going') goingSet.add(keyFromAuth(row.auth_user_id))
        }

        // unlinked
        const { data: unlinked, error: errU } = await supabase
          .from('stammtisch_participants_unlinked')
          .select('profile_id,status')
          .eq('stammtisch_id', ev.id)
        if (errU) throw errU
        for (const row of (unlinked ?? []) as ParticipantUnlinkedRow[]) {
          if (row.status === 'going') goingSet.add(keyFromProfile(row.profile_id))
        }

        byEvent[ev.id] = goingSet
      }
      setGoingKeysByEvent(byEvent)

      // 3) Profiles (für Namen + Avatare)
      const { data: profData, error: e2 } = await supabase
        .from('profiles')
        .select('id,auth_user_id,first_name,last_name,avatar_url')
      if (e2) throw e2
      const profs = (profData ?? []) as Profile[]
      setProfiles(profs)

      // 3b) Google-Avatar-Fallback via RPC (optional – nur für auth_user_id)
      try {
        const userIds = profs.map(p => p.auth_user_id).filter(Boolean) as string[]
        if (userIds.length) {
          const { data: fb, error: fbErr } = await supabase.rpc('public_get_google_avatars', { p_user_ids: userIds })
          if (!fbErr && Array.isArray(fb)) {
            const map: Record<string, string> = {}
            for (const row of fb as Array<{ auth_user_id: string; avatar_url?: string | null }>) {
              if (row.avatar_url) map[row.auth_user_id] = row.avatar_url
            }
            setFallbackAvatars(map)
          }
        }
      } catch {
        // RPC existiert nicht -> ignorieren
      }

      // 4) Spender-Runden (nur bestätigte), nach approved_at in [startInclusive, endExclusive)
      //    JETZT: Aus ZWEI Tabellen laden (birthday_rounds & spender_rounds)
      
      // A) birthday_rounds
      const { data: bData, error: bErr } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id,profile_id,settled_at,approved_at,settled_stammtisch_id')
        .not('approved_at', 'is', null)
        .gte('approved_at', startApprovedInclusive)
        .lt('approved_at', endApprovedExclusive)
      if (bErr) throw bErr

      // B) spender_rounds (neue Tabelle)
      const { data: sData, error: sErr } = await supabase
        .from('spender_rounds')
        .select('auth_user_id,profile_id,created_at,approved_at,stammtisch_id')
        .not('approved_at', 'is', null)
        .gte('approved_at', startApprovedInclusive)
        .lt('approved_at', endApprovedExclusive)
      if (sErr) throw sErr

      // C) Zusammenführen
      const bRows = (bData ?? []) as DonorRow[]
      const sRows = (sData ?? []).map((r: any) => ({
        auth_user_id: r.auth_user_id,
        profile_id: r.profile_id,
        settled_at: r.created_at,         // created_at als settled_at
        approved_at: r.approved_at,
        settled_stammtisch_id: r.stammtisch_id // stammtisch_id als settled_stammtisch_id
      })) as DonorRow[]

      setDonors([...bRows, ...sRows])

    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, startApprovedInclusive, endApprovedExclusive])

  // initial + wenn Jahr wechselt
  useEffect(() => {
    load()
  }, [load])

  // bei jedem Öffnen den Screen neu laden
  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  // ——— 1) Top Teilnahmen (status = going) ———
  const topTeilnahmenRanked: Ranked[] = useMemo(() => {
    const counts: Record<Key, number> = {}
    for (const ev of events) {
      const set = goingKeysByEvent[ev.id] || new Set<Key>()
      for (const k of set) counts[k] = (counts[k] || 0) + 1
    }
    const entries = Object.entries(counts).map(([k, v]) => ({ key: k as Key, value: v }))
    return rankTop3(entries)
  }, [events, goingKeysByEvent])

  // ——— 2) Längste Serien ———
  const topStreaksRanked: Ranked[] = useMemo(() => {
    const keysAll = new Set<Key>()
    for (const ev of events) {
      for (const k of (goingKeysByEvent[ev.id] || new Set<Key>())) keysAll.add(k)
    }
    const streaks: Array<{ key: Key; value: number }> = []
    keysAll.forEach(k => {
      let best = 0
      let cur = 0
      for (const ev of events) {
        const going = (goingKeysByEvent[ev.id] || new Set<Key>()).has(k)
        if (going) {
          cur += 1
          if (cur > best) best = cur
        } else {
          cur = 0
        }
      }
      if (best > 0) streaks.push({ key: k, value: best })
    })
    return rankTop3(streaks)
  }, [events, goingKeysByEvent])

  // ——— 3) Spender (nur bestätigte Runden, gezählt nach approved_at bis inkl. heute) ———
  const topSpenderRanked: Ranked[] = useMemo(() => {
    const counts: Record<Key, number> = {}
    for (const d of donors) {
      if (!d.approved_at) continue

      // Normalisierung: Versuche, das Profil zu finden, um immer den gleichen Key zu nutzen
      let p: Profile | undefined
      if (d.profile_id) p = profileByKey[keyFromProfile(d.profile_id)]
      else if (d.auth_user_id) p = profileByKey[keyFromAuth(d.auth_user_id)]

      let k: Key | null = null
      
      // Prio 1: Wenn das Profil eine auth_user_id hat, nimm diese (auch wenn in der Runde nur profile_id steht)
      if (p?.auth_user_id) k = keyFromAuth(p.auth_user_id)
      // Prio 2: Wenn das Profil nur eine ID hat (unlinked), nimm diese
      else if (p) k = keyFromProfile(p.id)
      // Fallback: Daten aus der Runde nehmen
      else if (d.auth_user_id) k = keyFromAuth(d.auth_user_id)
      else if (d.profile_id) k = keyFromProfile(d.profile_id)

      if (!k) continue
      counts[k] = (counts[k] || 0) + 1
    }
    const entries = Object.entries(counts).map(([k, v]) => ({ key: k as Key, value: v }))
    return rankTop3(entries)
  }, [donors, profileByKey])

  // Renderer
  const renderList = (list: Ranked[], unit: string, emptyText: string) => {
    if (!list.length) return <Text style={type.body}>{emptyText}</Text>
    return (
      <View>
        {list.map((row, idx) => {
          return (
            <PersonRow
              key={`${row.key}-${idx}`}
              rank={row.rank}
              name={nameForKey(row.key)}
              avatar={avatarForKey(row.key)}
              detail={`${row.value} ${unit}`}
            />
          )
        })}
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 12,
          paddingBottom: NAV_BAR_BASE_HEIGHT + insets.bottom + 24,
        }}
      >
        <Text style={type.h1}>Statistiken</Text>

        {/* Jahr-Auswahl (Chips) – volle Breite */}
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 8,
            backgroundColor: '#0d0d0d',
            width: '100%',
          }}
        >
          <YearChips years={years} value={selectedYear} onChange={setSelectedYear} />
           
        </View>

        {loading ? (
          <View style={{ marginTop: 24 }}>
            <ActivityIndicator color={colors.gold} />
            <Text style={{ ...type.bodyMuted, marginTop: 8 }}>Lade Auswertungen…</Text>
          </View>
        ) : error ? (
          <View style={{ marginTop: 24 }}>
            <Text style={{ ...type.body, color: colors.red }}>Fehler: {error}</Text>
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            <Box>
              <Header
                emoji="🏆"
                title="Beharrlichkeit führt zum Ziel"
                subtitle={`Teilnahmen im Jahr ${selectedYear}`}
              />
              {renderList(topTeilnahmenRanked, 'Teilnahmen', 'Noch keine Daten für diesen Zeitraum.')}
            </Box>

            <View style={{ height: 12 }} />

            <Box>
              <Header
                emoji="🔥"
                title="Serien-Trinker"
                subtitle={`Längste Anwesenheitsserien im Jahr ${selectedYear}`}
              />
              {renderList(topStreaksRanked, 'x in Folge', 'Noch keine Serien gefunden.')}
            </Box>

            <View style={{ height: 12 }} />

            <Box>
              <Header
                emoji="🍻"
                title="Schankwirtschafts-Runden"
                subtitle={`Großzügigste Spender im Jahr ${selectedYear}`}
              />
              {renderList(topSpenderRanked, 'Runden', 'Noch keine bestätigten Runden verbucht.')}
            </Box>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  )
}