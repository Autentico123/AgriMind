/**
 * Admin dashboard shell.
 *
 * Online-only and English-only (`docs/project-overview.md`). Screens are added
 * in later phases; this is the design-system smoke surface.
 */

import { Badge, Button, Card, StatTile } from './components';

export default function App() {
  return (
    <main style={{ padding: 'var(--space-8)', maxWidth: 1200, margin: '0 auto' }}>
      <h1>AgriMind Admin</h1>
      <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
        Agricultural administration console.
      </p>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-8)',
        }}
      >
        <StatTile value="0" label="Farmers" />
        <StatTile value="0" label="Farms" />
        <StatTile value="0" label="Crops" />
        <StatTile value="0" label="Alerts" />
      </section>

      <section
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-8)',
        }}
      >
        <Card label="Design system" title="Components">
          Buttons, badges, cards, tiles, and form fields are available from
          <code> src/components</code>.
        </Card>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="gold">Get AI Advice</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Badge variant="green">Growing</Badge>
          <Badge variant="amber">At Risk</Badge>
          <Badge variant="red">High risk</Badge>
          <Badge variant="violet">AI</Badge>
          <Badge variant="blue">Weather</Badge>
          <Badge variant="gray">Harvested</Badge>
        </div>
      </section>
    </main>
  );
}
