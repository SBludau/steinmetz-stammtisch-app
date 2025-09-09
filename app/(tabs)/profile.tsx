import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, Image, Button, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type Profile = {
  first_name: string | null
  last_name: string | null
  title: string | null
  birthday: string | null // YYYY-MM-DD
  quote: string | null
  avatar_url?: string | null
}

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [form, setForm] = useState<Profile>({
    first_name: '',
    last_name: '',
    title: '',
    birthday: '',
    quote: '',
    avatar_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Bildauswahl / Upload
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null)

  // Public-URL aus Pfad bauen (Bucket ist public)
  const publicAvatarUrl = useMemo(() => {
    if (!form.avatar_url) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(form.avatar_url)
    return data.publicUrl ?? null
  }, [form.avatar_url])

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

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name,last_name,title,birthday,quote,avatar_url')
        .eq('auth_user_id', uid)
        .maybeSingle()

      if (error && (error as any).code !== 'PGRST116') {
        setError(error.message)
      } else if (data) {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          title: data.title ?? '',
          birthday: data.birthday ?? '',
          quote: data.quote ?? '',
          avatar_url: data.avatar_url ?? null,
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
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { setError('Nicht eingeloggt.'); return }
    const uid = userData.user.id

    setSaving(true)
    const payload = {
      auth_user_id: uid,
      first_name: form.first_name?.trim() || null,
      last_name: form.last_name?.trim() || null,
      title: form.title?.trim() || null,
      birthday: form.birthday?.trim() || null,
      quote: form.quote?.trim() || null,
      avatar_url: form.avatar_url || null,
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom + NAV_BAR_BASE_HEIGHT }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Mein Profil</Text>

        {/* Avatar-Card */}
        <View
          style={{
            alignItems: 'center',
            gap: 10,
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Foto wählen" onPress={pickFromLibrary} />
            <Button title="Kamera" onPress={takePhoto} />
          </View>
          <Button title="Avatar hochladen & speichern" onPress={uploadAvatarAndSave} disabled={saving || !avatarPreviewUri} />
        </View>

        {/* Form-Card */}
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
            value={form.first_name ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, first_name: v }))}
            placeholder="Max"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Nachname</Text>
          <TextInput
            value={form.last_name ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, last_name: v }))}
            placeholder="Mustermann"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Titel (z. B. Rolle)</Text>
          <TextInput
            value={form.title ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            placeholder="Organisator"
            placeholderTextColor="#bfbfbf"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Geburtstag (YYYY-MM-DD)</Text>
          <TextInput
            value={form.birthday ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, birthday: v }))}
            placeholder="1990-05-21"
            placeholderTextColor="#bfbfbf"
            autoCapitalize="none"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <Text style={type.h2}>Zitat</Text>
          <TextInput
            value={form.quote ?? ''}
            onChangeText={(v) => setForm((f) => ({ ...f, quote: v }))}
            placeholder="Lieblingsspruch…"
            placeholderTextColor="#bfbfbf"
            multiline
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, minHeight: 60, backgroundColor: '#0d0d0d', color: colors.text,
            }}
          />

          <View style={{ gap: 10, marginTop: 4 }}>
            <Button title={saving ? 'Speichere…' : 'Profil speichern'} onPress={saveProfileText} disabled={saving} />
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
