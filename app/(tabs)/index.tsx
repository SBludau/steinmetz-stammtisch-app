// app/(tabs)/index.tsx
import { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, Image, Pressable, Button, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Row = { id: number; date: string; location: string; notes: string | null }
type Profile = { first_name: string | null; last_name: string | null; avatar_url: string | null }

const BANNER = require('../../assets/images/banner.png')
const AVATAR_BASE_URL =
  'https://bcbqnkycjroiskwqcftc.supabase.co/storage/v1/object/public/avatars'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

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
      return () => {
        active = false
      }
    }, [router])
  )

  // Daten laden
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

  // Realtime: INSERT/UPDATE/DELETE sauber behandeln
  useEffect(() => {
    if (!sessionChecked) return
    const ch = supabase
      .channel('public:stammtisch')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stammtisch' },
        payload => {
          const r = payload.new as Row
          setRows(prev => (prev.some(x => x.id === r.id) ? prev : [...prev, r]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stammtisch' },
        payload => {
          const r = payload.new as Row
          setRows(prev => prev.map(p => (p.id === r.id ? r : p)))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'stammtisch' },
        payload => {
          const oldId = (payload.old as any)?.id
          setRows(prev => prev.filter(p => p.id !== oldId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [sessionChecked])

  // Broadcast: „neu gespeichert“ → neu laden (Fallback)
  useEffect(() => {
    if (!sessionChecked) return
    const ch = supabase
      .channel('client-refresh', { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'stammtisch-saved' }, () => {
        loadData()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
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
    setAvatarPublicUrl(prof.avatar_url ? `${AVATAR_BASE_URL}/${prof.avatar_url}` : null)
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    loadProfile()
  }, [sessionChecked, loadProfile])

  const nameOrEmail = useMemo(() => {
    const fn = profile?.first_name?.trim() || ''
    const ln = profile?.last_name?.trim() || ''
    const full = `${fn} ${ln}`.trim()
    return full.length > 0 ? full : userEmail ?? ''
  }, [profile, userEmail])

  const renderItem = ({ item }: { item: Row }) => (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/(tabs)/stammtisch/[id]', params: { id: String(item.id) } })
      }
      style={{
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 4,
      }}
    >
      <Text style={type.body}>{item.date} • {item.location}</Text>
    </Pressable>
  )

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
          }}
        >
          <Image
            source={BANNER}
            style={{ width: '100%', aspectRatio: 3 }}
            resizeMode="contain"
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
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
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
            <Text
              style={[
                type.body,
                { color: activeTab === 'upcoming' ? colors.bg : colors.text, fontFamily: type.bold },
              ]}
            >
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
            <Text
              style={[
                type.body,
                { color: activeTab === 'past' ? colors.bg : colors.text, fontFamily: type.bold },
              ]}
            >
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
              <View>
                {upcoming.map(item => (
                  <View key={item.id}>{renderItem({ item })}</View>
                ))}
              </View>
            )}
          </SectionBox>
        ) : (
          <SectionBox>
            {past.length === 0 ? (
              <Text style={type.body}>Keine Einträge.</Text>
            ) : (
              <View>
                {past.map(item => (
                  <View key={item.id}>{renderItem({ item })}</View>
                ))}
              </View>
            )}
          </SectionBox>
        )}

        <View style={{ marginTop: 8 }}>
          <Button title={loading ? 'Lade…' : 'Neu laden'} onPress={loadData} disabled={loading} />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
