import React from 'react';
import {
  computeTodayMarkerX,
  getTimelineBaselineY,
  getWeekNumber,
  TIMELINE_FONT,
} from '../../utils/timeline';

const TimelineRuler = ({ ticks, timeScale, lang, transform, t }) => {
  if (!ticks.length) return null;

  const first = ticks[0];
  const last = ticks[ticks.length - 1];
  const hasValidRange = typeof first.x === 'number'
    && typeof last.x === 'number'
    && !Number.isNaN(first.x)
    && !Number.isNaN(last.x);

  const baselineY = getTimelineBaselineY(transform);
  const todayX = computeTodayMarkerX({ ticks, timeScale, lang });

  return (
    <g>
      {hasValidRange && (
        <line
          x1={first.x - 100}
          x2={last.x + 100}
          y1={baselineY}
          y2={baselineY}
          stroke="#bfc8d6"
          strokeWidth={2}
        />
      )}

      {todayX !== null && (
        <>
          <circle
            cx={todayX}
            cy={baselineY}
            r={9}
            fill="none"
            stroke="#e11d48"
            strokeWidth={3}
            opacity={0.95}
            pointerEvents="none"
          />
          <text
            x={todayX}
            y={baselineY + 24}
            fontSize={14}
            fontFamily={TIMELINE_FONT}
            fill="#e11d48"
            textAnchor="middle"
            style={{ fontWeight: 400, letterSpacing: 1, opacity: 0.95 }}
            pointerEvents="none"
          >
            {t('timeline.today')}
          </text>
        </>
      )}

      {ticks.map((tick, idx) => (
        <g key={`${tick.label}-${idx}`}>
          <line
            x1={tick.x}
            x2={tick.x}
            y1={baselineY - 10}
            y2={baselineY + 10}
            stroke="#bfc8d6"
            strokeWidth={1.5}
          />

          {timeScale === 'month' && (
            <text
              x={tick.x}
              y={baselineY - 20}
              fontSize={15}
              fontFamily={TIMELINE_FONT}
              fill="#888"
              textAnchor="middle"
              style={{ fontWeight: 400, letterSpacing: 1 }}
            >
              {t('timeline.month', {
                year: tick.date.getFullYear(),
                month: tick.date.getMonth() + 1,
              })}
            </text>
          )}

          {timeScale === 'week' && (
            <text
              x={tick.x}
              y={baselineY - 20}
              fontSize={15}
              fontFamily={TIMELINE_FONT}
              fill="#888"
              textAnchor="middle"
              style={{ fontWeight: 400, letterSpacing: 1 }}
            >
              {t('timeline.week', {
                year: tick.date.getFullYear(),
                week: getWeekNumber(tick.date, lang),
              })}
            </text>
          )}

          {timeScale === 'day' && (
            <text
              x={tick.x}
              y={baselineY - 20}
              fontSize={14}
              fontFamily={TIMELINE_FONT}
              fill="#888"
              textAnchor="middle"
              style={{ fontWeight: 400, letterSpacing: 1 }}
            >
              {t('timeline.day', {
                year: tick.date.getFullYear(),
                month: tick.date.getMonth() + 1,
                day: tick.date.getDate(),
              })}
            </text>
          )}

          {timeScale === 'week'
            && getWeekNumber(tick.date, lang) === getWeekNumber(new Date(tick.date.getFullYear(), tick.date.getMonth(), 1), lang) && (
            <text
              x={tick.x}
              y={getTimelineBaselineY(transform, 30)}
              fontSize={14}
              fontFamily={TIMELINE_FONT}
              fill="#316acb"
              textAnchor="middle"
              style={{ fontWeight: 500, letterSpacing: 1, opacity: 0.7 }}
            >
              {t('timeline.month', {
                year: tick.date.getFullYear(),
                month: tick.date.getMonth() + 1,
              })}
            </text>
          )}

          {timeScale === 'day' && tick.date.getDate() === 1 && (
            <text
              x={tick.x}
              y={getTimelineBaselineY(transform, 30)}
              fontSize={14}
              fontFamily={TIMELINE_FONT}
              fill="#316acb"
              textAnchor="middle"
              style={{ fontWeight: 500, letterSpacing: 1, opacity: 0.7 }}
            >
              {t('timeline.month', {
                year: tick.date.getFullYear(),
                month: tick.date.getMonth() + 1,
              })}
            </text>
          )}
        </g>
      ))}
    </g>
  );
};

export default TimelineRuler;
