type Props = {
  hours: { hour: number; count: number }[];
};

export function HourHeatmap({ hours }: Props) {
  const max = Math.max(...hours.map((h) => h.count), 1);
  return (
    <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
      {hours.map((h) => {
        const intensity = h.count / max;
        const bg = intensity > 0
          ? `rgba(110, 31, 36, ${Math.max(0.08, intensity).toFixed(2)})`
          : "rgba(15, 8, 4, 0.05)";
        return (
          <div
            key={h.hour}
            className="aspect-square flex items-center justify-center text-[0.6rem] tabular-nums rounded-sm"
            style={{
              background: bg,
              color:
                intensity > 0.5
                  ? "var(--color-paper)"
                  : "var(--color-ink-soft)",
            }}
            title={`${h.hour}:00 — ${h.count} Sessions`}
          >
            {h.hour}
          </div>
        );
      })}
    </div>
  );
}
