// app/(tabs)/hall_of_fame.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

// ——————————————————————————————————————————
// Types
// ——————————————————————————————————————————
type Profile = { auth_user_id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }
type EventRow = { id: number; date: string }
type ParticipantRow = { auth_user_id: string; status: 'going' | 'declined' | 'maybe' }
type DonorRow = { auth_user_id: string; settled_at: string | null }
type Ranked = { auth_user_id: string; value: number }

// Avatar-Bucket wie im Projekt
const AVATAR_BASE_URL =
  'https://bcbqnkycjroiskwqcftc.supabase.co/storage/v1/object/public/avatars'

const Y = new Date().getFullYear()

// ——————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————
function fullName(p: Profile): string {
  const fn = (p.first_name || '').trim()
  const ln = (p.last_name || '').trim()
  return `${fn} ${ln}`.trim() || 'Ohne Namen'
}
function avatarUrl(p: Profile): string | undefined {
  if (!p.avatar_url) return undefined
  return `${AVATAR_BASE_URL}/${p.avatar_url}`
}
function safeLastName(p: Profile): string {
  return (p.last_name || '').trim() || (p.first_name || '').trim() || ''
}

// ——————————————————————————————————————————
// UI Bausteine
// ——————————————————————————————————————————
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

function Badge({
  emoji,
  label,
  place,
}: {
  emoji: string
  label: string // z.B. "Dauerbrenner"
  place: number // 1..5 bzw. 1..3
}) {
  // Zugänglicher Alternativtext
  const a11y = `${label} Platz ${place}`
  return (
    <Text
      accessibilityRole="text"
      accessible
      accessibilityLabel={a11y}
      style={{
        marginLeft: 6,
        fontSize: 16,
      }}
    >
      {emoji} #{place}
    </Text>
  )
}

function MemberRow({
  profile,
  awards,
}: {
  profile: Profile
  awards: { teilnahmen?: number; streak?: number; spender?: number }
}) {
  const name = fullName(profile)
  const avatar = avatarUrl(profile)

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#222',
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 10,
          }}
          accessible
          accessibilityLabel={`Profilbild von ${name}`}
        >
          {avatar ? <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%' }} /> : null}
        </View>
        <Text style={{ ...type.body, fontWeight: '600' }}>{name}</Text>
      </View>

      {/* Auszeichnungen rechts */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {typeof awards.teilnahmen === 'number' && <Badge emoji="🏆" label="Dauerbrenner" place={awards.teilnahmen} />}
        {typeof awards.streak === 'number' && <Badge emoji="🔥" label="Serien-Junkie" place={awards.streak} />}
        {typeof awards.spender === 'number' && <Badge emoji="🍻" label="Edler Spender" place={awards.spender} />}
      </View>
    </View>
  )
}

// ——————————————————————————————————————————
// Seite
// ——————————————————————————————————————————
export default function HallOfFameScreen() {
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [participantsByEvent, setParticipantsByEvent] = useState<Record<number, ParticipantRow[]>>({})
  const [donors, setDonors] = useState<DonorRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 0) Profiles: alle Mitglieder
      const { data: profData, error: e0 } = await supabase
        .from('profiles')
        .select('auth_user_id,first_name,last_name,avatar_url')
      if (e0) throw e0
      setProfiles((profData ?? []) as Profile[])

      // 1) Events dieses Jahr
      const start = `${Y}-01-01`
      const end = `${Y}-12-31`
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

      // 3) Spender (dieses Jahr)
      const { data: donorData, error: e3 } = await supabase
        .from('birthday_rounds')
        .select('auth_user_id,settled_at')
        .not('settled_at', 'is', null)
        .gte('settled_at', `${Y}-01-01`)
        .lte('settled_at', `${Y}-12-31`)
      if (e3) throw e3
      setDonors((donorData ?? []) as DonorRow[])
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ——— Rankings berechnen (wie auf der Stats-Seite) ———

  // 1) Teilnahmen Top 5
  const ranksTeilnahmen = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const ev of events) {
      const list = participantsByEvent[ev.id] || []
      for (const row of list) {
        if (row.status === 'going') counts[row.auth_user_id] = (counts[row.auth_user_id] || 0) + 1
      }
    }
    const ranked: Ranked[] = Object.entries(counts)
      .map(([auth_user_id, value]) => ({ auth_user_id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Map -> Platz (1..5)
    const map = new Map<string, number>()
    ranked.forEach((r, idx) => map.set(r.auth_user_id, idx + 1))
    return map
  }, [events, participantsByEvent])

  // 2) Streaks Top 3
  const ranksStreaks = useMemo(() => {
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
        if (going) { cur += 1; if (cur > best) best = cur } else { cur = 0 }
      }
      if (best > 0) streaks.push({ auth_user_id: uid, value: best })
    })
    const ranked = streaks.sort((a, b) => b.value - a.value).slice(0, 3)
    const map = new Map<string, number>()
    ranked.forEach((r, idx) => map.set(r.auth_user_id, idx + 1))
    return map
  }, [events, participantsByEvent])

  // 3) Spender Top 5
  const ranksSpender = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of donors) {
      if (!d.settled_at) continue
      counts[d.auth_user_id] = (counts[d.auth_user_id] || 0) + 1
    }
    const ranked: Ranked[] = Object.entries(counts)
      .map(([auth_user_id, value]) => ({ auth_user_id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const map = new Map<string, number>()
    ranked.forEach((r, idx) => map.set(r.auth_user_id, idx + 1))
    return map
  }, [donors])

  // ——— Mitglieder alphabetisch sortieren (Nachname, de-Kollation) ———
  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) =>
      safeLastName(a).localeCompare(safeLastName(b), 'de', { sensitivity: 'base' }) ||
      (a.first_name || '').localeCompare(b.first_name || '', 'de', { sensitivity: 'base' })
    )
  }, [profiles])

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 12,
          paddingBottom: NAV_BAR_BASE_HEIGHT + insets.bottom + 24,
        }}
      >
        <Text style={type.h1}>Hall of Fame</Text>
        <Text style={{ ...type.bodyMuted, marginTop: 4 }}>
          Alle Mitglieder alphabetisch – Auszeichnungen zeigen Platzierungen aus {Y}.
        </Text>

        {loading ? (
          <View style={{ marginTop: 24 }}>
            <ActivityIndicator color={colors.gold} />
            <Text style={{ ...type.bodyMuted, marginTop: 8 }}>Lade Mitglieder & Auszeichnungen…</Text>
          </View>
        ) : error ? (
          <View style={{ marginTop: 24 }}>
            <Text style={{ ...type.body, color: colors.red }}>Fehler: {error}</Text>
          </View>
        ) : (
          <Box style={{ marginTop: 16 }}>
            {sortedProfiles.length === 0 ? (
              <Text style={type.body}>Keine Mitglieder gefunden.</Text>
            ) : (
              <View>
                {sortedProfiles.map((p) => (
                  <MemberRow
                    key={p.auth_user_id}
                    profile={p}
                    awards={{
                      teilnahmen: ranksTeilnahmen.get(p.auth_user_id),
                      streak: ranksStreaks.get(p.auth_user_id),
                      spender: ranksSpender.get(p.auth_user_id),
                    }}
                  />
                ))}
              </View>
            )}
          </Box>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
