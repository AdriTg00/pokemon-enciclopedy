interface PokeballLogoProps {
  className?: string;
}

export function PokeballLogo({ className }: PokeballLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="pokeball-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill="white" />
      <path d="M6 50a44 44 0 0 1 88 0z" fill="var(--poke-red, #e5484d)" />
      <rect x="6" y="46.5" width="88" height="7" fill="#0d0d11" />
      <circle cx="50" cy="50" r="14" fill="white" stroke="#0d0d11" strokeWidth="6" />
      <path d="M6 50a44 44 0 0 1 88 0z" fill="url(#pokeball-gloss)" />
    </svg>
  );
}