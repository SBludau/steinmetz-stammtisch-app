// app/(tabs)/index.tsx
import { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Row = { id: number; date: string; location: string; notes: string | null }
type Degree = 'none' | 'dr' | 'prof'
type Profile = {
  auth_user_id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  degree: Degree | null
  birthday: string | null
  avatar_url: string | null
  standing_order: boolean | null
}

const BANNER = require('../../assets/images/banner.png')

// ---- Helpers ----
const degLabel = (d: Degree | null | undefined) => (d === 'dr' ? 'Dr. ' : d === 'prof' ? 'Prof. ' : '')
const shortName = (p: Profile) =>
  `${degLabel(p.degree)}${(p.first_name || '').trim()} ${(p.last_name || '').trim()}`.trim()

const germanDate = (isoDate: string) => {
  try {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return isoDate }
}
const germanMonthYear = (isoDate: string) => {
  try {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  } catch { return isoDate.slice(0, 7) }
}
const germanDateShort = (isoDate: string) => {
  try {
    const d = new Date(isoDate + 'T00:00:00')
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    return `${dd}.${mm}.${yy}`
  } catch { return isoDate }
}
const parseYMD = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}
const cmpDate = (a: string, b: string) => a.localeCompare(b)

// Alter am Referenzdatum (Eventtag)
const ageOnDate = (birthdayIso: string, refIso: string) => {
  const b = parseYMD(birthdayIso)
  const r = parseYMD(refIso)
  let age = r.y - b.y
  const beforeBirthday = r.m < b.m || (r.m === b.m && r.d < b.d)
  if (beforeBirthday) age -= 1
  return age
}

// Vegas-Counter: Anzahl „1. des Monats“ von START bis HEUTE (inklusive)
const countFirstsSince = (startIso: string, todayIso: string) => {
  const s = parseYMD(startIso); const t = parseYMD(todayIso)
  const base = (t.y - s.y) * 12 + (t.m - s.m)
  if (base < 0) return 0
  return base + 1
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const navigation = useNavigation()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  // Profile + Google-Fallback-Avatare
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [fallbackAvatars, setFallbackAvatars] = useState<Record<string, string>>({})

  // (NEU) Vegas-Settings (aus DB)
  const [vegasStartAmount, setVegasStartAmount] = useState<number>(1500)
  const [vegasStartDate, setVegasStartDate] = useState<string>('2025-08-01')

  // Session prüfen
  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        const { data } = await supabase.auth.getSession()
        if (!active) return
        if (!data?.session) {
          router.replace('/login')
          return
        }
        setSessionChecked(true)
      })()
      return () => { active = false }
    }, [router])
  )

  // Events laden
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stammtisch')
        .select('id,date,location,notes')
        .order('date', { ascending: true })
      if (error) throw error
      setRows(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    loadData()
  }, [sessionChecked, loadData])

  // Profile laden (inkl. Felder für Geburtstags-Runden & Vegas)
  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('auth_user_id, first_name, middle_name, last_name, degree, birthday, avatar_url, standing_order')
    if (error) { setProfiles([]); return }
    const profs = (data ?? []) as Profile[]
    setProfiles(profs)

    // Google-Avatar-Fallbacks (leise ignorieren, falls RPC fehlt)
    try {
      const ids = profs.map(p => p.auth_user_id)
      if (ids.length) {
        const { data: fb, error: fbErr } = await supabase.rpc('public_get_google_avatars', { p_user_ids: ids })
        if (!fbErr && Array.isArray(fb)) {
          const map: Record<string, string> = {}
          for (const row of fb as Array<{ auth_user_id: string; avatar_url?: string | null }>) {
            if (row.avatar_url) map[row.auth_user_id] = row.avatar_url
          }
          setFallbackAvatars(map)
        }
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    loadProfiles()
  }, [sessionChecked, loadProfiles])

  // (NEU) Settings laden
  const loadVegasSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'vegas')
        .maybeSingle()
      if (!error && data?.value) {
        const startAmount = Number(data.value.start_amount)
        const startDate = String(data.value.start_date || '')
        if (!Number.isNaN(startAmount)) setVegasStartAmount(startAmount)
        if (startDate.match(/^\d{4}-\d{2}-\d{2}$/)) setVegasStartDate(startDate)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    loadVegasSettings()
  }, [sessionChecked, loadVegasSettings])

  // Realtime für Events
  useEffect(() => {
    if (!sessionChecked) return
    const ch = supabase
      .channel('public:stammtisch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stammtisch' }, payload => {
        const r = payload.new as Row
        setRows(prev => (prev.some(x => x.id === r.id) ? prev : [...prev, r]))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stammtisch' }, payload => {
        const r = payload.new as Row
        setRows(prev => prev.map(p => (p.id === r.id ? r : p)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'stammtisch' }, payload => {
        const oldId = (payload.old as any)?.id
        setRows(prev => prev.filter(p => p.id !== oldId))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [sessionChecked])

  // heute immer frisch berechnen bei jedem Aufruf
  const todayStr = new Date().toISOString().slice(0, 10)

  const upcoming = useMemo(
    () => rows.filter(r => r.date >= todayStr).sort((a, b) => (cmpDate(a.date, b.date) || a.id - b.id)),
    [rows, todayStr]
  )
  const past = useMemo(
    () => rows.filter(r => r.date < todayStr).sort((a, b) => (cmpDate(b.date, a.date) || b.id - a.id)),
    [rows, todayStr]
  )

  // eigene Profilkarte (oben)
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null; avatar_url: string | null; auth_user_id?: string | null } | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [avatarPublicUrl, setAvatarPublicUrl] = useState<string | null>(null)

  const getPublicAvatarUrl = (path: string | null | undefined) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl ?? null
  }

  const loadProfileCard = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    setUserEmail(userData.user.email ?? null)
    const uid = userData.user.id
    const { data } = await supabase
      .from('profiles')
      .select('auth_user_id,first_name,last_name,avatar_url')
      .eq('auth_user_id', uid)
      .maybeSingle()
    const prof = {
      auth_user_id: data?.auth_user_id ?? null,
      first_name: data?.first_name ?? null,
      last_name: data?.last_name ?? null,
      avatar_url: data?.avatar_url ?? null,
    }
    setProfile(prof)
    const bust = `?v=${Date.now()}`
    const uploaded = getPublicAvatarUrl(prof.avatar_url)
    if (uploaded) { setAvatarPublicUrl(uploaded + bust); return }
    // Fallback: Google-Avatar
    try {
      const { data: fb } = await supabase.rpc('public_get_google_avatars', { p_user_ids: [uid] })
      const url = Array.isArray(fb) && fb[0]?.avatar_url ? String(fb[0].avatar_url) : null
      setAvatarPublicUrl(url ? url + bust : null)
    } catch { setAvatarPublicUrl(null) }
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    loadProfileCard()
  }, [sessionChecked, loadProfileCard])

  const nameOrEmail = useMemo(() => {
    const fn = profile?.first_name?.trim() || ''
    const ln = profile?.last_name?.trim() || ''
    const full = `${fn} ${ln}`.trim()
    return full.length > 0 ? full : userEmail ?? ''
  }, [profile, userEmail])

  // Geburtstags-Runden (je Event: alle Profile, deren birthday-MONTH == event-MONTH)
  const birthdayRowsFor = useCallback((eventDateIso: string) => {
    const targetMonth = eventDateIso.slice(5,7) // nur MM vergleichen!
    return (profiles ?? [])
      .filter(p => !!p.birthday && (p.birthday as string).slice(5,7) === targetMonth)
      .sort((a, b) =>
        (a.last_name || '').localeCompare((b.last_name || ''), 'de', { sensitivity: 'base' }) ||
        (a.first_name || '').localeCompare((b.first_name || ''), 'de', { sensitivity: 'base' })
      )
  }, [profiles])

  const avatarFor = (p: Profile): string | undefined => {
    return getPublicAvatarUrl(p.avatar_url) || fallbackAvatars[p.auth_user_id] || undefined
  }

  // Vegas Counter (aus Settings)
  const standingCount = useMemo(() => (profiles ?? []).filter(p => !!p.standing_order).length, [profiles])
  const monthsPassed = useMemo(() => countFirstsSince(vegasStartDate, todayStr), [vegasStartDate, todayStr])
  const vegasTotal = useMemo(() => {
    const inflow = standingCount * monthsPassed * 20
    return vegasStartAmount + inflow
  }, [vegasStartAmount, standingCount, monthsPassed])
  const euro = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

  // Bei jedem Focus alles frisch laden
  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked) return
      loadData()
      loadProfiles()
      loadProfileCard()
      loadVegasSettings()
    }, [sessionChecked, loadData, loadProfiles, loadProfileCard, loadVegasSettings])
  )

  // (NEU) Auch beim erneuten Antippen des Home-Tabs (BottomNav) alles neu laden
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', () => {
      if (!sessionChecked) return
      loadData()
      loadProfiles()
      loadProfileCard()
      loadVegasSettings()
    })
    return unsub
  }, [navigation, sessionChecked, loadData, loadProfiles, loadProfileCard, loadVegasSettings])

  // ---- UI ----

  const renderItem = ({ item }: { item: Row }) => {
    const birthdays = birthdayRowsFor(item.date)

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/stammtisch/[id]', params: { id: String(item.id) } })}
        style={{
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 6,
        }}
      >
        <Text style={type.body}>{item.date} • {item.location}</Text>

        {birthdays.length > 0 ? (
          <View style={{ gap: 4 }}>
            <Text style={type.caption}>Geburtstags-Runden {germanMonthYear(item.date)}:</Text>
            {birthdays.map(p => (
              <View key={p.auth_user_id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {avatarFor(p) ? (
                  <Image
                    source={{ uri: avatarFor(p)! }}
                    style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border }}
                  />
                ) : (
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border }} />
                )}
                <Text style={type.body}>
                  {shortName(p)} — {germanDateShort(p.birthday!)} ({ageOnDate(p.birthday!, item.date)})
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    )
  }

  const SectionBox = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        borderRadius: radius.md,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 8,
      }}
    >
      {children}
    </View>
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
        {/* Banner */}
        <View
          style={{
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            alignItems: 'center',
          }}
        >
          <Image
            source={BANNER}
            resizeMode="contain"
            style={{ width: '100%', maxWidth: 3000, aspectRatio: 3, height: undefined }}
          />
        </View>

        {/* Profil-Karte */}
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          style={{
            marginTop: 12,
            marginBottom: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {avatarPublicUrl ? (
            <Image
              source={{ uri: avatarPublicUrl }}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}
            />
          ) : (
            <View
              style={{
                width: 48, height: 48, borderRadius: 24,
                borderWidth: 1, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.text }}>🙂</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={type.body}>{nameOrEmail}</Text>
            <Text style={type.caption}>Profil bearbeiten</Text>
          </View>
        </Pressable>

        {/* Tabs (2/3 : 1/3) */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <Pressable
            onPress={() => setActiveTab('upcoming')}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: activeTab === 'upcoming' ? colors.gold : colors.cardBg,
              alignItems: 'center',
            }}
          >
            <Text style={[type.body, { color: activeTab === 'upcoming' ? colors.bg : colors.text }]}>
              Bevorstehend
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('past')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: activeTab === 'past' ? colors.gold : colors.cardBg,
              alignItems: 'center',
            }}
          >
            <Text style={[type.body, { color: activeTab === 'past' ? colors.bg : colors.text }]}>
              Früher
            </Text>
          </Pressable>
        </View>

        {/* Inhalt je Tab */}
        {activeTab === 'upcoming' ? (
          <SectionBox>
            {upcoming.length === 0 ? (
              <Text style={type.body}>Keine Einträge.</Text>
            ) : (
              <View>{upcoming.map(item => <View key={item.id}>{renderItem({ item })}</View>)}</View>
            )}
          </SectionBox>
        ) : (
          <SectionBox>
            {past.length === 0 ? (
              <Text style={type.body}>Keine Einträge.</Text>
            ) : (
              <View>{past.map(item => <View key={item.id}>{renderItem({ item })}</View>)}</View>
            )}
          </SectionBox>
        )}

        {/* Vegas Counter */}
        <View
          style={{
            marginTop: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            gap: 4,
          }}
        >
          <Text style={type.h2}>Vegas Counter</Text>
          <Text style={{ ...type.body, fontWeight: '700', fontSize: 20 }}>
            { vegasTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }
          </Text>
          <Text style={type.caption}>
            Startbetrag am {germanDate(vegasStartDate)}: {euro(vegasStartAmount)} + {monthsPassed} Monate mit {standingCount} Mitgliedern mit Dauerauftrag à 20 €
          </Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
