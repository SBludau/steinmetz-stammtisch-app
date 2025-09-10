// app/login.tsx
import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import Constants from 'expo-constants'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

WebBrowser.maybeCompleteAuthSession()

// Tokens/Code aus der zurückgegebenen URL lesen und bei Supabase setzen
async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url)
  if (errorCode) throw new Error(errorCode)

  const access_token = params['access_token'] as string | undefined
  const refresh_token = params['refresh_token'] as string | undefined
  const code = params['code'] as string | undefined

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

  // Expo Go nutzt den Proxy, Dev Build/Prod das App-Scheme
  const inExpoGo = Constants.appOwnership === 'expo'
  const proxyRedirect = 'https://auth.expo.io/@sbludau/steinmetz-stammtisch-app'
  const redirectTo = inExpoGo ? proxyRedirect : 'stammtisch://auth-callback'

  // ---------- Google-Login ----------
  async function signInWithGoogle() {
    try {
      setErr(null)
      setBusyGoogle(true)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // wir steuern den Browser-Flow selbst
        },
      })
      if (error) throw error
      if (!data?.url) throw new Error('Keine OAuth-URL erhalten.')

      // Diagnose-Logs
      console.log('appOwnership =', Constants.appOwnership)
      console.log('redirectTo =', redirectTo)
      console.log('authUrl =', data.url)

      // Startet den OAuth-Flow via Expo AuthSession (Proxy in Expo Go)
      const res = await AuthSession.startAsync({
        authUrl: data.url,
        returnUrl: redirectTo,
      })

      console.log('AuthSession.startAsync result =', res?.type, (res as any)?.url)

      if (res.type === 'success' && (res as any).url) {
        const ok = await createSessionFromUrl((res as any).url as string)
        if (ok) {
          router.replace('/')
          return
        }
        // Fallback: zur Callback-Route, die ggf. den Code tauscht
        router.replace('/auth-callback')
      } else if (res.type === 'dismiss' || res.type === 'cancel') {
        setErr('Anmeldung abgebrochen.')
      } else if (res.type === 'error') {
        setErr('Anmeldung fehlgeschlagen.')
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    } finally {
      setBusyGoogle(false)
    }
  }

  // ---------- E-Mail/Passwort ----------
  async function signInWithEmail() {
    try {
      setErr(null)
      setBusyEmail(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      router.replace('/')
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    } finally {
      setBusyEmail(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Anmelden</Text>

        {/* Google */}
        <Pressable
          onPress={signInWithGoogle}
          disabled={busyGoogle}
          style={{
            backgroundColor: colors.red,
            borderRadius: radius.md,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            opacity: busyGoogle ? 0.7 : 1,
          }}
        >
          {busyGoogle ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={[type.button, { color: colors.text }]}>Mit Google anmelden</Text>
          )}
        </Pressable>

        <Text style={[type.caption, { textAlign: 'center' }]}>oder</Text>

        {/* E-Mail/Passwort */}
        <View style={{ gap: 8 }}>
          <Text style={type.h2}>E-Mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="du@beispiel.de"
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

          <Text style={[type.h2, { marginTop: 8 }]}>Passwort</Text>
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

          <Pressable
            onPress={signInWithEmail}
            disabled={busyEmail}
            style={{
              marginTop: 12,
              backgroundColor: colors.cardBg,
              borderRadius: radius.md,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              opacity: busyEmail ? 0.7 : 1,
            }}
          >
            {busyEmail ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[type.button, { color: colors.text }]}>Mit E-Mail anmelden</Text>
            )}
          </Pressable>
        </View>

        {err ? <Text style={{ ...type.body, color: colors.red }}>Fehler: {err}</Text> : null}
      </ScrollView>
    </View>
  )
}
