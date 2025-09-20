// tamagui.config.ts
import { createTamagui, createTokens } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'

const brandTokens = createTokens({
  color: {
    primary: '#2EC4B6',
    secondary: '#FF6B6B',
    success: '#55D187',
    warning: '#FFB347',

    backgroundLight: '#F9FAFB',
    surfaceLight: '#FFFFFF',
    textLight: '#1E293B',
    textMutedLight: '#64748B',

    backgroundDark: '#0D1B2A',
    surfaceDark: '#1E293B',
    textDark: '#E2E8F0',
    textMutedDark: '#94A3B8',
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 32,
  },

  // ✅ Add "true" baseline
  space: {
    ...defaultConfig.tokens.space,
    true: 16, // default spacing unit
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // ✅ Add "true" baseline
  size: {
    ...defaultConfig.tokens.size,
    true: 48, // default control size
    sm: 36,
    md: 48,
    lg: 64,
  },
})

export const config = createTamagui({
  ...defaultConfig,

  tokens: {
    ...defaultConfig.tokens,
    ...brandTokens,
  },

  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      bg: brandTokens.color.backgroundLight,
      card: brandTokens.color.surfaceLight,
      color: brandTokens.color.textLight,
      muted: brandTokens.color.textMutedLight,
      primary: brandTokens.color.primary,
      secondary: brandTokens.color.secondary,
    },
    dark: {
      ...defaultConfig.themes.dark,
      bg: brandTokens.color.backgroundDark,
      card: brandTokens.color.surfaceDark,
      color: brandTokens.color.textDark,
      muted: brandTokens.color.textMutedDark,
      primary: brandTokens.color.primary,
      secondary: '#FF8A8A',
    },
  },
})

export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
