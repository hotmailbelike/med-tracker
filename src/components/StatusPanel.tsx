import type { ReactNode } from 'react';

interface StatusPanelProps {
  title: string;
  children?: ReactNode;
  tone?: 'neutral' | 'error';
  /** Loading panels announce themselves politely; errors use role="alert". */
  role?: 'status' | 'alert';
}

export function StatusPanel({ title, children, tone = 'neutral', role }: StatusPanelProps) {
  return (
    <div className={`status-panel status-panel--${tone}`} role={role}>
      <h2 className="status-panel__title">{title}</h2>
      {children}
    </div>
  );
}
