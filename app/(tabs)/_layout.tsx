import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // native Tab-Bar ausblenden
      }}
    >
      {/* Routen bleiben erreichbar */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="new_stammtisch" />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}
