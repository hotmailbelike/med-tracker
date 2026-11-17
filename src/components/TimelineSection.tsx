import { useId, useState } from 'react';
import type { TimelinePhase } from '../lib/doseTiming';
import { formatTimeOfDay } from '../lib/formatters';
import type { TimelineSection as Section } from '../lib/groupTimeline';
import { DoseCard } from './DoseCard';
import { FoldHeading } from './FoldHeading';

const PHASE_TITLES: Record<TimelinePhase, string> = {
  previous: 'Previous',
  due: 'Due now',
  upcoming: 'Upcoming',
};

interface TimelineSectionProps {
  section: Section;
  now: Date;
  showPerson: boolean;
}

function describeCounts(section: Section): string {
  const doses = `${section.doseCount} ${section.doseCount === 1 ? 'dose' : 'doses'}`;
  return section.overdueCount > 0 ? `${doses}, ${section.overdueCount} overdue` : doses;
}

function TimeSlots({ section, now, showPerson }: TimelineSectionProps) {
  return section.slots.map((slot) => (
    <div key={slot.time} className="time-slot">
      <h3 className="time-slot__time">{formatTimeOfDay(slot.time)}</h3>
      <ul className="dose-list">
        {slot.doses.map((dose) => (
          <DoseCard key={dose.occurrence.key} dose={dose} now={now} showPerson={showPerson} />
        ))}
      </ul>
    </div>
  ));
}

/**
 * Earlier doses fold away when they are all dealt with, so the day starts at what needs doing. The
 * fold opens by itself whenever another dose becomes overdue, even if the visitor closed it before.
 */
function usePreviousFold(overdueCount: number) {
  const [isOpen, setIsOpen] = useState(overdueCount > 0);
  const [seenOverdueCount, setSeenOverdueCount] = useState(overdueCount);

  // Adjusting state during render (rather than in an effect) opens the fold in the same paint.
  if (overdueCount !== seenOverdueCount) {
    setSeenOverdueCount(overdueCount);
    if (overdueCount > seenOverdueCount) setIsOpen(true);
  }

  return { isOpen, toggle: () => setIsOpen((open) => !open) };
}

export function TimelineSection(props: TimelineSectionProps) {
  const { section } = props;
  const headingId = useId();
  const slotsId = useId();
  const fold = usePreviousFold(section.overdueCount);

  if (section.phase === 'previous') {
    return (
      <section className="timeline-section" aria-labelledby={headingId}>
        <FoldHeading
          id={headingId}
          className="timeline-section__heading"
          isOpen={fold.isOpen}
          controlsId={slotsId}
          onToggle={fold.toggle}
        >
          <span className="timeline-section__title">{PHASE_TITLES[section.phase]}</span>
          <span className="timeline-section__count">{describeCounts(section)}</span>
        </FoldHeading>
        <div id={slotsId} className="timeline-section__slots" hidden={!fold.isOpen}>
          <TimeSlots {...props} />
        </div>
      </section>
    );
  }

  return (
    <section className={`timeline-section timeline-section--${section.phase}`} aria-labelledby={headingId}>
      <div className="timeline-section__summary">
        <h2 id={headingId} className="timeline-section__title">
          {PHASE_TITLES[section.phase]}
        </h2>
        <span className="timeline-section__count">{describeCounts(section)}</span>
      </div>
      <TimeSlots {...props} />
    </section>
  );
}
