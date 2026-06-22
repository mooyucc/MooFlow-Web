import { useMemo } from 'react';
import { generateTimelineTicks, TIMELINE_TICK_WIDTH } from '../../utils/timeline';

export function useTimeline({ firstTask, timeScale, lang }) {
  const startDate = firstTask?.date ? new Date(firstTask.date) : new Date();

  const ticks = useMemo(
    () => generateTimelineTicks({ firstTask, startDate, timeScale, lang }),
    [
      firstTask?.id,
      firstTask?.position?.x,
      firstTask?.date,
      timeScale,
      lang,
      startDate.getTime(),
    ]
  );

  return { ticks, startDate, tickWidth: TIMELINE_TICK_WIDTH };
}
