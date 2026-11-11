/**
 * Form input per `docs/design-system.md` §6.6.
 *
 * Default border `1.5px #d1fae5`, focused `1.5px #2d6a4f`, error
 * `1.5px #dc2626` with a 12px message. Label is 12px Inter 600.
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, radius, spacing, typography, MIN_TOUCH_TARGET } from '../theme';

export interface TextFieldProps extends TextInputProps {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
}

export function TextField({
  label,
  optional = false,
  error,
  hint,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.forest
      : colors.mist;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}> optional</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: rest.editable === false }}
        style={[
          styles.input,
          { borderColor },
          rest.multiline && styles.multiline,
          style,
        ]}
        placeholderTextColor={colors.subtle}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.space1, width: '100%' },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optional: { fontWeight: '400', color: colors.subtle },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.base,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: typography.body.fontSize,
    color: colors.forestDeep,
    backgroundColor: colors.white,
    minHeight: MIN_TOUCH_TARGET,
  },
  multiline: { minHeight: MIN_TOUCH_TARGET * 2, textAlignVertical: 'top' },
  error: { fontSize: 12, color: colors.danger },
  hint: { fontSize: 12, color: colors.subtle },
});
