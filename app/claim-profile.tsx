// app/claim-profile.tsx
import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
// BottomNav entfernt, da User ohne Profil nicht navigieren darf
import { colors, radius } from '../src/theme/colors'
import { type } from '../src/theme/typography'

type Degree = 'none' | 'dr' | 'prof'

type ProfileRow = {
  id: number
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  title: string | null
  quote: string | null
  avatar_url: string | null
  degree: Degree | null
  auth_user_id: string | null
  self_check: boolean | null
}

type ClaimRow = {
  id: number
  profile_id: number
  claimant_user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}

export default function ClaimProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<ProfileRow[]>([])
  const [claims, setClaims] = useState<Record<number, ClaimRow>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [uid, setUid] = useState<string | null>(null)

  const publicUrlFor = (path: string | null) => {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl ?? null
  }

  const displayName = (r: ProfileRow) => {
    const deg = (r.degree ?? 'none') as Degree
    const degPrefix = deg === 'dr' ? 'Dr. ' : deg === 'prof' ? 'Prof. ' : ''
    const mid = r.middle_name ? ` ${r.middle_name}` : ''
    return `${degPrefix}${r.first_name ?? ''}${mid} ${r.last_name ?? ''}`.trim()
  }

  // NEU: Logout-Funktion statt "Zurück"
  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  async function loadData() {
    setLoading(true)
    setError(''); setMessage('')
    const { data: userData, error: uErr } = await supabase.auth.getUser()
    if (uErr || !userData?.user) {
      router.replace('/login')
      return
    }
    const myUid = userData.user.id
    setUid(myUid)

    // Profile: unverknüpft ODER mein eigenes
    const { data: profs, error: pErr } = await supabase
      .from('profiles')
      .select('id,first_name,middle_name,last_name,title,quote,avatar_url,degree,auth_user_id,self_check')
      .or(`auth_user_id.is.null,auth_user_id.eq.${myUid}`)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (pErr) {
      setError(pErr.message)
      setLoading(false)
      return
    }

    setRows(profs ?? [])

    // Claims des aktuellen Users laden
    const { data: myClaims, error: cErr } = await supabase
      .from('profile_claims')
      .select('id,profile_id,claimant_user_id,status')
      .eq('claimant_user_id', myUid)

    if (cErr) {
      setError(cErr.message)
      setLoading(false)
      return
    }

    const claimMap: Record<number, ClaimRow> = {}
    ;(myClaims ?? []).forEach(c => { claimMap[c.profile_id] = c })
    setClaims(claimMap)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function badgeFor(r: ProfileRow): string {
    // bereits mit irgendeinem User verknüpft?
    if (r.auth_user_id) {
      return r.self_check ? '✅ verknüpft & bestätigt' : '🔒 verknüpft (ausstehend)'
    }
    // unverknüpft → gibt es von mir einen Claim?
    const cl = claims[r.id]
    if (cl?.status === 'pending') return '🟡 Anfrage gesendet (wartet auf Bestätigung)'
    if (cl?.status === 'approved') return '✅ verknüpft & bestätigt'
    if (cl?.status === 'rejected') return '⛔ abgelehnt'
    if (cl?.status === 'cancelled') return '🔁 zurückgezogen'
    return '🟢 unverknüpft'
  }

  function disableSelect(r: ProfileRow): boolean {
    // schon fest verknüpft & bestätigt → keine Auswahl
    if (r.auth_user_id && r.self_check) return true
    // mein eigener, aber noch nicht bestätigt → ebenso gesperrt
    if (r.auth_user_id && !r.self_check) return true
    // unverknüpft, aber ich habe pending/approved Claim → sperren
    const cl = claims[r.id]
    if (cl?.status === 'pending' || cl?.status === 'approved') return true
    return false
  }

  async function submitClaim() {
    setError(''); setMessage('')
    if (!uid) { setError('Nicht eingeloggt.'); return }
    if (!selectedId) { setError('Bitte zuerst ein Profil auswählen.'); return }

    // Sicherheitscheck: darf ich auf dieses Profil claimen?
    const target = rows.find(r => r.id === selectedId)
    if (!target) { setError('Profil nicht gefunden.'); return }
    if (disableSelect(target)) {
      setError('Dieses Profil kann nicht angefragt werden.')
      return
    }
    if (target.auth_user_id) {
      setError('Profil ist bereits verknüpft.')
      return
    }

    setSubmitting(true)
    try {
      // Claim anlegen (status=pending)
      const { error: insErr } = await supabase
        .from('profile_claims')
        .insert({
          profile_id: selectedId,
          claimant_user_id: uid,
          status: 'pending',
        } as any)

      if (insErr) {
        // 23505 = unique_violation
        if ((insErr as any).code === '23505') {
          setMessage('Es existiert bereits eine aktive Anfrage für dieses Profil.')
        } else {
          throw insErr
        }
      } else {
        setMessage('Anfrage gesendet. Ein Admin/SuperUser kann jetzt bestätigen.')
      }

      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function cancelMyClaim(profileId: number) {
    setError(''); setMessage('')
    const myClaim = claims[profileId]
    if (!myClaim || myClaim.status !== 'pending') {
      setError('Es gibt keine wartende Anfrage zum Zurückziehen.')
      return
    }
    try {
      const { error: upErr } = await supabase
        .from('profile_claims')
        .update({ status: 'cancelled' })
        .eq('id', myClaim.id)
      if (upErr) throw upErr
      setMessage('Anfrage zurückgezogen.')
      await loadData()
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ ...type.body, marginTop: 6 }}>Lade verfügbare Profile…</Text>
      </View>
    )
  }

  const anyRows = rows && rows.length > 0

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        // Padding unten angepasst, da keine BottomNav mehr
        style={{ marginBottom: insets.bottom }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        persistentScrollbar
        indicatorStyle="white"
        showsVerticalScrollIndicator
      >
        <Text style={type.h1}>Profil verknüpfen</Text>
        <Text style={{ ...type.body, color: '#bfbfbf' }}>
          Dein Google-Login war erfolgreich, aber noch keinem Stammtisch-Profil zugeordnet. Bitte wähle dein Profil:
        </Text>

        {!anyRows && (
          <View
            style={{
              padding: 12,
              borderRadius: radius.md,
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={type.body}>
              Es sind keine freien Profile sichtbar. Bitte Admin kontaktieren.
            </Text>
          </View>
        )}

        {rows.map((r) => {
          const avatar = publicUrlFor(r.avatar_url)
          const chosen = selectedId === r.id
          const badge = badgeFor(r)
          const disabled = disableSelect(r)
          const myClaim = claims[r.id]

          return (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.8}
              onPress={() => !disabled && setSelectedId(r.id)}
              style={{
                padding: 12,
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 2,
                borderColor: chosen ? colors.gold : colors.border,
                opacity: disabled ? 0.7 : 1,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.border }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56, height: 56, borderRadius: 28,
                      backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: colors.border
                    }}
                  >
                    <Text style={type.caption}>kein Foto</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={type.h2}>{displayName(r) || 'Ohne Namen'}</Text>
                  {r.title ? <Text style={{ ...type.body, color: '#bfbfbf' }}>{r.title}</Text> : null}
                  {r.quote ? <Text style={{ ...type.caption, color: '#9aa0a6', marginTop: 2 }}>"{r.quote}"</Text> : null}
                  <Text style={{ ...type.caption, marginTop: 4 }}>{badge}</Text>
                </View>
              </View>

              <View style={{ marginTop: 8, gap: 8 }}>
                <Button
                  title={disabled ? 'Nicht verfügbar' : (chosen ? 'Ausgewählt' : 'Dieses Profil wählen')}
                  onPress={() => !disabled && setSelectedId(r.id)}
                  disabled={disabled}
                />
                {myClaim?.status === 'pending' && (
                  <Button
                    title="Anfrage zurückziehen"
                    onPress={() =>
                      Alert.alert('Zurückziehen?', 'Willst du die Anfrage wirklich zurückziehen?', [
                        { text: 'Abbrechen', style: 'cancel' },
                        { text: 'Ja', onPress: () => cancelMyClaim(r.id) },
                      ])
                    }
                  />
                )}
              </View>
            </TouchableOpacity>
          )
        })}

        <View style={{ gap: 10, marginTop: 8, marginBottom: 20 }}>
          <Button
            title={submitting ? 'Sende Anfrage…' : 'Anfrage zur Verknüpfung senden'}
            onPress={submitClaim}
            disabled={submitting || !selectedId}
          />
          {/* Geändert: Abmelden statt Zurück */}
          <Button title="Abmelden (Anderes Konto)" onPress={handleLogout} color={colors.red || 'red'} />
        </View>

        {message ? <Text style={{ ...type.body, color: colors.gold }}>{message}</Text> : null}
        {error ? <Text style={{ ...type.body, color: colors.red }}>{error}</Text> : null}
      </ScrollView>

      {/* Keine BottomNav hier! */}
    </View>
  )
}