// app/(tabs)/stats.tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router' // <--- Wichtig für Navigation
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

// Aktualisierte PersonRow: Klickbar mit onPress
function PersonRow({ 
  rank, 
  name, 
  avatar, 
  detail, 
  onPress 
}: { 
  rank: number; 
  name: string; 
  avatar?: string; 
  detail: string; 
  onPress?: () => void 
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingVertical: 8,
        opacity: pressed ? 0.7 : 1
      })}
    >
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={type.bodyMuted}>{detail}</Text>
        <Text style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>›</Text>
      </View>
    </Pressable>
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
  const router = useRouter()
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

  // Grenzen
  const startDate = useMemo(() => `${selectedYear}-01-01`, [selectedYear])
  const endDate = useMemo(
    () => (selectedYear === CURRENT_YEAR ? todayYMD : `${selectedYear}-12-31`),
    [selectedYear]
  )

  const startApprovedInclusive = useMemo(() => `${startDate}T00:00:00Z`, [startDate])
  const endApprovedExclusive = useMemo(() => {
    if (selectedYear === CURRENT_YEAR) {
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const y = next.getUTCFullYear()
      const m = pad(next.getUTCMonth() + 1)
      const d = pad(next.getUTCDate())
      return `${y}-${m}-${d}T00:00:00Z`
    } else {
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

  // Hilfsfunktion: Hängt Zeitstempel an, um Cache zu umgehen
  const getAvatarUrlWithCacheBust = (path: string | null | undefined) => {
    const url = getPublicAvatarUrl(path)
    if (!url) return undefined
    return `${url}?t=${new Date().getTime()}` 
  }

  const avatarForKey = (key: Key | undefined) => {
    if (!key) return undefined
    const p = profileByKey[key]
    
    // 1. Auth Key Check
    if (key.startsWith('auth:')) {
      const uid = key.slice(5)
      const dbUrl = getAvatarUrlWithCacheBust(p?.avatar_url)
      if (dbUrl) return dbUrl
      return fallbackAvatars[uid]
    }
    
    // 2. Profile Key Check (verknüpft?)
    if (p?.auth_user_id) {
       const dbUrl = getAvatarUrlWithCacheBust(p.avatar_url)
       if (dbUrl) return dbUrl
       
       if (fallbackAvatars[p.auth_user_id]) {
         return fallbackAvatars[p.auth_user_id]
       }
    }
    
    // 3. Reines DB Profil
    return getAvatarUrlWithCacheBust(p?.avatar_url)
  }

  const nameForKey = (key: Key | undefined) => fullName(key ? profileByKey[key] : undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1) Events
      const { data: eventsData, error: e1 } = await supabase
        .from('stammtisch')
        .select('id,date')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
      if (e1) throw e1
      const evs = (eventsData ?? []) as EventRow[]
      setEvents(evs)

      // 2) Teilnehmer
      const byEvent: Record<number, Set<Key>> = {}
      for (const ev of evs) {
        const goingSet: Set<Key> = new Set()

        const { data: linked, error: errL } = await supabase
          .from('stammtisch_participants')
          .select('auth_user_id,status')
          .eq('stammtisch_id', ev.id)
        if (errL) throw errL
        for (const row of (linked ?? []) as ParticipantLinkedRow[]) {
          if (row.status === 'going') goingSet.add(keyFromAuth(row.auth_user_id))
        }

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

      // 3) Profiles
      const { data: profData, error: e2 } = await supabase
        .from('profiles')
        .select('id,auth_user_id,first_name,last_name,avatar_url')
      if (e2) throw e2
      const profs = (profData ?? []) as Profile[]
      setProfiles(profs)

      // 3b) Google Avatars
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
      } catch { /* ignore */ }

      // 4) Spender-Runden
      const { data: bData, error: bErr } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id,profile_id,settled_at,approved_at,settled_stammtisch_id')
        .not('approved_at', 'is', null)
        .gte('approved_at', startApprovedInclusive)
        .lt('approved_at', endApprovedExclusive)
      if (bErr) throw bErr

      const { data: sData, error: sErr } = await supabase
        .from('spender_rounds')
        .select('auth_user_id,profile_id,created_at,approved_at,stammtisch_id')
        .not('approved_at', 'is', null)
        .gte('approved_at', startApprovedInclusive)
        .lt('approved_at', endApprovedExclusive)
      if (sErr) throw sErr

      const bRows = (bData ?? []) as DonorRow[]
      const sRows = (sData ?? []).map((r: any) => ({
        auth_user_id: r.auth_user_id,
        profile_id: r.profile_id,
        settled_at: r.created_at,
        approved_at: r.approved_at,
        settled_stammtisch_id: r.stammtisch_id
      })) as DonorRow[]

      setDonors([...bRows, ...sRows])

    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, startApprovedInclusive, endApprovedExclusive])

  useEffect(() => {
    load()
  }, [load])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  // —————————————————————————————————————————————————————————
  // RANKINGS (Normalisiert)
  // —————————————————————————————————————————————————————————

  // ——— 1) Top Teilnahmen ———
  const topTeilnahmenRanked: Ranked[] = useMemo(() => {
    const counts: Record<Key, number> = {}

    for (const ev of events) {
      const rawSet = goingKeysByEvent[ev.id] || new Set<Key>()
      const uniqueUserPerEvent = new Set<Key>()

      for (const k of rawSet) {
        let finalKey = k
        const p = profileByKey[k]
        if (p?.auth_user_id) {
          finalKey = keyFromAuth(p.auth_user_id)
        }
        uniqueUserPerEvent.add(finalKey)
      }

      for (const uniqueKey of uniqueUserPerEvent) {
        counts[uniqueKey] = (counts[uniqueKey] || 0) + 1
      }
    }

    const entries = Object.entries(counts).map(([k, v]) => ({ key: k as Key, value: v }))
    return rankTop3(entries)
  }, [events, goingKeysByEvent, profileByKey])

  // ——— 2) Längste Serien ———
  const topStreaksRanked: Ranked[] = useMemo(() => {
    const normalizedEvents: Record<number, Set<Key>> = {}
    
    for (const ev of events) {
        const rawSet = goingKeysByEvent[ev.id] || new Set<Key>()
        const normSet = new Set<Key>()
        for (const k of rawSet) {
            let final = k
            const p = profileByKey[k]
            if (p?.auth_user_id) final = keyFromAuth(p.auth_user_id)
            normSet.add(final)
        }
        normalizedEvents[ev.id] = normSet
    }

    const keysAll = new Set<Key>()
    Object.values(normalizedEvents).forEach(s => s.forEach(k => keysAll.add(k)))

    const streaks: Array<{ key: Key; value: number }> = []
    
    keysAll.forEach(k => {
      let best = 0
      let cur = 0
      for (const ev of events) {
        const going = (normalizedEvents[ev.id] || new Set<Key>()).has(k)
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
  }, [events, goingKeysByEvent, profileByKey])

  // ——— 3) Spender ———
  const topSpenderRanked: Ranked[] = useMemo(() => {
    const counts: Record<Key, number> = {}
    for (const d of donors) {
      if (!d.approved_at) continue

      let p: Profile | undefined
      if (d.profile_id) p = profileByKey[keyFromProfile(d.profile_id)]
      else if (d.auth_user_id) p = profileByKey[keyFromAuth(d.auth_user_id)]

      let k: Key | null = null
      
      if (p?.auth_user_id) k = keyFromAuth(p.auth_user_id)
      else if (p) k = keyFromProfile(p.id)
      else if (d.auth_user_id) k = keyFromAuth(d.auth_user_id)
      else if (d.profile_id) k = keyFromProfile(d.profile_id)

      if (!k) continue
      counts[k] = (counts[k] || 0) + 1
    }
    const entries = Object.entries(counts).map(([k, v]) => ({ key: k as Key, value: v }))
    return rankTop3(entries)
  }, [donors, profileByKey])

  // Renderer mit Navigation
  const renderList = (list: Ranked[], unit: string, emptyText: string) => {
    if (!list.length) return <Text style={type.body}>{emptyText}</Text>
    return (
      <View>
        {list.map((row, idx) => {
          
          const handlePress = () => {
             // Navigation zur Member Card
             if (row.key.startsWith('auth:')) {
                const uid = row.key.slice(5)
                router.push({ pathname: '/member-card', params: { authId: uid } })
             } else if (row.key.startsWith('profile:')) {
                const pid = row.key.slice(8)
                router.push({ pathname: '/member-card', params: { profileId: pid } })
             }
          }

          return (
            <PersonRow
              key={`${row.key}-${idx}`}
              rank={row.rank}
              name={nameForKey(row.key)}
              avatar={avatarForKey(row.key)}
              detail={`${row.value} ${unit}`}
              onPress={handlePress} // <--- Navigation auslösen
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