import { colors } from './colors'

/**
 * Fonts:
 * - Überschriften/Highlights: BROADW.TTF  -> Family-Name "Broadway"
 * - Fließtext/Buttons: System-Sans (kein fontFamily gesetzt = iOS/Android/Web Standard)
 */
export const fonts = {
  heading: 'Broadway', // muss in app/_layout.tsx mit genau diesem Namen via useFonts geladen werden
}

export const type = {
  // Überschriften in Gold, Broadway
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: colors.gold },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28, color: colors.gold },

  // Standard-Text: System-Sans (Arial/Roboto/SF – je nach Plattform)
  body: { fontSize: 16, lineHeight: 22, color: colors.text },
  bodyMuted: { fontSize: 14, lineHeight: 20, color: '#FFFFFF99' },

  // Buttons: System-Sans, etwas fetter
  button: { fontSize: 16, fontWeight: '600', color: colors.text },

  // Kleintext (optional)
  caption: { fontSize: 12, lineHeight: 16, color: '#FFFFFF99' },
}
