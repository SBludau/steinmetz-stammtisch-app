// app/admin/claims.tsx
import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Button, ActivityIndicator, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'

type ClaimRow = {
  id: number
  profile_id: number
  claimant_user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
  profile: {
    id: number
    first_name: string | null
    middle_name: string | null
    last_name: string | null
    degree: Degree | null
    avatar_url: string | null
    title: string | null
    quote: string | null
  } | null
}

export default function AdminClaimsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<ClaimRow[]>([])
  const [role, setRole] = useState<'member' | 'superuser' | 'admin'>('member')

  const publicUrlFor = (path: string | null) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl ?? null
  }

  const displayName = (p: ClaimRow['profile']) => {
    if (!p) return 'Profil unbekannt'
    const deg = (p.degree ?? 'none') as Degree
    const degPrefix = deg === 'dr' ? 'Dr. ' : deg === 'prof' ? 'Prof. ' : ''
    const mid = p.middle_name ? ` ${p.middle_name}` : ''
    return `${degPrefix}${p.first_name ?? ''}${mid} ${p.last_name ?? ''}`.trim()
  }

  async function loadData() {
    setLoading(true)
    setError(''); setMessage('')

    // 1) User check
    const { data: userData, error: uErr } = await supabase.auth.getUser()
    if (uErr || !userData?.user) {
      router.replace('/login')
      return
    }

    // 2) Rolle laden
    const { data: meProf } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', userData.user.id)
      .maybeSingle()
    if (meProf?.role === 'admin') setRole('admin')
    else if (meProf?.role === 'superuser') setRole('superuser')
    else setRole('member')

    // 3) Pending-Claims inkl. eingebettetem Profil
    const { data, error } = await supabase
      .from('profile_claims')
      .select(`
        id,
        profile_id,
        claimant_user_id,
        status,
        created_at,
        profile:profiles!profile_claims_profile_id_fkey (
          id, first_name, middle_name, last_name, degree, avatar_url, title, quote
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setRows((data ?? []) as any)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function approveClaim(claimId: number) {
    setError(''); setMessage('')
    setWorking(claimId)
    try {
      const { error } = await supabase
        .from('profile_claims')
        .update({ status: 'approved' })
        .eq('id', claimId)

      if (error) throw error
      setMessage('Anfrage genehmigt und Profil verknüpft.')
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorking(null)
    }
  }

  async function rejectClaim(claimId: number) {
    setError(''); setMessage('')
    setWorking(claimId)
    try {
      const { error } = await supabase
        .from('profile_claims')
        .update({ status: 'rejected' })
        .eq('id', claimId)
      if (error) throw error
      setMessage('Anfrage abgelehnt.')
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorking(null)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ ...type.body, marginTop: 6 }}>Lade Anfragen…</Text>
      </View>
    )
  }

  const isPrivileged = role === 'admin' || role === 'superuser'

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Verknüpfungs-Anfragen</Text>
        {!isPrivileged && (
          <View style={{
            padding: 12, borderRadius: radius.md, backgroundColor: colors.cardBg,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={{ ...type.body, color: '#ff9f43' }}>
              Hinweis: Du hast keine SuperUser/Admin-Rechte. Aktionen sind gesperrt.
            </Text>
          </View>
        )}

        {rows.length === 0 && (
          <View style={{
            padding: 12, borderRadius: radius.md, backgroundColor: colors.cardBg,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <Text style={type.body}>Aktuell liegen keine offenen Anfragen vor.</Text>
          </View>
        )}

        {rows.map((c) => {
          const p = c.profile
          const avatar = publicUrlFor(p?.avatar_url ?? null)
          return (
            <View
              key={c.id}
              style={{
                padding: 12,
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.border }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56, height: 56, borderRadius: 28,
                      backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: colors.border
                    }}
                  >
                    <Text style={type.caption}>kein Foto</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={type.h2}>{displayName(p)}</Text>
                  {p?.title ? <Text style={{ ...type.body, color: '#bfbfbf' }}>{p.title}</Text> : null}
                  <Text style={{ ...type.caption, marginTop: 4 }}>Claim-ID: {c.id}</Text>
                  <Text style={{ ...type.caption, color: '#9aa0a6' }}>Status: {c.status}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button
                  title={working === c.id ? 'Genehmige…' : 'Genehmigen'}
                  onPress={() => {
                    if (!isPrivileged || working === c.id) return
                    if (Platform.OS === 'web') {
                      const ok =
                        typeof globalThis !== 'undefined' &&
                        typeof (globalThis as any).confirm === 'function'
                          ? (globalThis as any).confirm('Dieses Profil mit dem User verknüpfen und bestätigen?')
                          : true
                      if (ok) approveClaim(c.id)
                    } else {
                      Alert.alert('Genehmigen?', 'Dieses Profil mit dem User verknüpfen und bestätigen?', [
                        { text: 'Abbrechen', style: 'cancel' },
                        { text: 'Ja', onPress: () => approveClaim(c.id) },
                      ])
                    }
                  }}
                  disabled={!isPrivileged || working === c.id}
                />
                <Button
                  title={working === c.id ? 'Lehne ab…' : 'Ablehnen'}
                  onPress={() => {
                    if (!isPrivileged || working === c.id) return
                    if (Platform.OS === 'web') {
                      const ok =
                        typeof globalThis !== 'undefined' &&
                        typeof (globalThis as any).confirm === 'function'
                          ? (globalThis as any).confirm('Anfrage wirklich ablehnen?')
                          : true
                      if (ok) rejectClaim(c.id)
                    } else {
                      Alert.alert('Ablehnen?', 'Anfrage wirklich ablehnen?', [
                        { text: 'Abbrechen', style: 'cancel' },
                        { text: 'Ja', onPress: () => rejectClaim(c.id) },
                      ])
                    }
                  }}
                  disabled={!isPrivileged || working === c.id}
                />
              </View>
            </View>
          )
        })}

        <View style={{ gap: 10, marginTop: 8 }}>
          <Button title="Zurück" onPress={() => router.back()} />
        </View>

        {message ? <Text style={{ ...type.body, color: colors.gold }}>{message}</Text> : null}
        {error ? <Text style={{ ...type.body, color: colors.red }}>{error}</Text> : null}
      </ScrollView>

      <BottomNav />
    </View>
  )
}
