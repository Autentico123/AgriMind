/**
 * Buttons per `docs/design-system.md` §6.1.
 *
 * Variants map to the documented set: primary (forest), gold (second primary),
 * secondary (outline), ai (violet), weather (sky), danger (outline), ghost.
 */

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import { colors, radius, typography, MIN_TOUCH_TARGET } from '../theme';

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'secondary'
  | 'ai'
  | 'weather'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'standard' | 'small';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const BACKGROUND: Record<ButtonVariant, string> = {
  primary: colors.forest,
  gold: colors.gold,
  secondary: colors.white,
  ai: colors.violet,
  weather: colors.sky,
  danger: colors.white,
  ghost: 'transparent',
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.white,
  gold: colors.white,
  secondary: colors.forest,
  ai: colors.white,
  weather: colors.white,
  danger: colors.danger,
  ghost: colors.leaf,
};

export function Button({
  label,
  variant = 'primary',
  size = 'standard',
  block = false,
  loading = false,
  disabled = false,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const outlined = variant === 'secondary' || variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'small' ? styles.small : styles.standard,
        block && styles.block,
        { backgroundColor: BACKGROUND[variant] },
        outlined && { borderWidth: 1.5, borderColor: TEXT_COLOR[variant] },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={TEXT_COLOR[variant]}
            accessibilityLabel={`${label}, loading`}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            size === 'small' && styles.labelSmall,
            { color: TEXT_COLOR[variant] },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.base,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  standard: { paddingVertical: 12, paddingHorizontal: 20 },
  small: { paddingVertical: 8, paddingHorizontal: 14 },
  block: { width: '100%' },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.4 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    lineHeight: typography.body.lineHeight,
  },
  labelSmall: { fontSize: typography.bodySmall.fontSize },
});
