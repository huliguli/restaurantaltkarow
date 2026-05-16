type Props = {
  rows: { key: string; count: number }[];
  emptyLabel?: string;
};

/**
 * Schlanke horizontale Balkenliste — kein externes Chart-Lib.
 * Skaliert relativ zum größten Wert.
 */
export function BarRow({ rows, emptyLabel = "Keine Daten" }: Props) {
  if (rows.length === 0)
    return <p className="text-ink-soft italic text-sm">{emptyLabel}</p>;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const pct = Math.round((r.count / max) * 100);
        return (
          <li key={r.key} className="text-sm">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span
                className="text-ink-strong truncate"
                style={{ fontWeight: 500 }}
                title={r.key}
              >
                {r.key}
              </span>
              <span
                className="text-muted tabular-nums shrink-0"
                style={{ fontWeight: 600 }}
              >
                {r.count.toLocaleString("de-DE")}
              </span>
            </div>
            <div className="h-1.5 bg-paper-deep/60 rounded-sm overflow-hidden">
              <div
                className="h-full bg-burgundy"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
