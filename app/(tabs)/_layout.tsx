// app/(tabs)/_layout.tsx
import React from 'react'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      initialRouteName="index"
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
      <Tabs.Screen name="profile" />

      {/* Neu: Statistiken & Hall of Fame */}
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="hall_of_fame" />
    </Tabs>
  )
}
