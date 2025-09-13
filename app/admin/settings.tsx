// app/admin/settings.tsx
import { useEffect, useState, useCallback } from 'react'
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../src/lib/supabase'
import { colors, radius } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

type StatusKind = 'success' | 'error' | 'info'

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [amountStr, setAmountStr] = useState('1500')
  const [dateStr, setDateStr] = useState('2025-08-01')

  // Immer sichtbare Statusleiste
  const [status, setStatus] = useState<{ kind: StatusKind; text: string } | null>(null)
  const showStatus = useCallback((kind: StatusKind, text: string) => setStatus({ kind, text }), [])

  // --- Session prüfen & Hinweis anzeigen, aber NICHT aussperren ---
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user ?? null
      if (!user) { router.replace('/login'); return }
      const uid = user.id
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('auth_user_id', uid)
        .maybeSingle()
      if (!active) return
      if (!prof?.is_admin) {
        // Kein harter Block – nur Info.
        showStatus('info', 'Hinweis: Du bist in profiles nicht als Admin markiert. Speichern erfolgt ggf. per Admin-RPC.')
      }
    })()
    return () => { active = false }
  }, [router, showStatus])

  // Settings laden (lesen sollte für authenticated erlaubt sein)
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'vegas')
        .maybeSingle()
      if (error) throw error

      if (data?.value) {
        if (typeof data.value.start_amount !== 'undefined') setAmountStr(String(data.value.start_amount))
        if (typeof data.value.start_date === 'string') setDateStr(data.value.start_date)
      }
      showStatus('info', 'Einstellungen aktualisiert.')
    } catch (e: any) {
      const msg = e?.message ?? String(e)
      showStatus('error', `Konnte Einstellungen nicht laden: ${msg}`)
      Alert.alert('Fehler', `Konnte Einstellungen nicht laden.\n${msg}`)
    } finally {
      setLoading(false)
    }
  }, [showStatus])

  useEffect(() => { loadSettings() }, [loadSettings])
  useFocusEffect(useCallback(() => { loadSettings() }, [loadSettings]))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadSettings()
    setRefreshing(false)
  }, [loadSettings])

  // Speichern: zuerst Upsert (falls Admin-Policy greift), sonst RPC-Fallback (Security Definer)
  const save = useCallback(async () => {
    const amt = Number(amountStr.replace(',', '.'))
    if (Number.isNaN(amt)) {
      showStatus('error', 'Ungültiger Betrag (z. B. 1500).')
      Alert.alert('Ungültiger Betrag', 'Bitte eine Zahl eingeben (z.B. 1500).')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      showStatus('error', 'Ungültiges Datum (Format JJJJ-MM-TT).')
      Alert.alert('Ungültiges Datum', 'Bitte im Format JJJJ-MM-TT eingeben (z.B. 2025-08-01).')
      return
    }

    const payload = { key: 'vegas', value: { start_amount: amt, start_date: dateStr } }

    try {
      setLoading(true)

      // 1) Normaler Upsert (für echte Admins, wenn RLS es erlaubt)
      const { error } = await supabase
        .from('app_settings')
        .upsert(payload, { onConflict: 'key' })

      if (error) {
        // 2) Fallback: Security-Definer RPC (vorher in der DB angelegt)
        const { error: rpcErr } = await supabase.rpc('set_vegas_settings_bootstrap', {
          p_start_amount: amt,
          p_start_date: dateStr
        })
        if (rpcErr) {
          const msg = rpcErr?.message ?? String(rpcErr)
          showStatus('error', `Speichern nicht möglich: ${msg}`)
          Alert.alert('Fehler', `Speichern nicht möglich.\n${msg}`)
          return
        }
      }

      showStatus('success', 'Einstellungen wurden gespeichert.')
      // sofort neu laden, damit neue Werte sichtbar sind
      await loadSettings()
      // Optional: harter Remount (deaktiviert, um Meldung sichtbar zu lassen)
      // router.replace({ pathname: '/admin/settings', params: { ts: String(Date.now()) } })
    } catch (e: any) {
      const msg = e?.message ?? String(e)
      showStatus('error', `Speichern nicht möglich: ${msg}`)
      Alert.alert('Fehler', `Speichern nicht möglich.\n${msg}`)
    } finally {
      setLoading(false)
    }
  }, [amountStr, dateStr, loadSettings, showStatus])

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 12,
        paddingHorizontal: 12,
        paddingBottom: insets.bottom + 24,
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={{
          borderRadius: radius.md,
          backgroundColor: colors.cardBg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          gap: 12,
        }}
      >
        <Text style={type.h2}>Admin · Einstellungen</Text>

        {/* Statusleiste – immer an derselben Stelle */}
        {status && (
          <View style={{
            borderWidth: 1,
            borderColor: status.kind === 'success' ? '#2e7d32' : status.kind === 'error' ? '#c62828' : colors.border,
            backgroundColor: status.kind === 'success' ? '#e8f5e9' : status.kind === 'error' ? '#ffebee' : colors.cardBg,
            borderRadius: radius.md,
            padding: 8
          }}>
            <Text style={type.caption}>{status.text}</Text>
          </View>
        )}

        <View style={{ gap: 6 }}>
          <Text style={type.caption}>Startbetrag (EUR)</Text>
          <TextInput
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="decimal-pad"
            placeholder="1500"
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, color: colors.text, backgroundColor: colors.bg
            }}
            editable={!loading}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={type.caption}>Startdatum (JJJJ-MM-TT)</Text>
          <TextInput
            value={dateStr}
            onChangeText={setDateStr}
            placeholder="2025-08-01"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
              padding: 10, color: colors.text, backgroundColor: colors.bg
            }}
            editable={!loading}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pressable
            onPress={save}
            disabled={loading}
            style={{
              paddingVertical: 10, paddingHorizontal: 16,
              borderRadius: radius.md,
              backgroundColor: loading ? colors.border : colors.gold,
              borderWidth: 1, borderColor: colors.border,
            }}
          >
            <Text style={[type.body, { color: colors.bg }]}>{loading ? 'Speichern…' : 'Speichern'}</Text>
          </Pressable>

          {/* Startseite-Button über Link (gruppensicher, funktioniert in Web & App) */}
          <Link href="/" asChild>
            <Pressable
              style={{
                paddingVertical: 10, paddingHorizontal: 16,
                borderRadius: radius.md,
                backgroundColor: colors.cardBg,
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Text style={type.body}>Zur Startseite</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  )
}
