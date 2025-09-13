// app/(tabs)/hall_of_fame.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'
type Profile = {
  id: number                 // ✨ neu: DB-Primärschlüssel als stabiler Key
  auth_user_id: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  degree: Degree | null
  is_active: boolean | null
  standing_order: boolean | null
  avatar_url: string | null
}
type EventRow = { id: number; date: string }
type ParticipantRow = { auth_user_id: string; status: 'going' | 'declined' | 'maybe' }
type DonorRow = { auth_user_id: string; settled_at: string | null }
type Ranked = { auth_user_id: string; value: number }

const Y = new Date().getFullYear()

function degLabel(d: Degree | null | undefined): string {
  if (d === 'dr') return 'Dr.'
  if (d === 'prof') return 'Prof.'
  return ''
}
function safeStr(s: string | null | undefined) {
  return (s || '').trim()
}
function safeLastName(p: Profile): string {
  return safeStr(p.last_name) || safeStr(p.first_name) || ''
}

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

/** Header ohne Beschriftung */
function TableHeader() {
  return null
}

function TableRow({
  p,
  awards,    // bleibt in den Props, wird aber nicht gerendert
  thumb,
  activeIcon, // bleibt in den Props, wird aber nicht gerendert
  showMoney,
}: {
  p: Profile
  awards: { teilnahmen?: number; streak?: number; spender?: number }
  thumb?: string
  activeIcon: string
  showMoney: boolean
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {/* Thumb */}
      <View
        style={{
          width: 32, height: 32, borderRadius: 16, overflow: 'hidden',
          backgroundColor: '#222', borderWidth: 1, borderColor: colors.border, marginRight: 6
        }}
      >
        {thumb ? (
          <Image source={{ uri: thumb }} style={{ width: '100%', height: '100%' }} />
        ) : null}
      </View>

      {/* Grad */}
      <Text style={{ ...type.body, flex: 0.8 }}>{degLabel(p.degree)}</Text>

      {/* Namen – dynamisch schrumpfend, ohne Umbruch */}
      <Text
        style={{ ...type.body, flex: 1.2, minWidth: 0 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        ellipsizeMode="clip"
      >
        {safeStr(p.first_name)}
      </Text>
      <Text
        style={{ ...type.body, flex: 1.2, minWidth: 0 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        ellipsizeMode="clip"
      >
        {safeStr(p.middle_name)}
      </Text>
      <Text
        style={{ ...type.body, flex: 1.4, minWidth: 0 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        ellipsizeMode="clip"
      >
        {safeStr(p.last_name)}
      </Text>

      {/* 💶 Dauerauftrag – maximal schmal */}
      <View style={{ width: 26, alignItems: 'center' }}>
        <Text style={type.body}>{showMoney ? '💶' : ''}</Text>
      </View>

      {/* Auszeichnungen-Spalte entfernt */}
    </View>
  )
}

export default function HallOfFameScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [participantsByEvent, setParticipantsByEvent] = useState<Record<number, ParticipantRow[]>>({})
  const [donors, setDonors] = useState<DonorRow[]>([])
  const [fallbackAvatars, setFallbackAvatars] = useState<Record<string, string>>({})

  const getPublicAvatarUrl = (path: string | null | undefined) => {
    if (!path) return undefined
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl || undefined
  }
  const thumbFor = (p: Profile) => getPublicAvatarUrl(p.avatar_url) || fallbackAvatars[p.auth_user_id || '']

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // ✨ id mitladen für stabile Keys bei unverknüpften Profilen
      const { data: profData, error: e0 } = await supabase
        .from('profiles')
        .select('id,auth_user_id,first_name,middle_name,last_name,degree,is_active,standing_order,avatar_url')
      if (e0) throw e0
      const profs = (profData ?? []) as Profile[]
      setProfiles(profs)

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
      } catch {}

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

  useEffect(() => { load() }, [load])
  useFocusEffect(useCallback(() => { load(); return () => {} }, [load]))

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
    const map = new Map<string, number>()
    ranked.forEach((r, idx) => map.set(r.auth_user_id, idx + 1))
    return map
  }, [events, participantsByEvent])

  const ranksStreaks = useMemo(() => {
    const users = new Set<string>()
    for (const ev of events) {
      for (const p of (participantsByEvent[ev.id] || [])) users.add(p.auth_user_id)
    }
    const streaks: Ranked[] = []
    users.forEach(uid => {
      let best = 0, cur = 0
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

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) =>
      safeLastName(a).localeCompare(safeLastName(b), 'de', { sensitivity: 'base' }) ||
      safeStr(a.first_name).localeCompare(safeStr(b.first_name), 'de', { sensitivity: 'base' })
    )
  }, [profiles])

  const activeProfiles = useMemo(() => sortedProfiles.filter(p => !!p.is_active), [sortedProfiles])
  const passiveProfiles = useMemo(() => sortedProfiles.filter(p => !p.is_active), [sortedProfiles])

  // kleine Helfer für stabile Keys
  const kAct = (p: Profile) => `act-${p.auth_user_id ?? p.id}`
  const kPass = (p: Profile) => `pass-${p.auth_user_id ?? p.id}`

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
          <>
            {/* Aktive */}
            <Box style={{ marginTop: 16 }}>
              <Text style={{ ...type.h2, marginBottom: 8 }}>Aktive Steinmetze</Text>
              <TableHeader />
              {activeProfiles.length === 0 ? (
                <Text style={{ ...type.body, marginTop: 8 }}>Keine aktiven Mitglieder.</Text>
              ) : (
                activeProfiles.map((p) => (
                  <TableRow
                    key={kAct(p)}                 // ✨ stabiler Key
                    p={p}
                    thumb={thumbFor(p)}
                    activeIcon="🟢"
                    showMoney={!!p.standing_order}
                    awards={{
                      teilnahmen: ranksTeilnahmen.get(p.auth_user_id || ''),
                      streak: ranksStreaks.get(p.auth_user_id || ''),
                      spender: ranksSpender.get(p.auth_user_id || ''),
                    }}
                  />
                ))
              )}
            </Box>

            {/* Passive */}
            <Box style={{ marginTop: 16 }}>
              <Text style={{ ...type.h2, marginBottom: 8 }}>Passive Steinmetze</Text>
              <TableHeader />
              {passiveProfiles.length === 0 ? (
                <Text style={{ ...type.body, marginTop: 8 }}>Keine passiven Mitglieder.</Text>
              ) : (
                passiveProfiles.map((p) => (
                  <TableRow
                    key={kPass(p)}                // ✨ stabiler Key
                    p={p}
                    thumb={thumbFor(p)}
                    activeIcon="🔴"
                    showMoney={!!p.standing_order}
                    awards={{
                      teilnahmen: ranksTeilnahmen.get(p.auth_user_id || ''),
                      streak: ranksStreaks.get(p.auth_user_id || ''),
                      spender: ranksSpender.get(p.auth_user_id || ''),
                    }}
                  />
                ))
              )}
            </Box>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
