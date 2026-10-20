import { motion } from 'framer-motion';

const RINGS = [
  { r: 175, opacity: 0.55 },
  { r: 240, opacity: 0.4 },
  { r: 305, opacity: 0.27 },
  { r: 370, opacity: 0.17 },
  { r: 435, opacity: 0.1 },
];

const CX = 480;
const CY = 470;

/**
 * The hero landscape. On first load the sun rises from behind the hills and
 * the rings of light spread outward once. After that it rests: calm, not busy.
 */
export default function SunriseArt({ className = '', align = 'xMidYMax' }) {
  const rise = { duration: 2.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 };
  return (
    <svg
      viewBox="0 0 960 760"
      preserveAspectRatio={`${align} slice`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="rc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6DDA6" stopOpacity="0.95" />
          <stop offset="48%" stopColor="#F1CB7E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F1CB7E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rc-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8E3B0" />
          <stop offset="100%" stopColor="#E9B44C" />
        </linearGradient>
        <linearGradient id="rc-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9D9CE" />
          <stop offset="100%" stopColor="#BDD0C3" />
        </linearGradient>
        <linearGradient id="rc-hill-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9DB9A6" />
          <stop offset="100%" stopColor="#7FA08C" />
        </linearGradient>
        <linearGradient id="rc-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B7260" />
          <stop offset="100%" stopColor="#2F4A3F" />
        </linearGradient>
      </defs>

      <motion.g initial={{ y: 170, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={rise}>
        <circle cx={CX} cy={CY} r="400" fill="url(#rc-glow)" />
        {RINGS.map((ring, i) => (
          <motion.circle
            key={ring.r}
            cx={CX}
            cy={CY}
            r={ring.r}
            fill="none"
            stroke="#E9B44C"
            strokeWidth="1.5"
            strokeOpacity={ring.opacity}
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 1.1 + i * 0.16 }}
          />
        ))}
        <circle cx={CX} cy={CY} r="118" fill="url(#rc-sun)" />
      </motion.g>

      <path
        d="M0 566 C140 506 262 528 402 566 S704 610 960 524 L960 760 L0 760Z"
        fill="url(#rc-hill-back)"
      />
      <path
        d="M0 626 C182 564 332 606 482 644 S784 656 960 592 L960 760 L0 760Z"
        fill="url(#rc-hill-mid)"
      />
      <path
        d="M0 696 C202 654 382 694 562 704 S842 694 960 664 L960 760 L0 760Z"
        fill="url(#rc-hill-front)"
      />
    </svg>
  );
}

// A quiet set of concentric arcs for the dark sections.
export function RingsArt({ className = '', stroke = '#F1CB7E' }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true" focusable="false">
      {[90, 150, 210, 270, 330].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeOpacity={0.5 - i * 0.08}
        />
      ))}
      <circle cx="300" cy="300" r="46" fill={stroke} fillOpacity="0.9" />
    </svg>
  );
}
