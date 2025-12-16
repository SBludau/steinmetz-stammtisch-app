import { useEffect } from 'react'
import { View, Text, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../src/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // ============================================================
        // 1. WEB LOGIK (Vercel Fix)
        // Läuft NUR im Browser. Android ignoriert das komplett.
        // ============================================================
        if (Platform.OS === 'web') {
          // Im Web versteckt Supabase die Tokens im Hash (#access_token=...)
          // Linking.parse ist im Web manchmal unzuverlässig mit Hashes.
          const hash = window.location.hash
          
          if (!hash) {
            // Kein Hash? Vielleicht sind wir schon eingeloggt?
             const { data } = await supabase.auth.getSession()
             if (data.session) {
                router.replace('/')
                return
             }
          }

          // Hash manuell zerlegen (Sicherste Methode für Web)
          const params = new URLSearchParams(hash.replace('#', ''))
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          const code = params.get('code')

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (!error) {
                router.replace('/')
                return
            }
          }
          
          // Fallback für Code Flow
          if (code) {
             const { error } = await supabase.auth.exchangeCodeForSession(code)
             if (!error) {
                router.replace('/')
                return
             }
          }
          
          // Wenn alles fehlschlägt, lass Supabase es selbst versuchen
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.replace('/')
            else router.replace('/login') // Zurück zum Start, wenn nix gefunden
          })
        
        // ============================================================
        // 2. ANDROID / IOS LOGIK (Original Code)
        // Läuft NUR in der App. Web ignoriert das komplett.
        // ============================================================
        } else {
          const url = Linking.useURL()
          if (!url) return

          const { queryParams } = Linking.parse(url)
          const code = queryParams?.code as string | undefined
          const access_token = queryParams?.access_token as string | undefined
          const refresh_token = queryParams?.refresh_token as string | undefined

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) console.error('Native exchange error:', error.message)
          } else if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) console.error('Native setSession error:', error.message)
          }

          router.replace('/')
        }

      } catch (e: any) {
        console.error('AuthCallback error:', e.message)
        // Im Zweifel zur Login-Seite zurück, statt White Screen
        if (Platform.OS === 'web') router.replace('/login')
      }
    }

    handleAuth()
  }, [router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#FFD700', marginBottom: 20 }}>Anmeldung läuft...</Text>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  )
}