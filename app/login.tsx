// app/login.tsx
import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

// Wichtig für Expo: sorgt dafür, dass eine ggf. offene Auth-Session korrekt geschlossen wird
WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const router = useRouter()

  // --- UI-States
  const [busyGoogle, setBusyGoogle] = useState(false)
  const [busyEmail, setBusyEmail] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // --- E-Mail/Passwort Felder
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Dein App-Deep-Link (steht so in app.json / README)
  const redirectTo = 'stammtisch://auth-callback'

  // --------- Google Login (korrekt für RN/Expo) ----------
  async function signInWithGoogle() {
    try {
      setErr(null)
      setBusyGoogle(true)

      // Wir lassen Supabase NUR die Start-URL generieren (kein Auto-Redirect)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error
      const authUrl = data?.url
      if (!authUrl) throw new Error('Keine OAuth-URL erhalten.')

      // Expo öffnet den In-App-Browser und wartet auf den Deep Link (redirectTo)
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo)

      // Wenn der Deep Link geklickt wurde, wechselt die App zur /auth-callback Seite.
      // Diese tauscht dort den Code gegen eine Session. Danach landen wir auf "/".
      if (result.type === 'success') {
        // Falls der Callback bereits gelaufen ist, landen wir hier direkt auf Home.
        router.replace('/')
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    } finally {
      setBusyGoogle(false)
    }
  }

  // --------- E-Mail/Passwort Login ----------
  async function signInWithEmail() {
    try {
      setErr(null)
      setBusyEmail(true)
      // klassischer Sign-In
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })
      if (error) throw error

      router.replace('/') // nach erfolgreichem Login zur Startseite
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

        {/* --- Google --- */}
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

        {/* --- Divider --- */}
        <Text style={[type.caption, { textAlign: 'center' }]}>oder</Text>

        {/* --- E-Mail / Passwort --- */}
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
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: colors.cardBg, color: colors.text,
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
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, backgroundColor: colors.cardBg, color: colors.text,
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
