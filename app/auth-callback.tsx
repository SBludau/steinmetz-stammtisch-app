// app/auth-callback.tsx
import { useEffect, useRef } from 'react'
import { View, Text, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../src/lib/supabase'

// Wie lange darf "Verbinde..." maximal stehen bleiben, bevor wir aufgeben?
const TIMEOUT_MS = 10000

export default function AuthCallback() {
  const router = useRouter()

  // FIX 1: Hook MUSS oben stehen, nicht im useEffect!
  const url = Linking.useURL()

  // FIX 2: merkt sich, ob schon weitergeleitet wurde (verhindert doppelte Navigation)
  const doneRef = useRef(false)

  // FIX 3: Notbremse. Wenn nach TIMEOUT_MS immer noch nichts passiert ist,
  // zurueck zum Login statt endlos "Verbinde..." anzuzeigen.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        router.replace('/login')
      }
    }, TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [router])

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
          // Wir nutzen die url vom Hook oben.
          // FIX 4: Fehlt sie (passiert regelmaessig, wenn die App beim Zurueckkommen
          // aus dem Browser schon lief), brechen wir NICHT mehr ab. Weiter unten
          // wird trotzdem geprueft, ob inzwischen eine Anmeldung vorliegt.
          if (url) {
            const { queryParams } = Linking.parse(url)
            const code = queryParams?.code as string | undefined
            const access_token = queryParams?.access_token as string | undefined
            const refresh_token = queryParams?.refresh_token as string | undefined

            if (code) {
              const { error } = await supabase.auth.exchangeCodeForSession(code)
              if (!error) sessionCreated = true
              // Ein Fehler ist hier nicht schlimm: der Code gilt nur einmal und
              // kann bereits von login.tsx eingeloest worden sein.
            } else if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({ access_token, refresh_token })
              if (!error) sessionCreated = true
            }
          }
        }

        // ============================================================
        // 3. WEICHE: Wohin geht es?
        // ============================================================
        // FIX 5: Es wird IMMER nachgesehen, ob eine Anmeldung vorliegt – auch wenn
        // oben nichts eingelöst werden konnte. Genau dieser Fall (Session war
        // längst da, wurde hier aber nie geprüft) liess den Bildschirm früher
        // endlos auf "Verbinde..." stehen.
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Prüfen: Hat dieser User ein Profil?
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_user_id', session.user.id)
            .maybeSingle()

          if (doneRef.current) return
          doneRef.current = true

          if (profile) {
            router.replace('/')
          } else {
            router.replace('/claim-profile')
          }
          return
        }

        // Keine Anmeldung vorhanden. Nichts tun: entweder trifft gleich noch die
        // Rückkehr-Adresse ein (dann läuft dieser Effekt erneut), oder die
        // Notbremse weiter oben schickt uns nach TIMEOUT_MS zurück zum Login.
        console.log('AuthCallback: noch keine Session (eingelöst:', sessionCreated, ')')

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