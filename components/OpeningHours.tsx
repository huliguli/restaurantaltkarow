import { siteConfig } from "@/lib/siteConfig";

type Props = {
  tone?: "dark" | "light";
};

export function OpeningHours({ tone = "dark" }: Props) {
  // tone "light" = auf dunklem Hintergrund, "dark" = auf hellem Hintergrund
  const text = tone === "light" ? "text-paper" : "text-ink-strong";
  const accent = tone === "light" ? "text-gold-soft" : "text-burgundy";
  const sub = tone === "light" ? "text-cream-soft" : "text-muted";
  const border = tone === "light" ? "border-paper/20" : "border-ink/15";

  return (
    <ul className={`space-y-3 ${text}`}>
      {siteConfig.hours.map((h) => (
        <li
          key={h.day}
          className={`group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b ${border} pb-3 transition-colors duration-300`}
        >
          <span className="font-serif text-lg" style={{ fontWeight: 600 }}>
            {h.day}
          </span>
          <span
            className={`font-serif text-lg tracking-wide tabular-nums ${accent}`}
            style={{ fontWeight: 600 }}
          >
            {h.time}
          </span>
          {h.note ? (
            <span className={`basis-full text-xs italic ${sub}`}>{h.note}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
