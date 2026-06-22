import React from 'react';
import './TimelineGranularityToolbar.css';
import { useTranslation } from '../../LanguageContext';
import { useCanvasSettingsStore } from '../../store/canvasSettingsStore';

const SCALE_OPTIONS = ['month', 'week', 'day'];

const TimelineGranularityToolbar = () => {
  const [t] = useTranslation();
  const timeScale = useCanvasSettingsStore(state => state.timeScale);
  const setTimeScale = useCanvasSettingsStore(state => state.setTimeScale);

  return (
    <div className="timeline-granularity-toolbar">
      <span className="timeline-granularity-toolbar__label">{t('timeline.granularity')}</span>
      {SCALE_OPTIONS.map((scale) => (
        <button
          key={scale}
          type="button"
          className={`timeline-granularity-toolbar__btn${timeScale === scale ? ' timeline-granularity-toolbar__btn--active' : ''}`}
          onClick={() => setTimeScale(scale)}
          aria-pressed={timeScale === scale}
        >
          {t(`timeline.${scale}_short`)}
        </button>
      ))}
    </div>
  );
};

export default TimelineGranularityToolbar;
