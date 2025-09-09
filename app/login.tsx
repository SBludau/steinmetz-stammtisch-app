import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'      // <- korrekt für app/login.tsx
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
WebBrowser.maybeCompleteAuthSession()


// Themed Button
function TButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  title: string
  onPress: () => void
  variant?: 'primary' | 'gold' | 'ghost'
  disabled?: boolean
}) {
  const base = {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1 as const,
  }
  const styles =
    variant === 'primary'
      ? { backgroundColor: colors.red, borderColor: colors.border }
      : variant === 'gold'
      ? { backgroundColor: colors.gold, borderColor: colors.gold }
      : { backgroundColor: 'transparent', borderColor: colors.border }

  const textStyle =
    variant === 'gold'
      ? { ...type.button, color: '#000' }
      : { ...type.button, color: colors.text }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [base, styles, disabled ? { opacity: 0.6 } : { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  )
}

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function signIn() {
    setLoading(true); setError(''); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (error) setError(error.message)
    else router.replace('/')
  }

  async function signUp() {
    setLoading(true); setError(''); setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (error) setError(error.message)
    else {
      if (data.user && !data.session) setMessage('Registriert. Prüfe ggf. deine E-Mail zur Bestätigung.')
      else router.replace('/')
    }
  }

async function signInWithGoogle() {
  setLoading(true); setError(''); setMessage('')

  // Redirect-Ziel:
  // - Web: aktuelle Origin (z.B. http://localhost:8081)
  // - Native (Android/iOS): Deep Link "stammtisch://auth-callback"
  const redirectTo =
    Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? window.location.origin : undefined)
      : Linking.createURL('auth-callback') // nutzt dein scheme aus app.json

  try {
    // Wir holen die OAuth-URL und öffnen sie selbst im In-App Browser
    const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'stammtisch://auth-callback', // <<< feste Deep-Link-URL
    skipBrowserRedirect: false,               // Standard (nur zur Klarheit)
  },
})
    if (error) throw error

    if (data?.url) {
      // Öffnet den OAuth-Flow und kehrt zurück, sobald zum redirectTo zurückgeleitet wird
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo as string)
      // Danach übernimmt unser /auth-callback-Screen (nächster Schritt)
    }
  } catch (e: any) {
    setError(e?.message ?? String(e))
  } finally {
    setLoading(false)
  }
}


  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ marginBottom: insets.bottom }}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24, paddingHorizontal: 16, gap: 14 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={[type.h1, { textAlign: 'center' }]}>Login</Text>

        <TButton title="Mit Google anmelden" onPress={signInWithGoogle} variant="gold" />

        <Text style={{ ...type.body, textAlign: 'center', opacity: 0.7 }}>oder</Text>

        <Text style={type.h2}>E-Mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="name@example.com"
          placeholderTextColor="#bfbfbf"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 10,
            backgroundColor: colors.cardBg,
            color: colors.text,
          }}
        />

        <Text style={type.h2}>Passwort</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#bfbfbf"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 10,
            backgroundColor: colors.cardBg,
            color: colors.text,
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TButton title={loading ? 'Bitte warten…' : 'Einloggen'} onPress={signIn} disabled={loading} />
          <TButton title="Registrieren" onPress={signUp} disabled={loading} variant="ghost" />
        </View>

        <Text style={{ ...type.caption, textAlign: 'center' }}>
          Mit dem Login stimmst du unseren Nutzungsbedingungen zu.
        </Text>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : null}
        {message ? <Text style={{ ...type.body, color: colors.gold }}>{message}</Text> : null}
        {error ? <Text style={{ ...type.body, color: colors.red }}>{error}</Text> : null}

        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <TButton title="Zur Startseite" onPress={() => router.replace('/')} variant="ghost" />
        </View>
      </ScrollView>
    </View>
  )
}
