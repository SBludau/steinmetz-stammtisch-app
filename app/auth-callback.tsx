import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../src/lib/supabase'
import { colors } from '../src/theme/colors'
import { type } from '../src/theme/typography'

export default function AuthCallback() {
  const router = useRouter()
  const url = Linking.useURL() // letzte Deep-Link URL, z.B. stammtisch://auth-callback?code=...

  useEffect(() => {
    (async () => {
      try {
        // Versuche, den "code" aus der URL zu holen (PKCE-Flow)
        let code: string | undefined

        if (url) {
          const parsed = Linking.parse(url)
          // code kann in query (?code=...) oder im Fragment (#access_token=...) stecken
          code = (parsed.queryParams?.code as string | undefined) ?? undefined

          // Falls Access Token (impliziter Flow) zurückkommt, genügt meist getSession()
          if (!code && parsed.queryParams?.access_token) {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
              router.replace('/')
              return
            }
          }
        }

        if (code) {
          // Code gegen Session tauschen (PKCE)
          const { error } = await supabase.auth.exchangeCodeForSession({ code })
          if (error) throw error
          router.replace('/')
          return
        }

        // Fallback: Session checken
        const { data } = await supabase.auth.getSession()
        if (data.session) router.replace('/')
        else router.replace('/login')
      } catch (e) {
        // Im Fehlerfall zurück zum Login
        router.replace('/login')
      }
    })()
  }, [url, router])

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.gold} />
      <Text style={[type.body, { marginTop: 8 }]}>Authentifiziere…</Text>
    </View>
  )
}
