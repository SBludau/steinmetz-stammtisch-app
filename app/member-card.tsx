// app/member-card.tsx
import { useEffect, useState, useMemo } from 'react'
import { View, Text, Image, ActivityIndicator, ScrollView, Button } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

const PROFILE_PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/gold?text=?'

type Degree = 'none' | 'dr' | 'prof'
type ProfileData = {
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  title: string | null
  degree: Degree | null
  avatar_url: string | null
  quote: string | null
  role: string | null
}

export default function MemberCardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  
  // Wir erwarten entweder authId oder profileId
  const authId = params.authId as string | undefined
  const profileId = params.profileId ? Number(params.profileId) : undefined

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  
  // Stats
  const [roundsCount, setRoundsCount] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [attendanceYear, setAttendanceYear] = useState(0) // in %
  
  // Fallback Avatar
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null)

  const publicAvatarUrl = useMemo(() => {
    if (!profile?.avatar_url) return googleAvatar
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
    return data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : googleAvatar
  }, [profile?.avatar_url, googleAvatar])

  const fullName = useMemo(() => {
    if (!profile) return 'Lade...'
    const deg = profile.degree === 'dr' ? 'Dr. ' : profile.degree === 'prof' ? 'Prof. ' : ''
    const mid = profile.middle_name ? ` ${profile.middle_name}` : ''
    return `${deg}${profile.first_name}${mid} ${profile.last_name}`.trim()
  }, [profile])

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("Wer das liest ist doof!")}&bgcolor=ffffff`

  useEffect(() => {
    loadAllData()
  }, [authId, profileId])

  async function loadAllData() {
    setLoading(true)
    try {
      // 1. Profil laden
      let query = supabase.from('profiles').select('*')
      if (authId) query = query.eq('auth_user_id', authId)
      else if (profileId) query = query.eq('id', profileId)
      
      const { data: pData, error: pErr } = await query.maybeSingle()
      if (pErr) throw pErr
      
      if (pData) {
        setProfile(pData)
        if (!pData.avatar_url && pData.auth_user_id) {
           const { data: gData } = await supabase.rpc('public_get_google_avatars', { p_user_ids: [pData.auth_user_id] })
           if (gData && gData[0]?.avatar_url) setGoogleAvatar(gData[0].avatar_url)
        }
      }

      // IDs normalisieren
      const targetAuthId = pData?.auth_user_id || authId
      const targetProfileId = pData?.id || profileId

      // 2. Runden zählen (All-Time, nur approved)
      // FIX: Wir suchen jetzt nach Auth-ID ODER Profil-ID (kombiniert), um "Hybrid-User" komplett zu erfassen.
      
      // Basis-Queries vorbereiten
      let queryBirth = supabase
        .from('birthday_rounds')
        .select('*', { count: 'exact', head: true })
        .not('approved_at', 'is', null)

      let querySpender = supabase
        .from('spender_rounds')
        .select('*', { count: 'exact', head: true })
        .not('approved_at', 'is', null)

      // Filterlogik anwenden
      if (targetAuthId && targetProfileId) {
        // User ist verknüpft -> Finde Einträge für Auth-ID ODER Profil-ID
        const orFilter = `auth_user_id.eq.${targetAuthId},profile_id.eq.${targetProfileId}`
        queryBirth = queryBirth.or(orFilter)
        querySpender = querySpender.or(orFilter)
      } else if (targetAuthId) {
        queryBirth = queryBirth.eq('auth_user_id', targetAuthId)
        querySpender = querySpender.eq('auth_user_id', targetAuthId)
      } else {
        queryBirth = queryBirth.eq('profile_id', targetProfileId)
        querySpender = querySpender.eq('profile_id', targetProfileId)
      }

      const { count: cBirth } = await queryBirth
      const { count: cSpender } = await querySpender

      setRoundsCount((cBirth || 0) + (cSpender || 0))

      // 3. Events & Teilnahme laden
      const nowIso = new Date().toISOString()
      const { data: allEvents } = await supabase
        .from('stammtisch')
        .select('id, date')
        .lte('date', nowIso.slice(0, 10))
        .order('date', { ascending: true })
      
      const events = allEvents || []

      // Alle Teilnahmen (hier war die Logik schon korrekt getrennt, da linked/unlinked separate Tabellen sind)
      const myParticipationIds = new Set<number>()

      if (targetAuthId) {
        const { data: linked } = await supabase
          .from('stammtisch_participants')
          .select('stammtisch_id')
          .eq('auth_user_id', targetAuthId)
          .eq('status', 'going')
        linked?.forEach(r => myParticipationIds.add(r.stammtisch_id))
      }
      
      if (targetProfileId) {
        const { data: unlinked } = await supabase
          .from('stammtisch_participants_unlinked')
          .select('stammtisch_id')
          .eq('profile_id', targetProfileId)
          .eq('status', 'going')
        unlinked?.forEach(r => myParticipationIds.add(r.stammtisch_id))
      }

      // A) Streak
      let currentStreak = 0
      let maxS = 0
      for (const ev of events) {
        if (myParticipationIds.has(ev.id)) {
          currentStreak++
          if (currentStreak > maxS) maxS = currentStreak
        } else {
          currentStreak = 0
        }
      }
      setMaxStreak(maxS)

      // B) Jahres-Statistik
      const currentYear = new Date().getFullYear()
      const eventsThisYear = events.filter(e => e.date.startsWith(`${currentYear}-`))
      const countEventsYear = eventsThisYear.length
      
      if (countEventsYear > 0) {
        let attendedThisYear = 0
        for (const ev of eventsThisYear) {
          if (myParticipationIds.has(ev.id)) attendedThisYear++
        }
        setAttendanceYear(Math.round((attendedThisYear / countEventsYear) * 100))
      } else {
        setAttendanceYear(0)
      }

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20 }}>
        
        <Text style={[type.h1, { textAlign: 'center', marginBottom: 20 }]}>Mitgliedsausweis</Text>

        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: radius.lg,
          borderWidth: 2,
          borderColor: colors.gold,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        }}>
          
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image 
              source={{ uri: publicAvatarUrl || PROFILE_PLACEHOLDER }} 
              style={{ 
                width: 280, 
                height: 280, 
                borderRadius: 140, 
                borderWidth: 4, 
                borderColor: colors.border,
                backgroundColor: '#000',
                marginBottom: 20 
              }} 
            />
            
            <Text style={[type.h2, { fontSize: 28, color: colors.gold, textAlign: 'center' }]}>
              {fullName}
            </Text>
              
            {profile?.title ? (
              <Text style={[type.body, { color: '#fff', fontWeight: 'bold', marginTop: 4, textAlign: 'center', fontSize: 18 }]}>
                 {profile.title}
              </Text>
            ) : (
              <Text style={[type.bodyMuted, { marginTop: 4, fontStyle: 'italic', textAlign: 'center', fontSize: 18 }]}>
                Mitglied
              </Text>
            )}

            {profile?.role === 'admin' && (
              <View style={{ marginTop: 10, backgroundColor: colors.red, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                 <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>ADMIN</Text>
              </View>
            )}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24, opacity: 0.5 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>🍻</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{roundsCount}</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Runden{'\n'}gesamt</Text>
            </View>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>🔥</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{maxStreak}</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Längste{'\n'}Serie</Text>
            </View>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>📅</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{attendanceYear}%</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Anwesenheit{'\n'}{new Date().getFullYear()}</Text>
            </View>
          </View>

          {profile?.quote && (
            <View style={{ marginBottom: 20, padding: 10, backgroundColor: 'rgba(255,215,0, 0.1)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,215,0, 0.3)' }}>
              <Text style={[type.bodyMuted, { fontStyle: 'italic', textAlign: 'center', color: colors.gold }]}>
                "{profile.quote}"
              </Text>
            </View>
          )}

          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <View style={{ backgroundColor: '#fff', padding: 4, borderRadius: 4 }}>
               <Image 
                 source={{ uri: qrCodeUrl }}
                 style={{ width: 100, height: 100 }}
               />
            </View>
          </View>

        </View>

        <View style={{ marginTop: 30 }}>
           <Button title="Schließen" color={colors.gold} onPress={() => router.back()} />
        </View>

      </ScrollView>
    </View>
  )
}