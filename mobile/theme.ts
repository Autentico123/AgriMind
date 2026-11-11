/**
 * Design tokens for the farmer mobile app.
 *
 * Source: `docs/design-system.md` §10 (mobile `theme.ts`). Values are copied
 * verbatim — do not adjust them here; change the spec first.
 */

export const colors = {
  forestDeep: '#1b4332',
  forest: '#2d6a4f',
  leaf: '#52b788',
  mint: '#95d5b2',
  mist: '#d1fae5',
  dew: '#f0f7ee',
  gold: '#e9b84a',
  goldDeep: '#b45309',
  goldLight: '#fffbf0',
  goldBorder: '#f0d080',
  sky: '#0ea5e9',
  skyMid: '#7dd3fc',
  skyLight: '#e0f2fe',
  violet: '#7c3aed',
  violetMid: '#a78bfa',
  violetLight: '#ede9fe',
  amber: '#f4a261',
  amberDeep: '#d97706',
  amberLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  textPrimary: '#1b4332',
  textSecondary: '#374151',
  stone: '#6b7280',
  subtle: '#9ca3af',
  white: '#ffffff',
  bgGray: '#f3f4f6',
} as const;

export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space12: 48,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  stat: 6,
  base: 8,
  modal: 12,
  full: 9999,
} as const;

/**
 * Typography scale from `docs/design-system.md` §2. Inter is the only
 * typeface; weights 400 / 500 / 600 / 700.
 */
export const typography = {
  pageTitle: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  sectionTitle: { fontSize: 22, fontWeight: '700', lineHeight: 29 },
  cardTitle: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stat: { fontSize: 36, fontWeight: '700', lineHeight: 36 },
  statSmall: { fontSize: 22, fontWeight: '700', lineHeight: 22 },
} as const;

/**
 * Border and elevation rules from `docs/design-system.md` §5. The system is
 * flat: borders carry the structure, and only modals and bottom sheets raise.
 */
export const borders = {
  card: { borderWidth: 1.5, borderColor: colors.mist },
  weatherCard: { borderWidth: 1.5, borderColor: colors.skyMid },
  aiCard: { borderWidth: 1.5, borderColor: colors.violetMid, borderLeftWidth: 4, borderLeftColor: colors.violet },
  input: { borderWidth: 1.5, borderColor: colors.mist },
  inputFocused: { borderWidth: 1.5, borderColor: colors.forest },
  inputError: { borderWidth: 1.5, borderColor: colors.danger },
  statTile: { borderWidth: 1, borderColor: colors.skyMid },
} as const;

/** Minimum touch target from `docs/design-system.md` §11. */
export const MIN_TOUCH_TARGET = 44;

/** Literal state copy from `docs/design-system.md` §9. Do not paraphrase. */
export const copy = {
  emptyFarms: 'No farms yet. Add your first farm to get started.',
  emptyRecommendation: 'No recommendation yet. Weather data is being fetched.',
  offline: "You're offline. Showing cached data.",
  lowConfidence: 'Limited data — consult a local agriculturist.',
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  borders,
  copy,
  minTouchTarget: MIN_TOUCH_TARGET,
} as const;

export type Theme = typeof theme;
