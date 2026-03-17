// app/_layout.tsx
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../src/theme/colors'
import './global.css'
import * as WebBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates'

// sorgt dafür, dass Auth-Session nach Redirects sauber abgeschlossen wird
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [loaded] = useFonts({
    Broadway: require('../assets/fonts/BROADW.ttf'), // <- exakter Pfad + Dateiname
  })

  // OTA-Update-Check beim App-Start (nur in produktiven APKs, nicht im Emulator)
  useEffect(() => {
    if (__DEV__) return
    async function checkForUpdate() {
      try {
        const check = await Updates.checkForUpdateAsync()
        if (!check.isAvailable) return
        await Updates.fetchUpdateAsync()
        Alert.alert(
          'Update verfügbar 🎉',
          'Eine neue Version der MetzÄpp wurde geladen. Jetzt neu starten?',
          [
            { text: 'Später', style: 'cancel' },
            { text: 'Jetzt neu starten', onPress: () => Updates.reloadAsync() },
          ]
        )
      } catch {
        // Kein Update verfügbar oder kein Netz — leise ignorieren
      }
    }
    checkForUpdate()
  }, [])

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </>
  )
}
