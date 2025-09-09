// app/login.tsx
import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useRouter } from 'expo-router'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

// Expo-Empfehlung: AuthSessionResult korrekt schließen
WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Wir erzwingen das native Deep-Link-Ziel – passt zu app.json ("scheme": "stammtisch")
  // und README ("Site URL" & "Additional Redirect URLs" enthalten stammtisch://auth-callback)
  const redirectTo = 'stammtisch://auth-callback'

  async function signInWithGoogle() {
    try {
      setErr(null)
      setBusy(true)

      // 1) Supabase um die OAuth-Start-URL bitten (kein Auto-Redirect!)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // <-- wichtig für RN / Expo
        },
      })
      if (error) throw error
      const authUrl = data?.url
      if (!authUrl) throw new Error('Keine OAuth-URL erhalten.')

      // 2) In-App-Browser-Session öffnen und auf den Deep Link warten
      // second arg = Deep-Link, bei Rückkehr wird die Session geschlossen
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo)

      // 3) Ergebnis auswerten: Wenn der Deep Link getriggert wurde,
      // übernimmt unsere /auth-callback-Seite die Session-Übergabe. Wir gehen auf Startseite.
      if (result.type === 'success') {
        // Optional: Wir lassen auth-callback.tsx die Session tauschen.
        // Hier nur Navigation (falls auth-callback bereits lief).
        router.replace('/')
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    } finally {
      setBusy(false)
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
        <Text style={type.body}>Bitte mit Google anmelden.</Text>

        <Pressable
          onPress={signInWithGoogle}
          disabled={busy}
          style={{
            backgroundColor: colors.red,
            borderRadius: radius.md,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={[type.button, { color: colors.text }]}>Mit Google anmelden</Text>
          )}
        </Pressable>

        {err ? <Text style={{ ...type.body, color: colors.red }}>Fehler: {err}</Text> : null}
      </ScrollView>
    </View>
  )
}
