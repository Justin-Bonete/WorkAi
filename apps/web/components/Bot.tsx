import type { CSSProperties } from 'react';
import type { BotState } from '@/lib/agents';

export default function Bot({ state, hue, size = 64 }: { state: BotState; hue: number; size?: number }) {
  return (
    <svg
      className={`bot st-${state}`}
      width={size}
      height={Math.round(size * 1.1)}
      viewBox="0 0 64 70"
      style={{ '--hue': hue } as CSSProperties}
      aria-hidden="true"
    >
      <line x1="32" y1="5" x2="32" y2="12" className="b-ant" />
      <circle cx="32" cy="4" r="3" className="b-light" />
      <rect x="14" y="12" width="36" height="26" rx="9" className="b-head" />
      <rect x="19" y="18" width="26" height="12" rx="6" className="b-face" />
      <circle cx="26" cy="24" r="3" className="b-eye" />
      <circle cx="38" cy="24" r="3" className="b-eye" />
      <rect x="18" y="40" width="28" height="20" rx="7" className="b-body" />
      <rect x="8" y="42" width="8" height="14" rx="4" className="b-arm b-arm-l" />
      <rect x="48" y="42" width="8" height="14" rx="4" className="b-arm b-arm-r" />
    </svg>
  );
}
