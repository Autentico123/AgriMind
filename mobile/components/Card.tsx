/**
 * Card surfaces per `docs/design-system.md` §6.2 and §5.
 *
 * Farm and crop cards are white with a mist border; weather cards are sky;
 * AI recommendation cards are violet with a 4px left rail. None of them raise —
 * only modals carry a shadow.
 */

import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export type CardVariant = 'farm' | 'weather' | 'ai';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ variant = 'farm', style, ...rest }: CardProps) {
  return <View style={[styles.base, VARIANT_STYLE[variant], style]} {...rest} />;
}

/** Small uppercase label used on weather and AI cards (§2). */
export function CardLabel({
  children,
  tone = 'green',
}: {
  children: string;
  tone?: 'green' | 'weather' | 'ai';
}) {
  const color =
    tone === 'weather'
      ? colors.sky
      : tone === 'ai'
        ? colors.violetMid
        : colors.leaf;

  return <Text style={[styles.label, { color }]}>{children}</Text>;
}

export function CardTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardBody({ children }: { children: string }) {
  return <Text style={styles.body}>{children}</Text>;
}

const VARIANT_STYLE = StyleSheet.create({
  farm: {
    backgroundColor: colors.white,
    borderColor: colors.mist,
  },
  weather: {
    backgroundColor: colors.skyLight,
    borderColor: colors.skyMid,
  },
  ai: {
    backgroundColor: colors.violetLight,
    borderColor: colors.violetMid,
    borderLeftWidth: 4,
    borderLeftColor: colors.violet,
  },
});

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: radius.base,
    padding: spacing.space4,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: '600',
    letterSpacing: typography.label.letterSpacing,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.cardTitle.fontSize,
    fontWeight: '600',
    color: colors.forestDeep,
    lineHeight: typography.cardTitle.lineHeight,
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19.5,
  },
});
