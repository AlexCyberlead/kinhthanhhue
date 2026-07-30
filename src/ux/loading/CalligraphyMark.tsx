/** Calligraphy-inspired SVG — brush seal + ink strokes (no PNG). */
export function CalligraphyMark({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const anim = reducedMotion ? undefined : 'kth-ink-draw 2.4s ease-in-out infinite alternate'
  const pulse = reducedMotion ? undefined : 'kth-seal-breathe 3.2s ease-in-out infinite'

  return (
    <svg
      viewBox="0 0 240 240"
      width="168"
      height="168"
      role="img"
      aria-label="Kinh Thành Huế"
      className="mx-auto block drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <radialGradient id="kthInkWash" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#2a2018" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#1a1410" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0c0907" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="kthGoldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D5A3" />
          <stop offset="45%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8B1A1A" />
        </linearGradient>
      </defs>

      {/* Ink wash disc */}
      <circle cx="120" cy="120" r="108" fill="url(#kthInkWash)" />

      {/* Outer seal ring */}
      <circle
        cx="120"
        cy="120"
        r="96"
        fill="none"
        stroke="url(#kthGoldStroke)"
        strokeWidth="2.2"
        opacity="0.85"
        style={{ animation: pulse }}
      />
      <circle
        cx="120"
        cy="120"
        r="88"
        fill="none"
        stroke="#C9A227"
        strokeWidth="0.6"
        strokeDasharray="3 5"
        opacity="0.45"
      />

      {/* Decorative cloud / brush flourishes */}
      <g
        fill="none"
        stroke="#E8DCC8"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        style={{
          strokeDasharray: 180,
          strokeDashoffset: reducedMotion ? 0 : 40,
          animation: anim,
        }}
      >
        <path d="M38 78 C58 52, 88 48, 112 62 C98 70, 72 78, 52 86 C44 90, 36 86, 38 78 Z" />
        <path d="M202 162 C182 188, 152 192, 128 178 C142 170, 168 162, 188 154 C196 150, 204 154, 202 162 Z" />
      </g>

      {/* Central brush glyph — stylized “Huế / 順” inspired strokes */}
      <g
        fill="none"
        stroke="url(#kthGoldStroke)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 320,
          strokeDashoffset: reducedMotion ? 0 : 28,
          animation: anim,
        }}
      >
        {/* Horizontal beam */}
        <path d="M62 108 H178" />
        {/* Vertical stem */}
        <path d="M120 58 V178" />
        {/* Left slash */}
        <path d="M78 72 C96 96, 96 128, 74 168" />
        {/* Right slash */}
        <path d="M162 72 C144 96, 144 128, 166 168" />
        {/* Bottom hook */}
        <path d="M86 148 C104 168, 136 168, 154 148" />
      </g>

      {/* Son-red square seal stamp */}
      <g transform="translate(168 168)" style={{ animation: pulse }}>
        <rect
          x="-22"
          y="-22"
          width="44"
          height="44"
          rx="2"
          fill="#8B1A1A"
          stroke="#C9A227"
          strokeWidth="1.2"
          opacity="0.92"
        />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#E8DCC8"
          fontSize="13"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.06em"
        >
          HUẾ
        </text>
      </g>
    </svg>
  )
}
