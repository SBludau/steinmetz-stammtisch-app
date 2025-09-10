// app/login.tsx
import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

WebBrowser.maybeCompleteAuthSession()

// Tokens (auch Hash-Fragment) extrahieren und Session setzen
async function createSessionFromUrl(url: string) {
  const parsed = new URL(url)
  const query = Object.fromEntries(parsed.searchParams.entries())
  const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash
  const frag = new URLSearchParams(hash || '')
  const fromHash = Object.fromEntries(frag.entries())

  const access_token = (fromHash['access_token'] || query['access_token']) as string | undefined
  const refresh_token = (fromHash['refresh_token'] || query['refresh_token']) as string | undefined
  const code = (fromHash['code'] || query['code']) as string | undefined

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) throw error
    return true
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return true
  }
  return false
}

export default function LoginScreen() {
  const router = useRouter()

  const [busyGoogle, setBusyGoogle] = useState(false)
  const [busyEmail, setBusyEmail] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ---------- Google-Login ----------
  async function signInWithGoogle() {
    try {
      setErr(null)
      setBusyGoogle(true)

      const inExpoGo = Constants.appOwnership === 'expo'

      // Expo Go: OAuth nicht unterstützt -> klare Meldung
      if (!Platform.OS === 'web' && inExpoGo) {
        Alert.alert(
          'Google-Login in Expo Go nicht möglich',
          'Bitte mit einem Development Build starten (EAS development) oder im Web testen.'
        )
        return
      }

      // Redirect ohne Proxy:
      const redirectTo =
        Platform.OS === 'web'
          ? `${window.location.origin}/auth-callback`
          : makeRedirectUri({ scheme: 'stammtisch', path: 'auth-callback' })

      const returnUrl = redirectTo

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error
      if (!data?.url) throw new Error('Keine OAuth-URL erhalten.')

      console.log('appOwnership =', Constants.appOwnership)
      console.log('redirectTo =', redirectTo)
      console.log('returnUrl =', returnUrl)
      console.log('authUrl =', data.url)

      if (Platform.OS === 'web') {
        window.location.href = data.url
      } else {
        // Dev/Prod (mit eigenem Scheme)
        const res = await WebBrowser.openAuthSessionAsync(data.url, returnUrl)
        if (res.type === 'success' && res.url) {
          const ok = await createSessionFromUrl(res.url)
          if (ok) router.replace('/')
        }
      }
    } catch (e: any) {
      console.error('Google Login Fehler:', e.message)
      setErr(e.message)
    } finally {
      setBusyGoogle(false)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: colors.bg,
      }}
    >
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            color: colors.gold,
            fontSize: 24,
            fontFamily: type.bold,
            textAlign: 'center',
          }}
        >
          Willkommen beim Stammtisch
        </Text>
      </View>

      {/* Google Login Button */}
      <Pressable
        onPress={signInWithGoogle}
        disabled={busyGoogle}
        style={{
          backgroundColor: colors.gold,
          padding: 15,
          borderRadius: radius.lg,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        {busyGoogle ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={{ color: colors.bg, fontSize: 16, fontFamily: type.bold }}>
            Mit Google anmelden
          </Text>
        )}
      </Pressable>

      {/* Email/Passwort – unverändert */}
      {err && (
        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{err}</Text>
      )}

      <TextInput
        placeholder="E-Mail"
        placeholderTextColor={colors.gold}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: colors.gold,
          padding: 10,
          borderRadius: radius.lg,
          marginBottom: 10,
          color: colors.gold,
        }}
      />

      <TextInput
        placeholder="Passwort"
        placeholderTextColor={colors.gold}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: colors.gold,
          padding: 10,
          borderRadius: radius.lg,
          marginBottom: 10,
          color: colors.gold,
        }}
      />

      <Pressable
        onPress={async () => {
          try {
            setBusyEmail(true)
            setErr(null)
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            router.replace('/')
          } catch (e: any) {
            console.error('Email Login Fehler:', e.message)
            setErr(e.message)
          } finally {
            setBusyEmail(false)
          }
        }}
        disabled={busyEmail}
        style={{
          backgroundColor: colors.bgLight,
          padding: 15,
          borderRadius: radius.lg,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        {busyEmail ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={{ color: colors.gold, fontSize: 16, fontFamily: type.bold }}>
            Mit E-Mail anmelden
          </Text>
        )}
      </Pressable>
    </ScrollView>
  )
}
