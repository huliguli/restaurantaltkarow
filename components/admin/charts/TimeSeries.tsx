type Point = {
  date: string;
  visits: number;
  pageviews: number;
  uniqueVisitors: number;
};

/**
 * SVG-Sparkline für tägliche Zeitserie.
 * Zwei Linien: Visits (burgundy) + Pageviews (gold).
 */
export function TimeSeries({
  points,
  height = 160,
}: {
  points: Point[];
  height?: number;
}) {
  if (points.length === 0) {
    return <p className="text-ink-soft italic text-sm">Keine Daten</p>;
  }

  const width = 1000;
  const padX = 24;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const maxY = Math.max(
    ...points.map((p) => Math.max(p.visits, p.pageviews)),
    1,
  );

  const xStep = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const px = (i: number) => padX + i * xStep;
  const py = (v: number) => padY + innerH - (v / maxY) * innerH;

  const pathVisits = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.visits)}`)
    .join(" ");
  const pathPv = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(p.pageviews)}`)
    .join(" ");

  const areaVisits =
    pathVisits +
    ` L ${px(points.length - 1)} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-40 sm:h-52"
        aria-label="Tägliche Zugriffe"
      >
        <path d={areaVisits} fill="rgba(110, 31, 36, 0.12)" />
        <path d={pathVisits} fill="none" stroke="#6e1f24" strokeWidth="2" />
        <path
          d={pathPv}
          fill="none"
          stroke="#c19a3a"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {points.map((p, i) => (
          <circle key={p.date} cx={px(i)} cy={py(p.visits)} r="2.5" fill="#6e1f24" />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span>
          <span
            className="inline-block w-3 h-3 align-middle mr-1.5"
            style={{ background: "#6e1f24" }}
          />
          Sessions
        </span>
        <span>
          <span
            className="inline-block w-3 h-3 align-middle mr-1.5 border-t-2 border-dashed"
            style={{ borderColor: "#c19a3a" }}
          />
          Pageviews
        </span>
      </div>
    </div>
  );
}
