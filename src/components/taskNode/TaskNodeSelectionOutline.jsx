import React from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import { renderShape } from '../../utils/renderShape';

const TaskNodeSelectionOutline = ({ shape, selected, multiSelected, hoveredAnchorKey }) => {
  if ((!selected && !multiSelected) || hoveredAnchorKey) return null;

  const commonProps = {
    fill: 'none',
    stroke: '#1251a580',
    strokeWidth: 2,
    pointerEvents: 'none',
  };

  let shapeProps = {};
  if (shape === 'rect' || shape === 'roundRect') {
    shapeProps = {
      x: -4,
      y: -4,
      width: NODE_WIDTH + 8,
      height: NODE_HEIGHT + 8,
      rx: shape === 'roundRect' ? 22 : 0,
      style: { transition: 'all 0.18s cubic-bezier(.4,0,.2,1)' },
    };
  } else if (shape === 'ellipse' || shape === 'circle') {
    shapeProps = {
      cx: NODE_WIDTH / 2,
      cy: NODE_HEIGHT / 2,
      rx: (shape === 'ellipse' ? NODE_WIDTH / 2 : NODE_HEIGHT / 2) + 4,
      ry: NODE_HEIGHT / 2 + 4,
      style: { transition: 'all 0.18s cubic-bezier(.4,0,.2,1)' },
    };
  } else {
    const scaleFactor = 1.08;
    const centerX = NODE_WIDTH / 2;
    const centerY = NODE_HEIGHT / 2;
    shapeProps = {
      transform: `translate(${centerX}, ${centerY}) scale(${scaleFactor}) translate(${-centerX}, ${-centerY})`,
      style: { transition: 'transform 0.18s cubic-bezier(.4,0,.2,1)' },
    };
  }

  return renderShape(shape, { ...commonProps, ...shapeProps });
};

export default TaskNodeSelectionOutline;
