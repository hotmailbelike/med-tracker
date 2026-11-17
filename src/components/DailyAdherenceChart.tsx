import { useId } from 'react';
import { adherenceRatio, type DayAdherence } from '../lib/adherence';
import { formatLongWeekday, formatPercent, formatShortWeekday } from '../lib/formatters';
import type { DateKey } from '../lib/types';

interface DailyAdherenceChartProps {
  days: readonly DayAdherence[];
  today: DateKey;
}

// Chart geometry in viewBox units. The 14-unit text (.chart__value in global.css) scales with the
// chart: about 12px on a 320px phone and over 14px on a 375px one. CSS caps the width on large
// screens so the text does not balloon.
const WIDTH = 300;
const HEIGHT = 190;
const TOP_PADDING = 26;
const BOTTOM_PADDING = 30;
const BAR_WIDTH_SHARE = 0.56;
const PLOT_HEIGHT = HEIGHT - TOP_PADDING - BOTTOM_PADDING;
const GRID_LINES = [0, 0.5, 1];
/** Days with nothing due still get a visible stub, so the gap does not read as a rendering bug. */
const EMPTY_BAR_HEIGHT = 2;

function describeDay(day: DayAdherence): string {
  const ratio = adherenceRatio(day.tally);
  if (ratio === null) return `${formatLongWeekday(day.day)}: no doses due`;
  return `${formatLongWeekday(day.day)}: ${formatPercent(ratio)}, ${day.tally.taken} of ${day.tally.counted} taken`;
}

export function DailyAdherenceChart({ days, today }: DailyAdherenceChartProps) {
  const titleId = useId();
  const descriptionId = useId();
  const slotWidth = WIDTH / Math.max(days.length, 1);
  const barWidth = slotWidth * BAR_WIDTH_SHARE;
  const baseline = TOP_PADDING + PLOT_HEIGHT;

  return (
    <figure className="chart card">
      <figcaption className="chart__caption">Doses taken each day</figcaption>
      <svg
        className="chart__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>Share of due doses taken, last {days.length} days</title>
        <desc id={descriptionId}>{days.map(describeDay).join('. ')}.</desc>
        {GRID_LINES.map((line) => (
          <line
            key={line}
            className="chart__grid"
            x1={0}
            x2={WIDTH}
            y1={baseline - line * PLOT_HEIGHT}
            y2={baseline - line * PLOT_HEIGHT}
          />
        ))}
        {days.map((day, index) => {
          const ratio = adherenceRatio(day.tally);
          const barHeight = ratio === null ? EMPTY_BAR_HEIGHT : Math.max(ratio * PLOT_HEIGHT, EMPTY_BAR_HEIGHT);
          const centerX = slotWidth * index + slotWidth / 2;
          const isToday = day.day === today;
          return (
            <g key={day.day} className={isToday ? 'chart__day chart__day--today' : 'chart__day'}>
              <rect
                className="chart__bar"
                x={centerX - barWidth / 2}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
              />
              <text className="chart__value" x={centerX} y={baseline - barHeight - 7} textAnchor="middle">
                {ratio === null ? '–' : formatPercent(ratio)}
              </text>
              <text className="chart__label" x={centerX} y={HEIGHT - 8} textAnchor="middle">
                {isToday ? 'Today' : formatShortWeekday(day.day)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
