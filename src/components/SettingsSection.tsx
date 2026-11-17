import { useId, type ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  const headingId = useId();
  return (
    <section className="settings-section card" aria-labelledby={headingId}>
      <h2 id={headingId} className="settings-section__title">
        {title}
      </h2>
      {description !== undefined && <div className="settings-section__description">{description}</div>}
      {children}
    </section>
  );
}
