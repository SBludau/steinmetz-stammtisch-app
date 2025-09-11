// app/(tabs)/stats.tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

// ——————————————————————————————————————————
// Types
// ——————————————————————————————————————————
type Profile = {
  auth_user_id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}
type EventRow = { id: number; date: string }
type ParticipantRow = { auth_user_id: string; status: 'going' | 'declined' | 'maybe' }
type DonorRow = { auth_user_id: string; settled_at: string | null }

type Ranked = { auth_user_id: string; value: number }

// ——————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————
const CURRENT_YEAR = new Date().getFullYear()

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

// ——————————————————————————————————————————
// Hauptseite
// ——————————————————————————————————————————
export default function StatsScreen() {
  const insets = useSafeAreaInsets()

  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [events, setEvents] = useState<EventRow[]>([])
  const [participantsByEvent, setParticipantsByEvent] = useState<Record<number, ParticipantRow[]>>({})
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [donors, setDonors] = useState<DonorRow[]>([])
  const [fallbackAvatars, setFallbackAvatars] = useState<Record<string, string>>({}) // Google-Fallback

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = CURRENT_YEAR; y >= CURRENT_YEAR - 5; y--) arr.push(y)
    return arr
  }, [])

  const avatarFor = (uid: string | undefined) => {
    if (!uid) return undefined
    const p = profileById[uid]
    return getPublicAvatarUrl(p?.avatar_url) || fallbackAvatars[uid]
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1) Events im gewählten Jahr
      const start = `${selectedYear}-01-01`
      const end = `${selectedYear}-12-31`
      const { data: eventsData, error: e1 } = await supabase
        .from('stammtisch')
        .select('id,date')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })
      if (e1) throw e1
      const evs = (eventsData ?? []) as EventRow[]
      setEvents(evs)

      // 2) Teilnehmer je Event
      const byEvent: Record<number, ParticipantRow[]> = {}
      for (const ev of evs) {
        const { data, error } = await supabase
          .from('stammtisch_participants')
          .select('auth_user_id,status')
          .eq('stammtisch_id', ev.id)
        if (error) throw error
        byEvent[ev.id] = (data ?? []) as ParticipantRow[]
      }
      setParticipantsByEvent(byEvent)

      // 3) Profiles (für Namen + Avatare)
      const { data: profData, error: e2 } = await supabase
        .from('profiles')
        .select('auth_user_id,first_name,last_name,avatar_url')
      if (e2) throw e2
      const profs = (profData ?? []) as Profile[]
      setProfiles(profs)

      // 3b) Google-Avatar-Fallback via RPC (optional)
      try {
        const userIds = profs.map(p => p.auth_user_id)
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

      // 4) Donors (gewähltes Jahr, settled)
      const { data: donorData, error: e3 } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id,settled_at')
        .not('settled_at', 'is', null)
        .gte('settled_at', start)
        .lte('settled_at', end)
      if (e3) throw e3
      setDonors((donorData ?? []) as DonorRow[])
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    load()
  }, [load])

  // Profile-Map
  const profileById = useMemo(() => {
    const map: Record<string, Profile> = {}
    for (const p of profiles) map[p.auth_user_id] = p
    return map
  }, [profiles])

  // ——— 1) Top 5 Teilnahmen (status = going) ———
  const top5Teilnahmen: Ranked[] = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const ev of events) {
      const list = participantsByEvent[ev.id] || []
      for (const row of list) {
        if (row.status === 'going') counts[row.auth_user_id] = (counts[row.auth_user_id] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([auth_user_id, value]) => ({ auth_user_id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [events, participantsByEvent])

  // ——— 2) Top 5 längste Serien ———
  const top5Streaks: Ranked[] = useMemo(() => {
    const users = new Set<string>()
    for (const ev of events) {
      for (const p of (participantsByEvent[ev.id] || [])) users.add(p.auth_user_id)
    }
    const streaks: Ranked[] = []

    users.forEach(uid => {
      let best = 0
      let cur = 0
      for (const ev of events) {
        const list = participantsByEvent[ev.id] || []
        const going = list.some(p => p.auth_user_id === uid && p.status === 'going')
        if (going) {
          cur += 1
          if (cur > best) best = cur
        } else {
          cur = 0
        }
      }
      if (best > 0) streaks.push({ auth_user_id: uid, value: best })
    })

    return streaks.sort((a, b) => b.value - a.value).slice(0, 5)
  }, [events, participantsByEvent])

  // ——— 3) Top 5 Spender ———
  const top5Spender: Ranked[] = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of donors) {
      if (!d.settled_at) continue
      counts[d.auth_user_id] = (counts[d.auth_user_id] || 0) + 1
    }
    return Object.entries(counts)
      .map(([auth_user_id, value]) => ({ auth_user_id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [donors])

  // Renderer
  const renderList = (list: Ranked[], unit: string, emptyText: string) => {
    if (!list.length) return <Text style={type.body}>{emptyText}</Text>
    return (
      <View>
        {list.map((row, idx) => {
          const prof = profileById[row.auth_user_id]
          return (
            <PersonRow
              key={row.auth_user_id}
              rank={idx + 1}
              name={fullName(prof)}
              avatar={avatarFor(row.auth_user_id)}
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

        {/* Jahr-Auswahl */}
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            overflow: 'hidden',
            backgroundColor: '#0d0d0d',
            width: 180,
          }}
        >
          <Picker
            selectedValue={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(parseInt(String(v), 10))}
            dropdownIconColor={colors.text}
          >
            {years.map(y => (
              <Picker.Item key={y} label={`Jahr ${y}`} value={String(y)} />
            ))}
          </Picker>
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
                subtitle={`Top 5 – Teilnehmer am Stammtisch im Jahr ${selectedYear}`}
              />
              {renderList(top5Teilnahmen, 'Teilnahmen', 'Noch keine Daten für dieses Jahr.')}
            </Box>

            <View style={{ height: 12 }} />

            <Box>
              <Header
                emoji="🔥"
                title="Serien-Trinker"
                subtitle={`Top 5 – der längsten Anwesenheitsserien im Jahr ${selectedYear}`}
              />
              {renderList(top5Streaks, 'x in Folge', 'Noch keine Serien gefunden.')}
            </Box>

            <View style={{ height: 12 }} />

            <Box>
              <Header
                emoji="🍻"
                title="Schankwirtschafts-Runden"
                subtitle={`Top 5 – großzügigste Spender im Jahr ${selectedYear}`}
              />
              {renderList(top5Spender, 'Runden', 'Noch keine Runden verbucht.')}
            </Box>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
