// app/auth-callback.tsx
import { useEffect } from 'react'
import { View, Text, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../src/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  
  // FIX 1: Hook MUSS oben stehen, nicht im useEffect!
  const url = Linking.useURL()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        let sessionCreated = false

        // ============================================================
        // 1. WEB LOGIK
        // ============================================================
        if (Platform.OS === 'web') {
          const hash = window.location.hash
          
          // Fall A: Schon eingeloggt?
          if (!hash) {
             const { data } = await supabase.auth.getSession()
             if (data.session) sessionCreated = true
          } else {
            // Fall B: Hash verarbeiten
            const params = new URLSearchParams(hash.replace('#', ''))
            const accessToken = params.get('access_token')
            const refreshToken = params.get('refresh_token')
            const code = params.get('code')

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              if (!error) sessionCreated = true
            } else if (code) {
               const { error } = await supabase.auth.exchangeCodeForSession(code)
               if (!error) sessionCreated = true
            }
          }
        
        // ============================================================
        // 2. NATIVE (Android/iOS) LOGIK
        // ============================================================
        } else {
          // Wir nutzen die url vom Hook oben
          if (!url) return 

          const { queryParams } = Linking.parse(url)
          const code = queryParams?.code as string | undefined
          const access_token = queryParams?.access_token as string | undefined
          const refresh_token = queryParams?.refresh_token as string | undefined

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error) sessionCreated = true
          } else if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (!error) sessionCreated = true
          }
        }

        // ============================================================
        // 3. WEICHE: Wohin geht es?
        // ============================================================
        if (sessionCreated) {
           // Sicherheitshalber aktuelle Session holen
           const { data: { session } } = await supabase.auth.getSession()
           
           if (session?.user) {
             // Prüfen: Hat dieser User ein Profil?
             const { data: profile } = await supabase
               .from('profiles')
               .select('id')
               .eq('auth_user_id', session.user.id)
               .maybeSingle()

             if (profile) {
               router.replace('/')
             } else {
               router.replace('/claim-profile')
             }
             return
           }
        }

        // Falls keine Session zustande kam (z.B. User bricht ab), zurück zum Login
        // router.replace('/login') 
        // (Optional: hier könnte man auch nichts tun und den User manuell navigieren lassen)

      } catch (e: any) {
        console.error('AuthCallback error:', e.message)
        if (Platform.OS === 'web') router.replace('/login')
      }
    }

    handleAuth()
  }, [url, router]) // url ist jetzt dependency

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#FFD700', marginBottom: 20 }}>Verbinde...</Text>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  )
}