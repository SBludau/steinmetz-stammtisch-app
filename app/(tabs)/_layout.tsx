// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // native Tab-Bar ausblenden
      }}
      // optional: initialRouteName="index"
    >
      {/* Nur echte Tab-Routen hier aufführen (ohne Login) */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="new_stammtisch" />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}
