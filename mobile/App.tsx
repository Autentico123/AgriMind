/**
 * Design-system smoke surface for the farmer app.
 *
 * Screens are added in later phases. This renders every component so the tokens
 * and states can be checked on a device against `docs/design-system.md` and the
 * approved `prototype/`.
 */

import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardLabel,
  CardTitle,
  EmptyState,
  ErrorState,
  OfflineBanner,
  StatRow,
  StatTile,
  TextField,
} from './components';
import { colors, spacing, typography } from './theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>AgriMind</Text>
          <Text style={styles.subtitle}>
            Weather-aware farm decision support
          </Text>

          <OfflineBanner lastSyncedAt="8:00 AM" />

          <Text style={styles.sectionTitle}>Buttons</Text>
          <View style={styles.stack}>
            <Button label="Primary" onPress={() => {}} />
            <Button label="Get AI Advice" variant="gold" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Ask AI" variant="ai" onPress={() => {}} />
            <Button label="Refresh Forecast" variant="weather" onPress={() => {}} />
            <Button label="Delete" variant="danger" onPress={() => {}} />
            <Button label="Saving" loading onPress={() => {}} />
            <Button label="Disabled" disabled onPress={() => {}} />
          </View>

          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.row}>
            <Badge label="Growing" variant="green" />
            <Badge label="At Risk" variant="amber" />
            <Badge label="High risk" variant="red" />
            <Badge label="AI" variant="violet" />
            <Badge label="Weather" variant="blue" />
            <Badge label="Harvested" variant="gray" />
          </View>

          <Text style={styles.sectionTitle}>Cards</Text>
          <View style={styles.stack}>
            <Card>
              <CardLabel>Farm</CardLabel>
              <CardTitle>North Farm</CardTitle>
              <CardBody>Bien Unido, Bohol · 2.5 ha · 3 crops</CardBody>
            </Card>
            <Card variant="weather">
              <CardLabel tone="weather">Weather</CardLabel>
              <CardTitle>29°C · Rainy</CardTitle>
              <CardBody>Rain 85% · Humidity 88% · Wind 18 km/h</CardBody>
            </Card>
            <Card variant="ai">
              <CardLabel tone="ai">AI Recommendation</CardLabel>
              <CardBody>
                Rain is expected tomorrow. Skip irrigation today and monitor soil
                moisture after rainfall.
              </CardBody>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Stat tiles</Text>
          <StatRow>
            <StatTile variant="weather" value="85%" label="Rain" />
            <StatTile variant="weather" value="88%" label="Humidity" />
            <StatTile variant="weather" value="18" label="Wind" />
          </StatRow>

          <Text style={styles.sectionTitle}>Form</Text>
          <View style={styles.stack}>
            <TextField label="Farm Name" placeholder="e.g. North Farm" />
            <TextField
              label="Email"
              placeholder="you@email.com"
              error="Enter a valid email address."
            />
            <TextField
              label="Phone"
              placeholder="09xx xxx xxxx"
              optional
              hint="Optional. Used only for account recovery."
            />
          </View>

          <Text style={styles.sectionTitle}>States</Text>
          <EmptyState
            title="No farms yet. Add your first farm to get started."
            actionLabel="Add Farm"
            onAction={() => {}}
          />
          <ErrorState onRetry={() => {}} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dew },
  content: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
    gap: spacing.space3,
  },
  pageTitle: {
    fontSize: typography.pageTitle.fontSize,
    fontWeight: '700',
    color: colors.forestDeep,
    lineHeight: typography.pageTitle.lineHeight,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.stone,
    marginBottom: spacing.space2,
  },
  sectionTitle: {
    fontSize: typography.sectionTitle.fontSize,
    fontWeight: '700',
    color: colors.forestDeep,
    marginTop: spacing.space4,
  },
  stack: { gap: spacing.space3 },
  row: { flexDirection: 'row', gap: spacing.space2, flexWrap: 'wrap' },
});
