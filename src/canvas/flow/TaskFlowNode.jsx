import React, { memo, useCallback, useEffect } from 'react';
import { Handle, Position, useStore, useUpdateNodeInternals } from '@xyflow/react';
import { useTaskStore } from '../../store/taskStore';
import { NODE_WIDTH, NODE_HEIGHT, ANCHORS } from '../../constants/nodeLayout';
import TaskNodeBody from '../../components/taskNode/TaskNodeBody';
import { useFlowInteraction } from './FlowInteractionContext';

const ANCHOR_HANDLES = [
  { key: 'UpAnchor', position: Position.Top, left: '50%', top: 0 },
  { key: 'DownAnchor', position: Position.Bottom, left: '50%', bottom: 0 },
  { key: 'LeftAnchor', position: Position.Left, top: '50%', left: 0 },
  { key: 'RightAnchor', position: Position.Right, top: '50%', right: 0 },
];

const TaskFlowNode = ({ id, data, selected }) => {
  const {
    onEditingChange,
    onAnchorMouseDown,
    onAnchorMouseEnter,
    onAnchorMouseLeave,
  } = useFlowInteraction();
  const task = useTaskStore(state => state.tasks.find(t => t.id === data.taskId));
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, task?.position?.x, task?.position?.y, updateNodeInternals]);

  const hasOtherSelected = useStore(
    useCallback((store) => {
      let found = false;
      store.nodeLookup.forEach((node) => {
        if (node.selected && node.id !== id) found = true;
      });
      return found;
    }, [id]),
  );

  if (!task) return null;

  const multiSelected = selected && hasOtherSelected;

  return (
    <div
      className="task-flow-node"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT, overflow: 'visible' }}
      data-task-id={task.id}
    >
      {ANCHOR_HANDLES.map(({ key, position, ...style }) => (
        <Handle
          key={key}
          id={key}
          type="source"
          position={position}
          style={{
            ...style,
            width: 8,
            height: 8,
            opacity: 0,
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'transparent',
          }}
        />
      ))}
      {ANCHOR_HANDLES.map(({ key, position, ...style }) => (
        <Handle
          key={`${key}-target`}
          id={`${key}-target`}
          type="target"
          position={position}
          style={{
            ...style,
            width: 8,
            height: 8,
            opacity: 0,
            transform: 'translate(-50%, -50%)',
            border: 'none',
            background: 'transparent',
          }}
        />
      ))}
      <svg
        width={NODE_WIDTH}
        height={NODE_HEIGHT + 24}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <TaskNodeBody
          task={task}
          selected={selected && !multiSelected}
          multiSelected={multiSelected}
          isFirst={data.isFirst}
          isCritical={data.isCritical}
          dimmed={data.dimmed}
          showAnchors
          cursor="grab"
          onEditingChange={onEditingChange}
          onAnchorMouseDown={onAnchorMouseDown}
          onAnchorMouseEnter={onAnchorMouseEnter}
          onAnchorMouseLeave={onAnchorMouseLeave}
        />
      </svg>
    </div>
  );
};

export default memo(TaskFlowNode);

export { ANCHORS };
