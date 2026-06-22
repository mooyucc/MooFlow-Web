import React from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { renderShape } from '../../utils/renderShape';
import { CRITICAL_PATH_COLOR, getCriticalPathGlowFilter } from '../../utils/criticalPath';

const TaskNodeCriticalOutline = ({ shape, visible, selected }) => {
  if (!visible || selected) return null;

  const commonProps = {
    fill: 'none',
    stroke: CRITICAL_PATH_COLOR,
    strokeWidth: 2.5,
    pointerEvents: 'none',
    style: { filter: getCriticalPathGlowFilter(CRITICAL_PATH_COLOR) },
  };

  let shapeProps = {};
  if (shape === 'rect' || shape === 'roundRect') {
    shapeProps = {
      x: -3,
      y: -3,
      width: NODE_WIDTH + 6,
      height: NODE_HEIGHT + 6,
      rx: shape === 'roundRect' ? 21 : 0,
    };
  } else if (shape === 'ellipse' || shape === 'circle') {
    shapeProps = {
      cx: NODE_WIDTH / 2,
      cy: NODE_HEIGHT / 2,
      rx: (shape === 'ellipse' ? NODE_WIDTH / 2 : NODE_HEIGHT / 2) + 3,
      ry: NODE_HEIGHT / 2 + 3,
    };
  } else {
    const scaleFactor = 1.06;
    const centerX = NODE_WIDTH / 2;
    const centerY = NODE_HEIGHT / 2;
    shapeProps = {
      transform: `translate(${centerX}, ${centerY}) scale(${scaleFactor}) translate(${-centerX}, ${-centerY})`,
    };
  }

  return renderShape(shape, { ...commonProps, ...shapeProps });
};

export default TaskNodeCriticalOutline;
