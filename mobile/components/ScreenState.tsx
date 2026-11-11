/**
 * Loading, empty, error and offline states.
 *
 * Copy comes verbatim from `docs/design-system.md` §9. Loading uses shimmer
 * skeleton blocks rather than spinners, per the same section.
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { colors, radius, spacing, typography, MIN_TOUCH_TARGET } from '../theme';

/** A single shimmering skeleton block. */
export function Skeleton({
  height = 16,
  width = '100%',
}: {
  height?: number;
  width?: number | `${number}%`;
}) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.skeleton, { height, width, opacity: pulse }]}
    />
  );
}

/** Full-screen loading state built from skeleton blocks. */
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="40%" />
      <Skeleton height={72} />
      <Skeleton height={72} />
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * Error state. Messages are user-facing only — never a stack trace or internal
 * detail (§17 of AGENTS.md).
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Please try again.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label={retryLabel} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

/** Amber offline banner with the literal §9 copy. */
export function OfflineBanner({ lastSyncedAt }: { lastSyncedAt?: string }) {
  return (
    <View style={styles.offlineBanner} accessibilityRole="alert">
      <Text style={styles.offlineText}>
        {`You're offline. Showing cached data.`}
        {lastSyncedAt ? ` Last synced ${lastSyncedAt}.` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.space8,
    paddingHorizontal: spacing.space4,
    alignItems: 'center',
    gap: spacing.space2,
  },
  skeleton: {
    backgroundColor: colors.dew,
    borderRadius: radius.sm,
    marginBottom: spacing.space3,
  },
  title: {
    fontSize: typography.cardTitle.fontSize,
    fontWeight: '600',
    color: colors.forestDeep,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: typography.bodySmall.lineHeight,
  },
  action: { marginTop: spacing.space2, minWidth: MIN_TOUCH_TARGET * 3 },
  offlineBanner: {
    backgroundColor: colors.amberLight,
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radius.base,
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space3,
  },
  offlineText: {
    fontSize: typography.bodySmall.fontSize,
    color: '#92400e',
    lineHeight: typography.bodySmall.lineHeight,
  },
});
