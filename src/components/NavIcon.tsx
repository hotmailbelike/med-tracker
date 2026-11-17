export type NavIconName = 'today' | 'medications' | 'history' | 'settings';

const PATHS: Record<NavIconName, string> = {
  // Sun rising over a line: the day's doses.
  today: 'M12 3v2M5.6 5.6 7 7M3 12h2M19 12h2M17 7l1.4-1.4M7 16a5 5 0 0 1 10 0M3 20h18',
  // A capsule.
  medications: 'M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7ZM6.5 10.5l7 7',
  // Rising bars.
  history: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  // Sliders.
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
};

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
