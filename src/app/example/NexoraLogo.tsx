// src/app/example/NexoraLogo.tsx
export function NexoraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGEx" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGEx)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGEx)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGEx)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}