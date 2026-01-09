// app/member-card.tsx
import { useEffect, useState, useMemo } from 'react'
import { View, Text, Image, ActivityIndicator, ScrollView, Button } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

const PROFILE_PLACEHOLDER = 'https://placehold.co/400x400/1a1a1a/gold?text=?' // Platzhalter auch größer

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
  
  // Fallback Avatar (aus params oder Google RPC, falls nötig)
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null)

  const publicAvatarUrl = useMemo(() => {
    if (!profile?.avatar_url) return googleAvatar
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
    return data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : googleAvatar
  }, [profile?.avatar_url, googleAvatar])

  const fullName = useMemo(() => {
    if (!profile) return 'Lade...'
    const deg = profile.degree === 'dr' ? 'Dr. ' : profile.degree === 'prof' ? 'Prof. ' : ''
    // FIX: Zweitname zwischen Vor- und Nachname
    const mid = profile.middle_name ? ` ${profile.middle_name}` : ''
    return `${deg}${profile.first_name}${mid} ${profile.last_name}`.trim()
  }, [profile])

  // QR Code URL (externe API, keine extra Library nötig)
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
        // Falls kein DB-Bild, versuche Google Avatar via RPC
        if (!pData.avatar_url && pData.auth_user_id) {
           const { data: gData } = await supabase.rpc('public_get_google_avatars', { p_user_ids: [pData.auth_user_id] })
           if (gData && gData[0]?.avatar_url) setGoogleAvatar(gData[0].avatar_url)
        }
      }

      // IDs für Abfragen normalisieren
      const targetAuthId = pData?.auth_user_id || authId
      const targetProfileId = pData?.id || profileId

      // 2. Runden zählen (All-Time, nur approved)
      // Birthday Rounds
      const { count: cBirth } = await supabase
        .from('birthday_rounds')
        .select('*', { count: 'exact', head: true })
        .eq(targetAuthId ? 'auth_user_id' : 'profile_id', targetAuthId || targetProfileId)
        .not('approved_at', 'is', null)

      // Spender Rounds
      const { count: cSpender } = await supabase
        .from('spender_rounds')
        .select('*', { count: 'exact', head: true })
        .eq(targetAuthId ? 'auth_user_id' : 'profile_id', targetAuthId || targetProfileId)
        .not('approved_at', 'is', null)

      setRoundsCount((cBirth || 0) + (cSpender || 0))

      // 3. Events & Teilnahme laden (für Streak & Jahres-Statistik)
      // Alle vergangenen Stammtische laden
      const nowIso = new Date().toISOString()
      const { data: allEvents } = await supabase
        .from('stammtisch')
        .select('id, date')
        .lte('date', nowIso.slice(0, 10))
        .order('date', { ascending: true })
      
      const events = allEvents || []

      // Alle Teilnahmen dieses Users (linked & unlinked kombiniert)
      const myParticipationIds = new Set<number>()

      if (targetAuthId) {
        const { data: linked } = await supabase
          .from('stammtisch_participants')
          .select('stammtisch_id')
          .eq('auth_user_id', targetAuthId)
          .eq('status', 'going')
        linked?.forEach(r => myParticipationIds.add(r.stammtisch_id))
      }
      
      // Auch unlinked prüfen (könnte alte Einträge haben)
      if (targetProfileId) {
        const { data: unlinked } = await supabase
          .from('stammtisch_participants_unlinked')
          .select('stammtisch_id')
          .eq('profile_id', targetProfileId)
          .eq('status', 'going')
        unlinked?.forEach(r => myParticipationIds.add(r.stammtisch_id))
      }

      // A) All-Time Streak berechnen
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

      // B) Jahres-Statistik (Aktuelles Jahr)
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
        
        {/* Header */}
        <Text style={[type.h1, { textAlign: 'center', marginBottom: 20 }]}>Mitgliedsausweis</Text>

        {/* Die KARTE */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: radius.lg,
          borderWidth: 2,
          borderColor: colors.gold,
          padding: 24, // etwas mehr Padding innen
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        }}>
          
          {/* NEU: Zentriertes Layout (Bild Oben, Text darunter) */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {/* Avatar Groß - JETZT DOPPELT SO GROSS */}
            <Image 
              source={{ uri: publicAvatarUrl || PROFILE_PLACEHOLDER }} 
              style={{ 
                width: 280,  // <--- Verdoppelt von 140
                height: 280, // <--- Verdoppelt von 140
                borderRadius: 140, // <--- Angepasst (Hälfte der neuen Größe)
                borderWidth: 4,    // <--- Rahmen etwas dicker gemacht für die Größe
                borderColor: colors.border,
                backgroundColor: '#000',
                marginBottom: 20 // Abstand zum Namen etwas erhöht
              }} 
            />
            
            {/* Info Zentriert */}
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

          {/* Trennlinie */}
          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24, opacity: 0.5 }} />

          {/* Kennzahlen Grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            {/* Spalte 1: Runden */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>🍻</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{roundsCount}</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Runden{'\n'}gesamt</Text>
            </View>

            {/* Spalte 2: Streak */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>🔥</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{maxStreak}</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Längste{'\n'}Serie</Text>
            </View>

            {/* Spalte 3: Jahr % */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 28 }}>📅</Text>
              <Text style={[type.h2, { marginTop: 4 }]}>{attendanceYear}%</Text>
              <Text style={[type.caption, { textAlign: 'center', color: '#999' }]}>Anwesenheit{'\n'}{new Date().getFullYear()}</Text>
            </View>
          </View>

          {/* Zitat (falls vorhanden) */}
          {profile?.quote && (
            <View style={{ marginBottom: 20, padding: 10, backgroundColor: 'rgba(255,215,0, 0.1)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,215,0, 0.3)' }}>
              <Text style={[type.bodyMuted, { fontStyle: 'italic', textAlign: 'center', color: colors.gold }]}>
                "{profile.quote}"
              </Text>
            </View>
          )}

          {/* NEU: QR Code Bereich */}
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