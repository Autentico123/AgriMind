/**
 * Stat tile per `docs/design-system.md` §6.3.
 */

export interface StatTileProps {
  value: string | number;
  label: string;
}

export function StatTile({ value, label }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__label">{label}</span>
    </div>
  );
}
