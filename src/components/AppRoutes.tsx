import { useMemo, useState } from 'react';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useNow } from '../hooks/useNow';
import { useReminders } from '../hooks/useReminders';
import { toDateKey } from '../lib/dateKeys';
import { EVERYONE, resolvePersonFilter } from '../lib/personFilter';
import type { Route } from '../lib/routes';
import { indexLogs, occurrencesForDay } from '../lib/schedule';
import type { AppSnapshot } from '../lib/types';
import { HistoryPage } from '../pages/HistoryPage';
import { MedicationsPage } from '../pages/MedicationsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PrescriptionEditorPage } from '../pages/PrescriptionEditorPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TodayPage } from '../pages/TodayPage';

interface AppRoutesProps {
  route: Route;
  snapshot: AppSnapshot;
}

/** Everything that needs loaded data: derived schedules, reminders, and the page for the route. */
export function AppRoutes({ route, snapshot }: AppRoutesProps) {
  const now = useNow();
  const today = toDateKey(now);
  const { permission, requestPermission } = useNotificationPermission();
  const [selectedPerson, setSelectedPerson] = useState(EVERYONE);
  const personFilter = resolvePersonFilter(selectedPerson, snapshot.people);

  const logsById = useMemo(() => indexLogs(snapshot.doseLogs), [snapshot.doseLogs]);
  // Keyed on the day, not the clock, so reminder timers are only rebuilt when the data or the date changes.
  const todaysDoses = useMemo(
    () => occurrencesForDay(today, { prescriptions: snapshot.prescriptions, people: snapshot.people, logsById }),
    [today, snapshot.prescriptions, snapshot.people, logsById],
  );

  const remindersActive = snapshot.settings.remindersEnabled && permission === 'granted';
  useReminders(todaysDoses, remindersActive);

  switch (route.name) {
    case 'today':
      return (
        <TodayPage
          snapshot={snapshot}
          now={now}
          today={today}
          todaysDoses={todaysDoses}
          personFilter={personFilter}
          onPersonFilterChange={setSelectedPerson}
          remindersActive={remindersActive}
        />
      );
    case 'medications':
      return <MedicationsPage snapshot={snapshot} today={today} />;
    case 'new-prescription':
      return <PrescriptionEditorPage snapshot={snapshot} today={today} prescriptionId={undefined} />;
    case 'edit-prescription':
      return <PrescriptionEditorPage snapshot={snapshot} today={today} prescriptionId={route.prescriptionId} />;
    case 'history':
      return (
        <HistoryPage
          snapshot={snapshot}
          now={now}
          today={today}
          logsById={logsById}
          personFilter={personFilter}
          onPersonFilterChange={setSelectedPerson}
        />
      );
    case 'settings':
      return <SettingsPage snapshot={snapshot} permission={permission} requestPermission={requestPermission} />;
    case 'not-found':
      return <NotFoundPage />;
  }
}
