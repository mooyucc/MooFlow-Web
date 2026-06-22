import React, { memo } from 'react';
import LinkLine from '../../components/LinkLine';
import { useTaskStore } from '../../store/taskStore';
import { useFlowInteraction } from './FlowInteractionContext';

function MooFlowEdgeComponent({ data, selected, style }) {
  const tasks = useTaskStore(state => state.tasks);
  const {
    clientToFlowPoint,
    onSelectLink,
    onDeleteLink,
    onUpdateLink,
    onUpdateLinkLabel,
  } = useFlowInteraction();

  if (!data?.fromId || !data?.toId) return null;

  const source = tasks.find(task => task.id === data.fromId);
  const target = tasks.find(task => task.id === data.toId);
  if (!source || !target) return null;

  const color = data.color || style?.stroke || '#86868b';
  const isStoredLink = data.kind === 'link';
  const lineWidth = data.lineWidth || style?.strokeWidth || 2;
  const dimmed = Boolean(data.dimmed);
  const labelBg = data.isCritical ? color : '#9ca3af';

  return (
    <LinkLine
      source={source}
      target={target}
      fromId={data.fromId}
      toId={data.toId}
      fromAnchor={data.fromAnchor}
      toAnchor={data.toAnchor}
      onDelete={isStoredLink ? onDeleteLink : undefined}
      onUpdateLink={onUpdateLink}
      tasks={tasks}
      clientToFlowPoint={clientToFlowPoint}
      label={data.label || ''}
      onUpdateLabel={onUpdateLinkLabel}
      lineStyle={data.lineStyle || 'solid'}
      arrowStyle={data.arrowStyle || 'normal'}
      lineWidth={lineWidth}
      color={color}
      dimmed={dimmed}
      dimOpacity={data.dimOpacity}
      labelBackground={labelBg}
      selected={selected}
      isCritical={Boolean(data.isCritical)}
      onClick={() => onSelectLink?.(data.fromId, data.toId)}
      labelPortal
    />
  );
}

export default memo(MooFlowEdgeComponent);
