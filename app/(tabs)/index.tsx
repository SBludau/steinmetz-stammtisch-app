import { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Image, Pressable, FlatList, Button, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Row = { id: number; date: string; location: string; notes: string | null }
type Profile = { first_name: string | null; last_name: string | null; avatar_url: string | null }

// Banner-Asset
const BANNER = require('../../assets/images/banner.png')

// YYYY-MM-DD -> DD.MM.YYYY
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // ---------- Auth-Gate ----------
  const [sessionChecked, setSessionChecked] = useState(false)
  useEffect(() => {
    let unsub: (() => void) | undefined
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
      } else {
        setSessionChecked(true)
      }
      const sub = supabase.auth.onAuthStateChange((_e, session) => {
        if (!session) router.replace('/login')
      })
      unsub = () => sub.data.subscription.unsubscribe()
    })()
    return () => { unsub?.() }
  }, [router])

  // ---------- Profil oben ----------
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [avatarPublicUrl, setAvatarPublicUrl] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    setUserEmail(userData.user.email ?? null)

    const uid = userData.user.id
    const { data } = await supabase
      .from('profiles')
      .select('first_name,last_name,avatar_url')
      .eq('auth_user_id', uid)
      .maybeSingle()

    const prof: Profile = {
      first_name: data?.first_name ?? null,
      last_name: data?.last_name ?? null,
      avatar_url: data?.avatar_url ?? null,
    }
    setProfile(prof)

    if (prof.avatar_url) {
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(prof.avatar_url)
      setAvatarPublicUrl(pub.publicUrl ?? null)
    } else {
      setAvatarPublicUrl(null)
    }
  }, [])

  // ---------- Daten (Stammtisch-Listen) ----------
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('stammtisch')
      .select('id, date, location, notes')
      .limit(500)
    if (error) setError(error.message)
    else setRows((data as Row[]) ?? [])
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (sessionChecked) {
        loadProfile()
        loadData()
      }
    }, [sessionChecked, loadProfile, loadData])
  )

  // Realtime
  useEffect(() => {
    if (!sessionChecked) return
    const ch = supabase
      .channel('stammtisch-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stammtisch' },
        (payload: any) => {
          const r = payload.new as Row
          setRows(prev => (prev.some(x => x.id === r.id) ? prev : [r, ...prev]))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [sessionChecked])

  // Broadcast
  useEffect(() => {
    if (!sessionChecked) return
    const ch = supabase
      .channel('client-refresh', { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'stammtisch-saved' }, () => {
        loadData()
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [sessionChecked, loadData])

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const upcoming = useMemo(
    () => rows.filter(r => r.date >= todayStr).sort((a, b) => (a.date.localeCompare(b.date) || a.id - b.id)),
    [rows, todayStr]
  )
  const past = useMemo(
    () => rows.filter(r => r.date < todayStr).sort((a, b) => (b.date.localeCompare(a.date) || b.id - a.id)),
    [rows, todayStr]
  )

  if (!sessionChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={type.body}>Lade …</Text>
      </View>
    )
  }

  const displayName =
    (profile?.first_name ? `${profile.first_name} ` : '') +
    (profile?.last_name ?? '')
  const nameOrEmail = displayName.trim() || userEmail || 'Profil bearbeiten'

  const renderItem = ({ item }: { item: Row }) => (
    <View
      style={{
        padding: 12,
        borderRadius: radius.md,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
      }}
    >
      <Text style={[type.h2, { marginBottom: 4 }]}>
        {fmtDate(item.date)} – {item.location}
      </Text>
      {item.notes ? <Text style={type.body}>{item.notes}</Text> : null}
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Wichtig: Die ganze Seite scrollt; Scroll-Viewport endet vor der Bottom-Nav */}
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, rowGap: 12 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        {/* Banner */}
        <View
          style={{
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <Image
            source={BANNER}
            style={{ width: '100%', aspectRatio: 3 }}
            resizeMode="contain"
            accessible
            accessibilityRole="image"
            accessibilityLabel="Stammtisch Banner"
          />
        </View>

        {/* Kopfzeile: Avatar + Name */}
        <Pressable
          onPress={() => router.push('/profile')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {avatarPublicUrl ? (
            <Image
              source={{ uri: avatarPublicUrl }}
              style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border }}
            />
          ) : (
            <View
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
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

        {/* Überschrift */}
        <Text style={type.h1}>Stammtisch</Text>

        {/* Bevorstehende (eigene Scrollbar) */}
        <Text style={type.h2}>Bevorstehende Stammtische</Text>
        <View
          style={{
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 8,
            maxHeight: 280,
          }}
        >
          {upcoming.length === 0 ? (
            <Text style={type.body}>Keine Einträge.</Text>
          ) : (
            <FlatList
              data={upcoming}
              keyExtractor={(r) => String(r.id)}
              renderItem={renderItem}
              nestedScrollEnabled
              persistentScrollbar
              indicatorStyle="white"
              showsVerticalScrollIndicator
            />
          )}
        </View>

        {/* Frühere (eigene Scrollbar) */}
        <Text style={type.h2}>Frühere Stammtische</Text>
        <View
          style={{
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 8,
            maxHeight: 280,
          }}
        >
          {past.length === 0 ? (
            <Text style={type.body}>Keine Einträge.</Text>
          ) : (
            <FlatList
              data={past}
              keyExtractor={(r) => String(r.id)}
              renderItem={renderItem}
              nestedScrollEnabled
              persistentScrollbar
              indicatorStyle="white"
              showsVerticalScrollIndicator
            />
          )}
        </View>

        <View style={{ marginTop: 4 }}>
          <Button title={loading ? 'Lade…' : 'Neu laden'} onPress={loadData} disabled={loading} />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
