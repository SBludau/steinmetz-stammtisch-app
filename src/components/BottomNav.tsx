import { View, Image, Pressable, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// PNGs (96x96)
const ICON_START = require('../../assets/nav/startseite.png')
const ICON_NEW   = require('../../assets/nav/neuer_stammtisch.png')
const ICON_STATS = require('../../assets/nav/statistiken.png')
const ICON_HOF   = require('../../assets/nav/hallo_of_fame.png')

// Feste Basis-Höhe der Leiste (ohne Safe-Area)
export const NAV_BAR_BASE_HEIGHT = 88

export default function BottomNav() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const totalHeight = NAV_BAR_BASE_HEIGHT + insets.bottom

  return (
    <View
      style={[
        styles.wrap,
        {
          height: totalHeight,
          paddingBottom: insets.bottom, // Abstand nach unten (Gestenleiste)
        },
      ]}
    >
      <Pressable
        style={styles.btn}
        onPress={() => router.replace('/')}
        accessibilityRole="button"
        accessibilityLabel="Startseite"
      >
        <Image source={ICON_START} style={styles.icon} resizeMode="contain" />
      </Pressable>

      <Pressable
        style={styles.btn}
        onPress={() => router.replace('/new_stammtisch')}
        accessibilityRole="button"
        accessibilityLabel="Neuer Stammtisch"
      >
        <Image source={ICON_NEW} style={styles.icon} resizeMode="contain" />
      </Pressable>

      {/* Statistiken */}
      <Pressable
        style={styles.btn}
        onPress={() => router.replace('/stats')}
        accessibilityRole="button"
        accessibilityLabel="Statistiken"
      >
        <Image source={ICON_STATS} style={styles.icon} resizeMode="contain" />
      </Pressable>

      {/* Hall of Fame (jetzt aktiv) */}
      <Pressable
        style={styles.btn}
        onPress={() => router.replace('/hall_of_fame')}
        accessibilityRole="button"
        accessibilityLabel="Hall of Fame"
      >
        <Image source={ICON_HOF} style={styles.icon} resizeMode="contain" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',     // schwarze Leiste
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,              // Innenabstand oben (Icons ragen nicht heraus)
    ...Platform.select({
      web: { boxShadow: '0 -4px 14px rgba(0,0,0,0.25)' as any },
      default: { elevation: 14 },
    }),
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  icon: {
    width: '58%',                // skaliert responsiv
    aspectRatio: 1,
  },
})
