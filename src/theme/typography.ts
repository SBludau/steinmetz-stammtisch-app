// src/theme/typography.ts
import { Platform } from 'react-native'
import { colors } from './colors'

// Plattform-sicheres Basis-Font (ohne eigene Dateien)
export const fonts = {
  base: Platform.select({
    ios: 'Verdana',     // iOS hat Verdana vorinstalliert
    web: 'Verdana',     // Web meist vorhanden; sonst Browser-Fallback
    android: 'sans-serif', // Android-Standardschrift (kompatibel)
    default: undefined, // fällt auf Systemsans zurück
  }),
}

export const type = {
  // Überschriften (gleiches Font, einfach größer & fetter)
  h1: { fontFamily: fonts.base, fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.gold },
  h2: { fontFamily: fonts.base, fontSize: 22, lineHeight: 28, fontWeight: '700', color: colors.gold },

  // Standard-Text
  body: { fontFamily: fonts.base, fontSize: 16, lineHeight: 22, fontWeight: '400', color: colors.text },
  bodyMuted: { fontFamily: fonts.base, fontSize: 14, lineHeight: 20, fontWeight: '400', color: '#FFFFFF99' },

  // Buttons: etwas fetter
  button: { fontFamily: fonts.base, fontSize: 16, lineHeight: 22, fontWeight: '600', color: colors.text },

  // Kleintext
  caption: { fontFamily: fonts.base, fontSize: 12, lineHeight: 16, fontWeight: '400', color: '#FFFFFF99' },
}
