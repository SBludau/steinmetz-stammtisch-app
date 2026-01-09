// app/(tabs)/index.tsx
import { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Image, Pressable, ScrollView, TextInput, Alert, Platform, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Audio } from 'expo-av' // <--- NEU: Audio Import
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

// ---- Konfiguration ----
const BUG_REPORT_URL = 'https://forms.gle/DeinKopierterCodeHier' // <--- HIER DEINEN LINK PRÜFEN

// ---- Assets: Fürze (Genau deine Dateinamen) ----
const FART_SOUNDS = [
  require('../../assets/sounds/692p2psp9cw-farts-sfx-7.mp3'),
  require('../../assets/sounds/aqkv1blyjfj-farts-sfx-5.mp3'),
  require('../../assets/sounds/c15cwzuu2ur-farts-sfx-3.mp3'),
  require('../../assets/sounds/hvc0mpvociu-farts-sfx-2.mp3'),
  require('../../assets/sounds/mpkm722i4g-farts-sfx-0.mp3'),
  require('../../assets/sounds/spbq5hnkc1-farts-sfx-6.mp3'),
  require('../../assets/sounds/y4ggm7y5yir-farts-sfx-4.mp3'),
  require('../../assets/sounds/znaqxa9i3ng-farts-sfx-8.mp3'),
]

// ---- GitHub Logic & Cache ----
const GITHUB_REPO = 'SBludau/steinmetz-stammtisch-app'
let githubCache = {
  data: null as string | null,
  timestamp: 0
}

const fetchGitHubStats = async (): Promise<string> => {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  // 1. Cache prüfen
  if (githubCache.data && (now - githubCache.timestamp < oneHour)) {
    return githubCache.data
  }

  try {
    // 2. Daten laden
    // A) Basisdaten für Datum
    const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
    if (!repoRes.ok) throw new Error('Repo fetch failed')
    const repoData = await repoRes.json()
    const pushedDate = repoData.pushed_at ? repoData.pushed_at.slice(0, 10) : '????-??-??'

    // B) Version ermitteln (Release ODER Tag)
    let version = 'unreleased'
    try {
      const relRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      if (relRes.ok) {
        const relData = await relRes.json()
        version = relData.tag_name || version
      } else {
        const tagsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/tags`)
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          if (Array.isArray(tagsData) && tagsData.length > 0) {
            version = tagsData[0].name 
          }
        }
      }
    } catch { /* Fallback bleibt unreleased */ }

    // C) Commits (letztes Jahr)
    let commits = 0
    try {
      const statsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/stats/participation`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (Array.isArray(statsData.all)) {
          commits = statsData.all.reduce((a: number, b: number) => a + b, 0)
        }
      }
    } catch { /* Fallback bleibt 0 */ }

    // 3. String bauen
    const infoString = `Steinmetz Source · ${version} · ${commits} Commits · Stand: ${pushedDate}`

    // 4. Cache aktualisieren
    githubCache = {
      data: infoString,
      timestamp: now
    }

    return infoString

  } catch (error) {
    if (githubCache.data) {
      return githubCache.data
    }
    return 'Steinmetz Source · GitHub-Daten aktuell nicht verfügbar'
  }
}

// ---- Types ----

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
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [fallbackAvatars, setFallbackAvatars] = useState<Record<string, string>>({})

  // (NEU) Vegas-Settings (aus DB)
  const [vegasStartAmount, setVegasStartAmount] = useState<number>(1500)
  const [vegasStartDate, setVegasStartDate] = useState<string>('2025-08-01')

  // State für Vegas-Rechner
  const [predMonth, setPredMonth] = useState('')
  const [predYear, setPredYear] = useState('')
  const [vegasCollapsed, setVegasCollapsed] = useState(true)

  // ---- NEU: State für GitHub Info ----
  const [githubInfo, setGithubInfo] = useState<string>('Lade Daten...')

  // ---- NEU: GitHub Stats laden ----
  useEffect(() => {
    fetchGitHubStats().then(setGithubInfo)
  }, [])

  // ---- NEU: Furz abspielen Funktion ----
  const playRandomFart = async () => {
    try {
      // 1. Zufälligen Index wählen
      const randomIndex = Math.floor(Math.random() * FART_SOUNDS.length)
      const soundFile = FART_SOUNDS[randomIndex]

      // 2. Sound laden und abspielen (Async, damit UI nicht blockiert)
      await Audio.Sound.createAsync(soundFile, { shouldPlay: true })
    } catch (error) {
      console.log('Konnte Sound nicht abspielen', error)
    }
  }

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

  // Rechner-Funktion
  const calcFuture = () => {
    const m = parseInt(predMonth)
    const y = parseInt(predYear)
    if (!m || !y || m < 1 || m > 12 || y < 2020) {
      Alert.alert('Bitte Datum prüfen', 'Gültigen Monat (1-12) und Jahr eingeben.')
      return
    }
    const futureDateStr = `${y}-${String(m).padStart(2, '0')}-01`
    const monthsFuture = countFirstsSince(vegasStartDate, futureDateStr)
    const inflow = standingCount * monthsFuture * 20
    const total = vegasStartAmount + inflow
    
    // Monatsname ermitteln
    const monthName = new Date(y, m - 1).toLocaleString('de-DE', { month: 'long' })
    
    Alert.alert(
      'Vegas Prognose',
      `Im Monat ${monthName} im Jahr ${y} werden wir vermutlich ${euro(total)} Kohle zur Verfügung haben.`
    )
  }

  // Bei jedem Focus alles frisch laden
  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked) return
      loadData()
      loadProfiles()
      loadProfileCard()
      loadVegasSettings()
      // Auch Stats aktualisieren bei Focus
      fetchGitHubStats().then(setGithubInfo)
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
      fetchGitHubStats().then(setGithubInfo)
    })
    return unsub
  }, [navigation, sessionChecked, loadData, loadProfiles, loadProfileCard, loadVegasSettings])

  // ---- UI ----

  const renderItem = ({ item }: { item: Row }) => {
    const birthdays = birthdayRowsFor(item.date)
    const isToday = item.date === todayStr // Prüfen ob heute

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/stammtisch/[id]', params: { id: String(item.id) } })}
        style={({ pressed }) => ({
          backgroundColor: colors.cardBg, // Karte-Look
          borderRadius: radius.md,
          padding: 16,
          marginBottom: 12,
          borderWidth: isToday ? 2 : 1, // Dickerer Rand für heute
          borderColor: isToday ? colors.gold : colors.border, // Gold für heute, sonst Standard
          opacity: pressed ? 0.8 : 1, // Feedback
          
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        })}
      >
        {/* LINKER BEREICH */}
        <View style={{ flex: 1, gap: 6 }}>
          
          {/* Datum + Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ ...type.h2, fontSize: 18 }}>
              {germanDate(item.date)}
            </Text>
            
            {isToday && (
              <View style={{ 
                backgroundColor: colors.gold, 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                borderRadius: 4 
              }}>
                <Text style={{ color: colors.bg, fontWeight: 'bold', fontSize: 12 }}>HEUTE</Text>
              </View>
            )}
          </View>

          <Text style={{ ...type.body, color: '#ccc' }}>{item.location}</Text>

          {birthdays.length > 0 ? (
            <View style={{ marginTop: 6, gap: 4 }}>
              <Text style={{ ...type.caption, color: colors.gold }}>Geburtstags-Runden {germanMonthYear(item.date)}:</Text>
              {birthdays.map(p => (
                <View key={p.auth_user_id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {avatarFor(p) ? (
                    <Image
                      source={{ uri: avatarFor(p)! }}
                      style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border }}
                    />
                  ) : (
                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: '#333' }} />
                  )}
                  <Text style={type.body}>
                    {shortName(p)} — {germanDateShort(p.birthday!)} ({ageOnDate(p.birthday!, item.date)})
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* RECHTER BEREICH: PFEIL */}
        <View style={{ paddingLeft: 10 }}>
          <Text style={{ color: isToday ? colors.gold : '#666', fontSize: 24, fontWeight: 'bold' }}>
            ›
          </Text>
        </View>

      </Pressable>
    )
  }

  const SectionBox = ({ children }: { children: React.ReactNode }) => (
    // Die SectionBox für die Liste selbst braucht kein Styling mehr, da die Items jetzt Karten sind.
    // Wir rendern children einfach direkt oder in einem Container ohne Rand.
    <View style={{ marginBottom: 12 }}>
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
            style={{ 
              width: '100%', 
              maxWidth: 3000, 
              aspectRatio: 3, 
              height: undefined, 
              maxHeight: Platform.OS === 'web' ? 300 : undefined 
            }}
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

        {/* Tabs (1 : 1) - gleich breit */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <Pressable
            onPress={() => setActiveTab('upcoming')}
            style={{
              flex: 1, // BEIDE auf flex: 1 für gleiche Breite
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
              flex: 1, // BEIDE auf flex: 1 für gleiche Breite
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
              <View style={{ padding: 12, backgroundColor: colors.cardBg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
                 <Text style={type.body}>Keine Einträge.</Text>
              </View>
            ) : (
              <View>{upcoming.map(item => <View key={item.id}>{renderItem({ item })}</View>)}</View>
            )}
          </SectionBox>
        ) : (
          <SectionBox>
            {past.length === 0 ? (
              <View style={{ padding: 12, backgroundColor: colors.cardBg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
                 <Text style={type.body}>Keine Einträge.</Text>
              </View>
            ) : (
              <View>{past.map(item => <View key={item.id}>{renderItem({ item })}</View>)}</View>
            )}
          </SectionBox>
        )}

        {/* Vegas Counter (Collapsible) */}
        <Pressable
          onPress={() => setVegasCollapsed(!vegasCollapsed)}
          style={{
            marginTop: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
          }}
        >
          {/* Header Row (Always visible) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...type.h2, fontSize: 18 }}>
              Vegas Counter: <Text style={{ color: colors.gold }}>{euro(vegasTotal)}</Text>
            </Text>
            <Text style={{ fontSize: 24 }}>💸</Text>
          </View>

          {/* Expanded Content */}
          {!vegasCollapsed && (
            <View style={{ marginTop: 12 }}>
              <Text style={type.caption}>
                Startbetrag am {germanDate(vegasStartDate)}: {euro(vegasStartAmount)} + {monthsPassed} Monate mit {standingCount} Mitgliedern mit Dauerauftrag à 20 €
              </Text>
              
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
              
              <Text style={type.h2}>Prognose</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <TextInput
                  placeholder="Monat"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={2}
                  value={predMonth}
                  onChangeText={setPredMonth}
                  style={{
                    flex: 1,
                    backgroundColor: colors.bg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    padding: 10,
                    color: colors.text,
                    textAlign: 'center'
                  }}
                />
                <TextInput
                  placeholder="Jahr"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={4}
                  value={predYear}
                  onChangeText={setPredYear}
                  style={{
                    flex: 1,
                    backgroundColor: colors.bg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    padding: 10,
                    color: colors.text,
                    textAlign: 'center'
                  }}
                />
                <Pressable
                  onPress={calcFuture}
                  style={{
                    backgroundColor: colors.gold,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: radius.sm,
                  }}
                >
                  <Text style={{ ...type.body, color: colors.bg, fontWeight: 'bold' }}>Sach an!</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>

        {/* ---- NEU: Furtz Button ---- */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Pressable 
            onPress={playRandomFart}
            style={({pressed}) => ({
              backgroundColor: '#3e3e3e',
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
              borderWidth: 1,
              borderColor: '#555'
            })}
          >
            <Text style={{ fontSize: 24 }}>💨</Text>
          </Pressable>
          <Text style={{ ...type.caption, fontSize: 10, marginTop: 4, color: '#666' }}>Druckabbau</Text>
        </View>

        {/* ---- NEU: GitHub Stats & Bug Report ---- */}
        <View style={{ marginTop: 24, marginBottom: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>
            {githubInfo}{' '}
            <Text 
              onPress={() => Linking.openURL(BUG_REPORT_URL)}
              style={{ fontSize: 12 }}
            >
              🐞
            </Text>
          </Text>
        </View>

      </ScrollView>

      <BottomNav />
    </View>
  )
}