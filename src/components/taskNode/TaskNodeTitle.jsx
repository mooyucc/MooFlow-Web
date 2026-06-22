import React from 'react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';
import {
  CARD_PADDING_X,
  getTitleAnchorY,
  translateTitleLine,
  wrapTaskTitleLines,
} from '../../utils/taskNodeText';

const TaskNodeTitle = ({
  task,
  isFirst,
  editing,
  title,
  setTitle,
  t,
  onDoubleClick,
  onBlur,
  onCancelEdit,
}) => {
  const fontFamily = task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif';

  if (editing) {
    return (
      <foreignObject x={0} y={0} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <input
          className="nodrag nowheel"
          style={{
            width: '100%',
            height: '100%',
            textAlign: task.textAlign || 'center',
            fontSize: task.fontSize || 16,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontWeight: task.fontWeight || 500,
            color: isFirst ? '#fff' : (task.color || '#222'),
            fontFamily: task.fontFamily || '思源黑体',
            borderRadius: 18,
            cursor: 'text',
            fontStyle: task.fontStyle || 'normal',
            textDecoration: task.textDecoration || 'none',
            userSelect: 'text',
          }}
          value={title}
          autoFocus
          onChange={e => setTitle(e.target.value)}
          onBlur={onBlur}
          onMouseDown={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              onBlur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onCancelEdit();
            }
          }}
        />
      </foreignObject>
    );
  }

  const lines = wrapTaskTitleLines(task.title, task.fontWeight, task.fontSize, fontFamily);
  const textX =
    task.textAlign === 'left' ? CARD_PADDING_X :
    task.textAlign === 'right' ? NODE_WIDTH - CARD_PADDING_X :
    NODE_WIDTH / 2;
  const textAnchor =
    task.textAlign === 'left' ? 'start' :
    task.textAlign === 'right' ? 'end' :
    'middle';

  return (
    <text
      x={textX}
      y={getTitleAnchorY(lines.length)}
      fontSize={task.fontSize || 16}
      fontWeight={task.fontWeight || 600}
      fontStyle={task.fontStyle || 'normal'}
      fill={isFirst ? '#fff' : (task.color || '#222')}
      fontFamily={fontFamily}
      style={{
        userSelect: 'none',
        cursor: 'pointer',
        textAnchor,
        textDecoration: task.textDecoration || 'none',
      }}
      onDoubleClick={onDoubleClick}
    >
      {lines.map((line, idx) => (
        <tspan key={idx} x={textX} dy={idx === 0 ? 0 : 18}>
          {translateTitleLine(line, t)}
        </tspan>
      ))}
    </text>
  );
};

export default TaskNodeTitle;
