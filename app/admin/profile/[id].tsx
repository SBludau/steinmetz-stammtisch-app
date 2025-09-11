// app/admin/profile/[id].tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, TextInput, Image, ScrollView, ActivityIndicator, Switch, Button } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import { supabase } from '../../../src/lib/supabase'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../../src/components/BottomNav'
import { colors, radius } from '../../../src/theme/colors'
import { type } from '../../../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'
type Role = 'member' | 'superuser' | 'admin'

type ProfileRow = {
  id: number
  auth_user_id: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  title: string | null
  birthday: string | null
  quote: string | null
  avatar_url: string | null
  degree: Degree | null
  role: Role | null
  is_active: boolean | null
  standing_order: boolean | null
  self_check: boolean | null
}

export default function AdminProfileEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const profileId = useMemo(() => (id ? parseInt(id, 10) : NaN), [id])
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [myRole, setMyRole] = useState<Role>('member')

  const [row, setRow] = useState<ProfileRow | null>(null)
  const [fallbackAvatar, setFallbackAvatar] = useState<string | undefined>(undefined)

  // Formstate (getrennt von row, damit Eingaben sofort UI ändern)
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('') // Steinmetz Dienstgrad (DB-Feld: title)
  const [birthday, setBirthday] = useState('') // YYYY-MM-DD
  const [quote, setQuote] = useState('')
  const [degree, setDegree] = useState<Degree>('none')
  const [isActive, setIsActive] = useState<boolean>(true)
  const [standingOrder, setStandingOrder] = useState<boolean>(false)
  const [role, setRole] = useState<Role>('member')

  // Avatar Public URL
  const avatarPublicUrl = useMemo(() => {
    if (!row?.avatar_url) return undefined
    const { data } = supabase.storage.from('avatars').getPublicUrl(row.avatar_url)
    return data.publicUrl || undefined
  }, [row?.avatar_url])

  const avatarToShow = avatarPublicUrl || fallbackAvatar

  const isAdmin = myRole === 'admin'

  const load = useCallback(async () => {
    setLoading(true); setError(''); setMessage('')
    try {
      if (!id || Number.isNaN(profileId)) throw new Error('Ungültige Profil-ID.')

      // aktuelle User-Rolle
      const { data: userData, error: uErr } = await supabase.auth.getUser()
      if (uErr || !userData?.user) {
        router.replace('/login')
        return
      }
      const { data: me } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', userData.user.id)
        .maybeSingle()
      setMyRole((me?.role ?? 'member') as Role)

      // Zielprofil laden
      const { data, error } = await supabase
        .from('profiles')
        .select('id,auth_user_id,first_name,middle_name,last_name,title,birthday,quote,avatar_url,degree,role,is_active,standing_order,self_check')
        .eq('id', profileId)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Profil nicht gefunden.')

      const p = data as ProfileRow
      setRow(p)

      // Form initialisieren
      setFirstName(p.first_name ?? '')
      setMiddleName(p.middle_name ?? '')
      setLastName(p.last_name ?? '')
      setTitle(p.title ?? '')
      setBirthday(p.birthday ?? '')
      setQuote(p.quote ?? '')
      setDegree((p.degree ?? 'none') as Degree)
      setIsActive(!!p.is_active)
      setStandingOrder(!!p.standing_order)
      setRole((p.role ?? 'member') as Role)

      // Google-Avatar-Fallback optional laden
      try {
        if (p.auth_user_id && !p.avatar_url) {
          const { data: fb, error: fbErr } = await supabase.rpc('public_get_google_avatars', { p_user_ids: [p.auth_user_id] })
          if (!fbErr && Array.isArray(fb) && fb[0]?.avatar_url) {
            setFallbackAvatar(fb[0].avatar_url as string)
          }
        }
      } catch {
        // RPC nicht vorhanden -> ignorieren
      }
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [id, profileId, router])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    if (!row) return
    setError(''); setMessage('')

    // simple Validierungen
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      setError('Geburtstag bitte als YYYY-MM-DD eingeben (z. B. 1990-05-21).')
      return
    }
    if (!['none', 'dr', 'prof'].includes(degree)) {
      setError('Ungültiger akademischer Grad.')
      return
    }
    if (quote && quote.length > 500) {
      setError('Lebensweisheit darf maximal 500 Zeichen lang sein.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        first_name: firstName.trim() || null,
        middle_name: middleName.trim() || null,
        last_name: lastName.trim() || null,
        title: title.trim() || null,
        birthday: birthday.trim() || null,
        quote: quote.trim() || null,
        degree,
        is_active: !!isActive,
        standing_order: !!standingOrder,
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', row.id)
      if (error) throw error

      setMessage('Profil gespeichert.')
      await load()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(newRole: Role) {
    if (!row || !isAdmin) return
    setError(''); setMessage('')
    try {
      const { error } = await supabase.rpc('admin_set_role', {
        p_profile_id: row.id,
        p_role: newRole,
      })
      if (error) throw error
      setRole(newRole)
      setMessage(`Rolle aktualisiert: ${newRole}`)
      await load()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={type.h1}>Admin – Profil bearbeiten</Text>
        <Text style={{ ...type.body, marginTop: 8, color: '#ff9f43', textAlign: 'center' }}>
          Nur Admins dürfen Profile bearbeiten.
        </Text>
        <View style={{ marginTop: 12 }}>
          <Button title="Zurück" onPress={() => router.back()} />
        </View>
      </View>
    )
  }

  if (loading || !row) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ ...type.body, marginTop: 6 }}>Lade Profil…</Text>
      </View>
    )
  }

  // Verknüpfungsanzeige
  const linkedBadge = row.auth_user_id
    ? (row.self_check ? '✅ verknüpft & bestätigt' : '🔒 verknüpft (ausstehend)')
    : '🟢 unverknüpft'
  const activeBadge = row.is_active ? '🟩 aktiv' : '⬜ inaktiv'

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <Text style={type.h1}>Admin – Profil bearbeiten</Text>

        {/* Header-Card */}
        <View
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
          <View
            style={{
              width: 64, height: 64, borderRadius: 32, overflow: 'hidden',
              backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: colors.border
            }}
          >
            {avatarToShow ? <Image source={{ uri: avatarToShow }} style={{ width: '100%', height: '100%' }} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>
              {(row.first_name || '')} {(row.middle_name || '')} {(row.last_name || '')}
            </Text>
            {row.title ? <Text style={{ ...type.body, color: '#bfbfbf' }}>{row.title}</Text> : null}
            <Text style={{ ...type.caption, marginTop: 4 }}>
              {linkedBadge} · {activeBadge}
            </Text>
          </View>
        </View>

        {/* Formular */}
        <View
          style={{
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
          }}
        >
          <Text style={type.h2}>Vorname</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Max"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Zweitname</Text>
          <TextInput
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Karl"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Nachname</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Mustermann"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          {/* Steinmetz Dienstgrad (DB: title) */}
          <Text style={type.h2}>Steinmetz Dienstgrad</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="z. B. Geselle, Polier, Meister"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Geburtstag (YYYY-MM-DD)</Text>
          <TextInput
            value={birthday}
            onChangeText={setBirthday}
            placeholder="1990-05-21"
            placeholderTextColor="#bfbfbf"
            autoCapitalize="none"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Akademischer Grad</Text>
          <View
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              overflow: 'hidden', backgroundColor: '#0d0d0d'
            }}
          >
            <Picker
              selectedValue={degree}
              onValueChange={(v) => setDegree(v as Degree)}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="— kein akademischer Grad —" value="none" />
              <Picker.Item label="Dr." value="dr" />
              <Picker.Item label="Prof." value="prof" />
            </Picker>
          </View>

          <Text style={type.h2}>Lebensweisheit</Text>
          <Text style={{ ...type.caption, color: '#9aa0a6', marginTop: -2, marginBottom: 2 }}>max. 500 Zeichen</Text>
          <TextInput
            value={quote}
            onChangeText={setQuote}
            placeholder="Lieblingsspruch…"
            placeholderTextColor="#bfbfbf"
            multiline
            maxLength={500}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, minHeight: 60, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          {/* is_active */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10,
              backgroundColor: '#0d0d0d', marginTop: 6
            }}
          >
            <Text style={type.h2}>Aktiv</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>

          {/* Dauerauftrag */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10,
              backgroundColor: '#0d0d0d', marginTop: 6
            }}
          >
            <Text style={type.h2}>Dauerauftrag</Text>
            <Switch value={standingOrder} onValueChange={setStandingOrder} />
          </View>

          {/* Rolle (optional hier änderbar) */}
          <Text style={{ ...type.h2, marginTop: 6 }}>Rolle</Text>
          <View
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              overflow: 'hidden', backgroundColor: '#0d0d0d'
            }}
          >
            <Picker
              enabled={isAdmin}
              selectedValue={role}
              onValueChange={(v) => changeRole(v as Role)}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="DAU (member)" value="member" />
              <Picker.Item label="SuperUser" value="superuser" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            <Button title={saving ? 'Speichere…' : 'Speichern'} onPress={save} disabled={saving} />
            <Button title="Zurück" onPress={() => router.back()} />
          </View>

          {message ? <Text style={{ ...type.body, color: colors.gold }}>{message}</Text> : null}
          {error ? <Text style={{ ...type.body, color: colors.red }}>{error}</Text> : null}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
