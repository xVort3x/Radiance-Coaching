// A low sun over a horizon with its reflection: the radiance of the name.
export function LogoMark({ className = 'h-9 w-9', tone = 'dark' }) {
  const ground = tone === 'dark' ? '#2F4A3F' : '#F2F5F1';
  const sun = tone === 'dark' ? '#E9B44C' : '#F1CB7E';
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path d="M7 21a9 9 0 0 1 18 0Z" fill={sun} />
      <g stroke={sun} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M5.2 14.8 2.6 13.3M9.8 10.2 8.3 7.6M16 8.5V5.5M22.2 10.2l1.5-2.6M26.8 14.8l2.6-1.5" />
      </g>
      <g stroke={ground} strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M3 21h26" />
        <path d="M9 25h14" opacity=".55" />
      </g>
    </svg>
  );
}

export default function Logo({ tone = 'dark' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} />
      <span
        className={`font-display text-[1.35rem] leading-none tracking-tight ${
          tone === 'dark' ? 'text-fig-900' : 'text-mist-100'
        }`}
      >
        Radiance Coaching
      </span>
    </span>
  );
}
