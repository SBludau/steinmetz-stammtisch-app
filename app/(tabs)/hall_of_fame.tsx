// app/(tabs)/hall_of_fame.tsx
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomNav, { NAV_BAR_BASE_HEIGHT } from '../../src/components/BottomNav'
import { colors } from '../../src/theme/colors'
import { type } from '../../src/theme/typography'

export default function HallOfFameScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 12,
          paddingBottom: NAV_BAR_BASE_HEIGHT + insets.bottom + 24,
        }}
      >
        <Text style={type.h1}>Hall of Fame</Text>
        <Text style={{ ...type.body, marginTop: 8 }}>
          Minimaler Start – hier kommen später die Legenden hin. 🏅
        </Text>

        <View style={{
          marginTop: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.cardBg,
          borderRadius: 12
        }}>
          <Text style={type.body}>⭐ Platzhalter</Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}
