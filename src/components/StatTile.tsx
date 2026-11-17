interface StatTileProps {
  label: string;
  value: string;
  tone?: 'default' | 'alert';
}

export function StatTile({ label, value, tone = 'default' }: StatTileProps) {
  return (
    <div className={`stat-tile stat-tile--${tone}`}>
      <dt className="stat-tile__label">{label}</dt>
      <dd className="stat-tile__value">{value}</dd>
    </div>
  );
}
