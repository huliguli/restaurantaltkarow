import { Ornament } from "./Ornament";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "text-center mx-auto items-center"
      : "text-left mx-0 items-start";

  // tone "light" = auf dunklem Hintergrund → hellster Cremeton, starker Shadow
  // tone "dark"  = auf hellem Hintergrund  → maximal dunkler Headingstyle
  const titleColor = tone === "light" ? "text-paper" : "text-ink-strong";
  const descColor = tone === "light" ? "text-paper" : "text-ink-soft";
  const eyebrowClass =
    tone === "light" ? "label-bright" : "eyebrow";

  return (
    <div className={`flex flex-col max-w-2xl ${alignment}`}>
      {eyebrow ? (
        <p
          className={eyebrowClass}
          style={
            tone === "light"
              ? { textShadow: "0 2px 12px rgba(0,0,0,0.5)" }
              : undefined
          }
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-5 text-display text-4xl sm:text-5xl md:text-[3.4rem] ${titleColor}`}
        style={{
          fontWeight: 700,
          textShadow:
            tone === "light" ? "0 3px 18px rgba(0,0,0,0.5)" : undefined,
        }}
      >
        {title}
      </h2>
      {align === "center" ? (
        <div className="mt-7">
          <Ornament tone={tone === "light" ? "cream" : "gold"} />
        </div>
      ) : (
        <div
          className={`mt-6 h-px w-16 ${
            tone === "light" ? "bg-gold-soft" : "bg-gold"
          }`}
          aria-hidden
        />
      )}
      {description ? (
        <p
          className={`mt-7 text-lg leading-relaxed ${descColor}`}
          style={{
            fontWeight: 400,
            textShadow:
              tone === "light" ? "0 2px 14px rgba(0,0,0,0.45)" : undefined,
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
