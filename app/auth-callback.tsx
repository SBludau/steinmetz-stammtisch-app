// app/auth-callback.tsx
import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../src/lib/supabase'
import { colors } from '../src/theme/colors'
import { type } from '../src/theme/typography'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ code?: string; error?: string }>()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        if (params?.error) {
          setErr(String(params.error))
          return
        }
        const code = typeof params.code === 'string' ? params.code : undefined
        if (!code) {
          setErr('Kein Code im Callback.')
          return
        }
        // Tauscht den Code gegen eine Session (Access/Refresh)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error

        router.replace('/') // fertig, zurück zur Startseite
      } catch (e: any) {
        setErr(e?.message ?? String(e))
      }
    })()
  }, [params, router])

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {!err ? (
        <>
          <ActivityIndicator color={colors.text} />
          <Text style={[type.body, { marginTop: 12 }]}>Anmeldung wird abgeschlossen …</Text>
        </>
      ) : (
        <>
          <Text style={[type.h2, { color: colors.red, marginBottom: 8 }]}>Anmeldung fehlgeschlagen</Text>
          <Text style={type.body}>{err}</Text>
        </>
      )}
    </View>
  )
}
