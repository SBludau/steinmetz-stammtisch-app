// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // native Tab-Bar ausblenden
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="new_stammtisch" />
      {/* Detail-/Edit-Seite ohne Tab-Eintrag */}
      <Tabs.Screen name="stammtisch/[id]" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />

      {/* Neu: Statistiken */}
      <Tabs.Screen name="stats" />
    </Tabs>
  )
}
