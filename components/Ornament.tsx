type OrnamentProps = {
  className?: string;
  tone?: "gold" | "ink" | "cream";
};

export function Ornament({ className = "", tone = "gold" }: OrnamentProps) {
  const stroke =
    tone === "gold" ? "#b08a3e" : tone === "cream" ? "#f7efdf" : "#2a1f17";
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <span
        className="h-px w-16 sm:w-24"
        style={{ background: stroke, opacity: 0.5 }}
      />
      <svg
        width="36"
        height="14"
        viewBox="0 0 36 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 7 H10 M26 7 H34"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M18 1 L22 7 L18 13 L14 7 Z"
          stroke={stroke}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="18" cy="7" r="1.2" fill={stroke} />
      </svg>
      <span
        className="h-px w-16 sm:w-24"
        style={{ background: stroke, opacity: 0.5 }}
      />
    </div>
  );
}
