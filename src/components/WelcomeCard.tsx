import { useState } from 'react';
import { useLoadSampleData } from '../hooks/useLoadSampleData';
import { PATHS } from '../lib/routes';
import { NavLink } from './NavLink';

/** First run: explain the app in two lines and offer a populated demo or a clean start. */
export function WelcomeCard() {
  const loadSampleData = useLoadSampleData();
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    await loadSampleData();
    setIsLoading(false);
  };

  return (
    <section className="welcome card" aria-labelledby="welcome-title">
      <h2 id="welcome-title" className="welcome__title">
        Every dose, on time, for everyone you look after
      </h2>
      <p className="welcome__lead">
        Add prescriptions for yourself or family, see what is due today, and tick doses off as they are taken. Everything
        is stored on this device only. There is no account and nothing is uploaded.
      </p>
      <div className="welcome__actions">
        <button type="button" className="button button--primary" onClick={() => void load()} disabled={isLoading}>
          {isLoading ? 'Loading sample data…' : 'Load sample data'}
        </button>
        <NavLink href={PATHS.newPrescription} className="button button--secondary">
          Add a prescription
        </NavLink>
      </div>
      <p className="welcome__note">
        Sample data is a fictional household with common over-the-counter medicines and a week of history. You can clear
        it at any time in Settings. <strong>Not medical advice. For tracking only.</strong>
      </p>
    </section>
  );
}
