import React from 'react';
import { useViewport } from '@xyflow/react';
import { viewportToTransform } from './flowAdapter';
import { getFlowViewBox } from './useFlowViewport';
import TimelineRuler from '../../components/canvas/TimelineRuler';
import AlignGuideLines from '../../components/canvas/AlignGuideLines';

/** 装饰层：时间轴 + 对齐线（锚点预览由 React Flow ConnectionLine 负责） */
const FlowDecorOverlay = ({ ticks, timeScale, lang, t, alignLines }) => {
  const viewport = useViewport();
  const transform = viewportToTransform(viewport);
  const vb = getFlowViewBox(viewport);

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
      viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
    >
      <AlignGuideLines alignLines={alignLines} />
      <TimelineRuler
        ticks={ticks}
        timeScale={timeScale}
        lang={lang}
        transform={transform}
        t={t}
      />
    </svg>
  );
};

export default FlowDecorOverlay;
