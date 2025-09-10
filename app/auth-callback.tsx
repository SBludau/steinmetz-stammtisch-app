// app/auth-callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '../src/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // URL ermitteln: auf Web window.location.href, auf Native Linking.useURL()
        const url =
          typeof window !== 'undefined'
            ? window.location.href
            : Linking.useURL() || ''

        if (!url) return

        const { queryParams } = Linking.parse(url)
        const code = queryParams?.code as string | undefined
        const access_token = queryParams?.access_token as string | undefined
        const refresh_token = queryParams?.refresh_token as string | undefined

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) console.error('exchangeCodeForSession error:', error.message)
        } else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) console.error('setSession error:', error.message)
        }

        router.replace('/')
      } catch (e: any) {
        console.error('AuthCallback error:', e.message)
      }
    }

    handleAuth()
  }, [router])

  return null
}
