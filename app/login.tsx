// app/login.tsx
import { useState, useEffect } from 'react'
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

// Hilfsfunktion für manuellen Session-Bau (Fallback)
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

  // >>> NEU: Weiche mit Profil-Check
  useEffect(() => {
    let mounted = true

    const checkProfileAndRedirect = async (session: any) => {
      if (!session?.user) return

      // Prüfen, ob ein Profil existiert
      const { data } = await supabase
        .from('profiles')
        .select('auth_user_id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle()

      if (!mounted) return

      if (data) {
        // Profil existiert -> Rein in die App
        router.replace('/')
      } else {
        // Kein Profil -> Ab zur Auswahlseite
        router.replace('/claim-profile')
      }
    }

    // 1. Check beim Laden
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted && data?.session) {
        await checkProfileAndRedirect(data.session)
      }
    })()

    // 2. Check bei Login-Event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkProfileAndRedirect(session)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])
  // <<< NEU Ende

  // ---------- Google-Login ----------
  async function signInWithGoogle() {
    try {
      setErr(null)
      setBusyGoogle(true)

      const inExpoGo = Constants.appOwnership === 'expo'

      if (!Platform.OS === 'web' && inExpoGo) {
        Alert.alert(
          'Google-Login in Expo Go nicht möglich',
          'Bitte mit einem Development Build starten (EAS development) oder im Web testen.'
        )
        return
      }

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

      if (Platform.OS === 'web') {
        window.location.href = data.url
      } else {
        const res = await WebBrowser.openAuthSessionAsync(data.url, returnUrl)
        if (res.type === 'success' && res.url) {
          await createSessionFromUrl(res.url)
          // useEffect übernimmt das Redirecting
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
          marginBottom: 6,
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

      <Text
        style={{
          textAlign: 'center',
          marginBottom: 10,
          opacity: 0.8,
          fontSize: 12,
          color: colors.gold,
          fontFamily: type.body.fontFamily ?? undefined,
        }}
      >
        Wir speichern keine Daten in der App – und kein Passwort. Über Google kommt nur ein „Okay, ich bin’s“.
      </Text>

      {/* Email/Passwort */}
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
            // useEffect übernimmt Redirecting
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