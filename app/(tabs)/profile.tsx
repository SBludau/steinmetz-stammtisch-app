// app/(tabs)/profile.tsx
import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, Image, Button, ScrollView, Switch, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'
type Role = 'member' | 'superuser' | 'admin'
type Provider = 'google' | 'password' | 'other'

type Profile = {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  title: string | null
  birthday: string | null // YYYY-MM-DD
  quote: string | null
  avatar_url?: string | null
  degree: Degree
  role: Role
  is_active: boolean
  self_check: boolean
  standing_order: boolean
}

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [form, setForm] = useState<Profile>({
    first_name: '',
    middle_name: '',
    last_name: '',
    title: '',
    birthday: '',
    quote: '',
    avatar_url: null,
    degree: 'none',
    role: 'member',
    is_active: true,
    self_check: false,
    standing_order: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // nur UI: eingeloggter Provider (für Anzeigetext)
  const [userProvider, setUserProvider] = useState<Provider>('other')

  // Bildauswahl / Upload
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null)

  // Public-URL aus Pfad bauen (Bucket ist public)
  const publicAvatarUrl = useMemo(() => {
    if (!form.avatar_url) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(form.avatar_url)
    return data.publicUrl ?? null
  }, [form.avatar_url])

  // Rollen-Helfer
  const isAdmin = form.role === 'admin'
  const isSuperUser = form.role === 'superuser'
  const canSeeAdminLinks = isAdmin || isSuperUser

  useEffect(() => {
    ;(async () => {
      setError('')
      setMessage('')
      const { data: userData, error: uErr } = await supabase.auth.getUser()
      if (uErr || !userData?.user) {
        router.replace('/login')
        return
      }
      const uid = userData.user.id

      // Provider ermitteln
      const appProv = (userData.user as any)?.app_metadata?.provider as string | undefined
      const identities = (userData.user as any)?.identities as Array<{ provider?: string }> | undefined
      const providers = new Set<string>([
        ...(appProv ? [appProv] : []),
        ...(identities?.map(i => i.provider || '')?.filter(Boolean) ?? []),
      ])
      if (providers.has('google')) setUserProvider('google')
      else if (providers.has('email') || providers.has('password')) setUserProvider('password')
      else setUserProvider('other')

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name,middle_name,last_name,title,birthday,quote,avatar_url,degree,role,is_active,self_check,standing_order')
        .eq('auth_user_id', uid)
        .maybeSingle()

      if (error && (error as any).code !== 'PGRST116') {
        setError(error.message)
      } else if (data) {
        setForm({
          first_name: data.first_name ?? '',
          middle_name: data.middle_name ?? '',
          last_name: data.last_name ?? '',
          title: data.title ?? '',
          birthday: data.birthday ?? '',
          quote: data.quote ?? '',
          avatar_url: data.avatar_url ?? null,
          degree: (data.degree ?? 'none') as Degree,
          role: (data.role ?? 'member') as Role,
          is_active: data.is_active ?? true,
          self_check: data.self_check ?? false,
          standing_order: data.standing_order ?? false,
        })
      }

      setLoading(false)
    })()
  }, [router])

  async function saveProfileText() {
    setError(''); setMessage('')
    if (form.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthday)) {
      setError('Geburtsdatum bitte als YYYY-MM-DD eingeben (z. B. 1990-05-21).')
      return
    }
    if (!['none','dr','prof'].includes(form.degree)) {
      setError('Ungültiger akademischer Grad.')
      return
    }
    if (form.quote && form.quote.length > 500) {
      setError('Lebensweisheit darf maximal 500 Zeichen lang sein.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { setError('Nicht eingeloggt.'); return }
    const uid = userData.user.id

    setSaving(true)
    // Nur Felder senden, die Member ändern dürfen
    const payload: any = {
      auth_user_id: uid,
      first_name: form.first_name?.trim() || null,
      last_name: form.last_name?.trim() || null,
      title: form.title?.trim() || null,
      birthday: form.birthday?.trim() || null,
      quote: form.quote?.trim() || null,
      avatar_url: form.avatar_url || null,
      degree: form.degree,
      is_active: !!form.is_active,
      standing_order: !!form.standing_order,
      // self_check & role NICHT vom Member setzbar
    }

    if (isAdmin) {
      // Admin darf middle_name ändern
      payload.middle_name = form.middle_name?.trim() || null
    }

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'auth_user_id' })
    setSaving(false)
    if (error) setError(error.message)
    else setMessage('Profil gespeichert.')
  }

  // Galerie
  async function pickFromLibrary() {
    setError(''); setMessage('')
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (perm.status !== 'granted') { setError('Berechtigung für Medienbibliothek verweigert.'); return }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    })
    if (res.canceled) return
    setAvatarPreviewUri(res.assets[0].uri)
  }

  // Kamera
  async function takePhoto() {
    setError(''); setMessage('')
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (perm.status !== 'granted') { setError('Kamerazugriff verweigert.'); return }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
    })
    if (res.canceled) return
    setAvatarPreviewUri(res.assets[0].uri)
  }

  // Upload + in profiles.avatar_url speichern
  async function uploadAvatarAndSave() {
    setError(''); setMessage('')
    if (!avatarPreviewUri) { setError('Kein Bild ausgewählt.'); return }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { setError('Nicht eingeloggt.'); return }
    const uid = userData.user.id

    try {
      setSaving(true); setMessage('Lade Bild hoch …')
      const resp = await fetch(avatarPreviewUri)
      const blob = await resp.blob()
      const ext = (blob.type && blob.type.split('/')[1]) || 'jpg'
      const path = `${uid}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false,
      })
      if (upErr) { setSaving(false); setError(upErr.message); return }

      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({ auth_user_id: uid, avatar_url: path }, { onConflict: 'auth_user_id' })
      if (profErr) { setSaving(false); setError(profErr.message); return }

      setForm(f => ({ ...f, avatar_url: path }))
      setAvatarPreviewUri(null)
      setSaving(false); setMessage('Avatar gespeichert.')
    } catch (e: any) {
      setSaving(false); setError(e?.message ?? String(e))
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={type.body}>Lade Profil…</Text>
      </View>
    )
  }

  const avatarToShow = avatarPreviewUri || publicAvatarUrl || undefined

  // Text für Eigenkontrolle/Verknüpfung
  const linkedText = form.self_check
    ? (userProvider === 'google'
        ? 'Mit Google-Account verknüpft und bestätigt'
        : userProvider === 'password'
          ? 'Mit Benutzer/Passwort-Account verknüpft und bestätigt'
          : 'Mit Account verknüpft und bestätigt')
    : 'Profil noch nicht mit Account verknüpft'

  // Footer-Text je nach Rolle
  const accessText =
    form.role === 'admin'
      ? 'Zugriffsrechte: Admin – Wile E. Coyote – Genius'
      : form.role === 'superuser'
        ? 'Zugriffsrechte: SuperUser'
        : 'Zugriffsrechte: DAU'

  // --- einfache, native-sichere Auswahl für Degree statt Picker ---
  const DegreeChoice = ({ value, onChange }: { value: Degree; onChange: (v: Degree) => void }) => {
    const Item = ({ v, label }: { v: Degree; label: string }) => {
      const active = value === v
      return (
        <Pressable
          onPress={() => onChange(v)}
          style={{
            paddingVertical: 8, paddingHorizontal: 12,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: active ? colors.gold : colors.border,
            backgroundColor: active ? '#2a2a2a' : '#171717',
            marginRight: 8
          }}
        >
          <Text style={[type.body, { color: colors.text }]}>{label}</Text>
        </Pressable>
      )
    }
    return (
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Item v="none" label="— kein —" />
        <Item v="dr" label="Dr." />
        <Item v="prof" label="Prof." />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16 }}
        persistentScrollbar
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Mein Profil</Text>

        {/* Spacer */}
        <View style={{ height: 12 }} />

        {/* Avatar-Card */}
        <View
          style={{
            alignItems: 'center',
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {avatarToShow ? (
            <Image
              source={{ uri: avatarToShow }}
              style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: colors.border }}
            />
          ) : (
            <View
              style={{
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border
              }}
            >
              <Text style={type.body}>Kein Foto</Text>
            </View>
          )}

          {/* Buttons in einer Zeile mit Abständen */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ marginRight: 8 }}>
              <Button title="Foto wählen" onPress={pickFromLibrary} />
            </View>
            <View>
              <Button title="Kamera" onPress={takePhoto} />
            </View>
          </View>

          <View style={{ height: 10 }} />
          <Button title="Avatar hochladen & speichern" onPress={uploadAvatarAndSave} disabled={saving || !avatarPreviewUri} />
        </View>

        {/* Spacer */}
        <View style={{ height: 12 }} />

        {/* Form-Card */}
        <View
          style={{
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={type.h2}>Vorname</Text>
          <TextInput
            value={form.first_name ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, first_name: v }))}
            placeholder="Max"
            placeholderTextColor="#bfbfbf"
            style={{
              marginTop: 6,
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ height: 12 }} />
          <Text style={type.h2}>Zweitname (nur Admin)</Text>
          <TextInput
            value={form.middle_name ?? ''}
            editable={isAdmin}
            onChangeText={(v) => setForm((f) => ({ ...f, middle_name: v }))}
            placeholder="Karl"
            placeholderTextColor="#bfbfbf"
            style={{
              marginTop: 6,
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: isAdmin ? '#0d0d0d' : '#151515', color: colors.text,
              opacity: isAdmin ? 1 : 0.6,
            }}
          />

          <View style={{ height: 12 }} />
          <Text style={type.h2}>Nachname</Text>
          <TextInput
            value={form.last_name ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, last_name: v }))}
            placeholder="Mustermann"
            placeholderTextColor="#bfbfbf"
            style={{
              marginTop: 6,
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ height: 12 }} />
          {/* Umbenannt: Steinmetz Dienstgrad (DB-Feld bleibt title) */}
          <Text style={type.h2}>Steinmetz Dienstgrad</Text>
          <TextInput
            value={form.title ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            placeholder="z. B. Geselle, Polier, Meister"
            placeholderTextColor="#bfbfbf"
            style={{
              marginTop: 6,
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ height: 12 }} />
          <Text style={type.h2}>Geburtstag (YYYY-MM-DD)</Text>
          <TextInput
            value={form.birthday ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, birthday: v }))}
            placeholder="1990-05-21"
            placeholderTextColor="#bfbfbf"
            autoCapitalize="none"
            style={{
              marginTop: 6,
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ height: 12 }} />
          <Text style={type.h2}>Akademischer Grad</Text>
          <DegreeChoice
            value={form.degree}
            onChange={(v) => setForm((f) => ({ ...f, degree: v }))}
          />

          <View style={{ height: 12 }} />
          {/* Umbenannt: Lebensweisheit + Hinweis */}
          <Text style={type.h2}>Lebensweisheit</Text>
          <Text style={{ ...type.caption, color: '#9aa0a6', marginTop: -2, marginBottom: 2 }}>
            max. 500 Zeichen
          </Text>
          <TextInput
            value={form.quote ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, quote: v }))}
            placeholder="Lieblingsspruch…"
            placeholderTextColor="#bfbfbf"
            multiline
            maxLength={500}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, minHeight: 60, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ height: 12 }} />
          {/* is_active */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10,
              backgroundColor: '#0d0d0d'
            }}
          >
            <Text style={type.h2}>Aktiv</Text>
            <Switch
              value={!!form.is_active}
              onValueChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </View>

          <View style={{ height: 12 }} />
          {/* Dauerauftrag */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: 10,
              backgroundColor: '#0d0d0d',
            }}
          >
            <Text style={type.h2}>Dauerauftrag</Text>
            <Switch
              value={!!form.standing_order}
              onValueChange={(v) => setForm((f) => ({ ...f, standing_order: v }))}
            />
          </View>

          <View style={{ height: 12 }} />
          {/* Eigenkontrolle / Verknüpfung */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: 10,
              backgroundColor: '#0d0d0d',
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 8 }}>
              {form.self_check ? '🔗' : '🟡'}
            </Text>
            <Text style={type.body}>
              {linkedText}
            </Text>
          </View>

          <View style={{ height: 12 }} />
          <View>
            <Button title={saving ? 'Speichere…' : 'Profil speichern'} onPress={saveProfileText} disabled={saving} />
            <View style={{ height: 8 }} />
            <Button title="Zurück" onPress={() => router.back()} />
          </View>

          {message ? <Text style={{ ...type.body, color: colors.gold, marginTop: 8 }}>{message}</Text> : null}
          {error ? <Text style={{ ...type.body, color: colors.red, marginTop: 4 }}>{error}</Text> : null}
        </View>

        {/* Spacer */}
        <View style={{ height: 12 }} />

        {/* Admin-Bereich: nur für SuperUser/Admin */}
        {canSeeAdminLinks && (
          <View
            style={{
              padding: 12,
              borderRadius: radius.md,
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={type.h2}>Admin-Bereich</Text>
            <Text style={{ ...type.body, color: '#bfbfbf', marginTop: 4 }}>
              Schnellzugriff auf Verwaltungsseiten
            </Text>

            <View style={{ height: 10 }} />
            <View>
              <Button
                title="Verknüpfungs-Anfragen prüfen"
                onPress={() => router.push('/admin/claims')}
              />
              <View style={{ height: 8 }} />
              <Button
                title={isAdmin ? 'Benutzerverwaltung öffnen' : 'Benutzerverwaltung (Nur ansehen)'}
                onPress={() => router.push('/admin/users')}
              />
              {isAdmin && (
                <>
                  <View style={{ height: 8 }} />
                  <Button
                    title="Einstellungen (Vegas)"
                    onPress={() => router.push('/admin/settings')}
                  />
                </>
              )}
            </View>
          </View>
        )}

        {/* Footer – Zugriffsrechte je nach Rolle */}
        <View style={{ height: 8 }} />
        <Text
          style={{
            ...type.caption,
            color: '#9aa0a6',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          {accessText}
        </Text>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
