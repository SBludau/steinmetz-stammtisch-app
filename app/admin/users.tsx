// app/admin/users.tsx
import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Button, ActivityIndicator, Alert, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'
type Role = 'member' | 'superuser' | 'admin'

type ProfileRow = {
  id: number
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  degree: Degree | null
  role: Role | null
  avatar_url: string | null
  title: string | null
  auth_user_id: string | null
  self_check: boolean | null
  is_active: boolean | null
}

// Deine Projekt-URL für den Function-Call
const SUPABASE_URL = 'https://bcbqnkycjroiskwqcftc.supabase.co'

export default function AdminUsersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [rows, setRows] = useState<ProfileRow[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [myRole, setMyRole] = useState<Role>('member')
  const [myProfileId, setMyProfileId] = useState<number | null>(null)

  const publicUrlFor = (path: string | null) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl ?? null
  }

  const displayName = (p: ProfileRow) => {
    const deg = (p.degree ?? 'none') as Degree
    const degPrefix = deg === 'dr' ? 'Dr. ' : deg === 'prof' ? 'Prof. ' : ''
    const mid = p.middle_name ? ` ${p.middle_name}` : ''
    return `${degPrefix}${p.first_name ?? ''}${mid} ${p.last_name ?? ''}`.trim() || `#${p.id}`
  }

  async function loadData() {
    setLoading(true)
    setError(''); setMessage('')
    const { data: userData, error: uErr } = await supabase.auth.getUser()
    if (uErr || !userData?.user) {
      router.replace('/login')
      return
    }
    // eigene Rolle + Profil-ID laden
    const { data: me } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', userData.user.id)
      .maybeSingle()
    setMyRole((me?.role ?? 'member') as Role)
    setMyProfileId(me?.id ?? null)

    // alle Profile laden (SuperUser darf lesen, Aktionen später nur Admin)
    const { data, error } = await supabase
      .from('profiles')
      .select('id,first_name,middle_name,last_name,degree,role,avatar_url,title,auth_user_id,self_check,is_active')
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) setError(error.message)
    else setRows((data ?? []) as ProfileRow[])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAdmin = myRole === 'admin'
  const isPrivilegedReader = myRole === 'admin' || myRole === 'superuser'

  function confirmWeb(msg: string) {
    const can = typeof globalThis !== 'undefined' && typeof (globalThis as any).confirm === 'function'
    return can ? (globalThis as any).confirm(msg) : true
  }

  async function onChangeRole(p: ProfileRow, newRole: Role) {
    if (!isAdmin) return
    setError(''); setMessage('')
    setWorkingId(p.id)
    try {
      const { error } = await supabase.rpc('admin_set_role', {
        p_profile_id: p.id,
        p_role: newRole,
      })
      if (error) throw error
      setMessage(`Rolle für ${displayName(p)} → ${newRole}`)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorkingId(null)
    }
  }

  async function onUnlink(p: ProfileRow) {
    if (!isAdmin) return
    const go = Platform.OS === 'web'
      ? confirmWeb(`Profil ${displayName(p)} wirklich ENTKOPPELN und deaktivieren?`)
      : await new Promise<boolean>(resolve => {
          Alert.alert('Entkoppeln?', `Profil ${displayName(p)} wirklich entkoppeln und deaktivieren?`, [
            { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Ja', onPress: () => resolve(true) },
          ])
        })
    if (!go) return

    setError(''); setMessage('')
    setWorkingId(p.id)
    try {
      const { error } = await supabase.rpc('admin_unlink_profile', { p_profile_id: p.id })
      if (error) throw error
      setMessage(`Profil ${displayName(p)} entkoppelt & deaktiviert`)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorkingId(null)
    }
  }

  async function onDeleteProfileOnly(p: ProfileRow) {
    if (!isAdmin) return
    if (myProfileId && p.id === myProfileId) {
      setError('Du kannst dein eigenes Admin-Profil nicht löschen.')
      return
    }
    const go = Platform.OS === 'web'
      ? confirmWeb(`Profil ${displayName(p)} UNWIDERRUFLICH löschen? (Claims werden mit gelöscht)`)
      : await new Promise<boolean>(resolve => {
          Alert.alert('Löschen?', `Profil ${displayName(p)} unwiderruflich löschen?`, [
            { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Ja, löschen', style: 'destructive', onPress: () => resolve(true) },
          ])
        })
    if (!go) return

    setError(''); setMessage('')
    setWorkingId(p.id)
    try {
      const { error } = await supabase.rpc('admin_delete_profile', { p_profile_id: p.id })
      if (error) throw error
      setMessage(`Profil ${displayName(p)} gelöscht`)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorkingId(null)
    }
  }

  // ---- Edge Function Call: auth.users löschen (+ optional Profil & Avatare) ----
  async function callDeleteUser(userId: string, opts: { deleteProfile: boolean, deleteStorage: boolean }) {
    // Admin-Token holen
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Kein Admin-Token vorhanden.')

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/admin-delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // wird in der Function geprüft (Admin-Rolle)
      },
      body: JSON.stringify({
        user_id: userId,
        delete_profile: opts.deleteProfile,
        delete_storage: opts.deleteStorage,
      }),
    })
    const json = await resp.json()
    if (!resp.ok) {
      throw new Error(json?.error ? `${json.error} ${json.details ?? ''}` : 'Fehler beim Löschen')
    }
    return json
  }

  async function onDeleteAuthAndProfile(p: ProfileRow) {
    if (!isAdmin) return
    if (!p.auth_user_id) {
      setError('Dieses Profil ist nicht mit einem Login-Account verknüpft.')
      return
    }
    const go = Platform.OS === 'web'
      ? confirmWeb(`WIRKLICH Account + Profil von ${displayName(p)} löschen? (inkl. Avatar-Dateien)`)
      : await new Promise<boolean>(resolve => {
          Alert.alert('Account + Profil löschen?', `Wirklich Account + Profil von ${displayName(p)} löschen?`, [
            { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Ja', style: 'destructive', onPress: () => resolve(true) },
          ])
        })
    if (!go) return

    setError(''); setMessage('')
    setWorkingId(p.id)
    try {
      await callDeleteUser(p.auth_user_id, { deleteProfile: true, deleteStorage: true })
      setMessage(`Account + Profil von ${displayName(p)} gelöscht`)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorkingId(null)
    }
  }

  async function onDeleteAuthOnlyUnlinkProfile(p: ProfileRow) {
    if (!isAdmin) return
    if (!p.auth_user_id) {
      setError('Dieses Profil ist nicht mit einem Login-Account verknüpft.')
      return
    }
    const go = Platform.OS === 'web'
      ? confirmWeb(`Account von ${displayName(p)} löschen und Profil NUR entkoppeln (nicht löschen)?`)
      : await new Promise<boolean>(resolve => {
          Alert.alert('Account löschen + entkoppeln?', `Account löschen und Profil nur entkoppeln?`, [
            { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Ja', onPress: () => resolve(true) },
          ])
        })
    if (!go) return

    setError(''); setMessage('')
    setWorkingId(p.id)
    try {
      await callDeleteUser(p.auth_user_id, { deleteProfile: false, deleteStorage: true })
      setMessage(`Account gelöscht, Profil ${displayName(p)} entkoppelt`)
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setWorkingId(null)
    }
  }

  if (!isPrivilegedReader) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={type.h1}>Admin – Benutzerverwaltung</Text>
        <Text style={{ ...type.body, marginTop: 8, color: '#ff9f43', textAlign: 'center' }}>
          Du benötigst SuperUser- oder Admin-Rechte, um diese Seite zu sehen.
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button title="Zurück" onPress={() => router.back()} />
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ ...type.body, marginTop: 6 }}>Lade Profile…</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Admin – Benutzerverwaltung</Text>

        {rows.map((p) => {
          const avatar = publicUrlFor(p.avatar_url)
          const linkedBadge = p.auth_user_id
            ? (p.self_check ? '✅ verknüpft & bestätigt' : '🔒 verknüpft (ausstehend)')
            : '🟢 unverknüpft'
          const activeBadge = p.is_active ? '🟩 aktiv' : '⬜ inaktiv'

          return (
            <View
              key={p.id}
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
                  {p.title ? <Text style={{ ...type.body, color: '#bfbfbf' }}>{p.title}</Text> : null}
                  <Text style={{ ...type.caption, marginTop: 4 }}>
                    {linkedBadge} · {activeBadge}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 8 }}>
                <Text style={type.h3}>Rolle</Text>
                <View
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
                    overflow: 'hidden', backgroundColor: '#0d0d0d', opacity: isAdmin ? 1 : 0.6
                  }}
                >
                  <Picker
                    enabled={isAdmin}
                    selectedValue={(p.role ?? 'member') as Role}
                    onValueChange={(v) => onChangeRole(p, v as Role)}
                    dropdownIconColor={colors.text}
                  >
                    <Picker.Item label="DAU (member)" value="member" />
                    <Picker.Item label="SuperUser" value="superuser" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Button
                    title="Entkoppeln"
                    onPress={() => onUnlink(p)}
                    disabled={!isAdmin || workingId === p.id || !p.auth_user_id}
                  />
                  <Button
                    title="Profil löschen"
                    onPress={() => onDeleteProfileOnly(p)}
                    disabled={!isAdmin || workingId === p.id}
                  />
                  <Button
                    title="Account + Profil löschen"
                    onPress={() => onDeleteAuthAndProfile(p)}
                    disabled={!isAdmin || workingId === p.id || !p.auth_user_id}
                  />
                  <Button
                    title="Account löschen (Profil entkoppeln)"
                    onPress={() => onDeleteAuthOnlyUnlinkProfile(p)}
                    disabled={!isAdmin || workingId === p.id || !p.auth_user_id}
                  />
                </View>
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
