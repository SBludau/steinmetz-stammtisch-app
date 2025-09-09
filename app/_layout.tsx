// app/_layout.tsx
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../src/theme/colors'
import './global.css'

export default function RootLayout() {
  const [loaded] = useFonts({
    Broadway: require('../assets/fonts/BROADW.ttf'), // <- exakter Pfad + Dateiname
  })

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
