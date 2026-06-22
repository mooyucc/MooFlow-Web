import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useViewport,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './flowCanvas.css';

import { useTaskStore } from '../../store/taskStore';
import { useCanvasSettingsStore } from '../../store/canvasSettingsStore';
import { useTranslation } from '../../LanguageContext';
import { ANCHORS } from '../../constants/nodeLayout';
import { useSnapGuide } from '../hooks/useSnapGuide';
import { useTimeline } from '../hooks/useTimeline';
import { useFlowAnchorLinking } from './useFlowAnchorLinking';
import { getVisibleTasks } from '../../utils/visibleTasks';
import { alignTasksToTimeline } from '../../utils/timeline';
import { buildChildTaskFromSelection } from '../../utils/createChildTask';
import { shouldCheckLinkCycle, wouldCreateLinkCycle } from '../../utils/linkCycle';
import { cascadeUpdateDates, updateLinkLabelWithCascade } from '../../utils/cascadeDates';
import { computeCriticalPath } from '../../utils/criticalPath';
import { registerCanvasBridge } from '../../utils/canvasBridge';
import { findAvailablePosition } from '../../utils/taskPlacement';
import { getHiddenDescendants } from '../../utils/taskTree';

import CanvasToolbar from '../../components/CanvasToolbar';
import CanvasFileToolbar from '../../components/CanvasFileToolbar';
import FlowNodesLayoutSync from './FlowNodesLayoutSync';
import CanvasThemeToolbar from '../../components/CanvasThemeToolbar';
import TimelineGranularityToolbar from '../../components/canvas/TimelineGranularityToolbar';
import TaskContextMenu from '../../components/canvas/TaskContextMenu';
import LinkingModeHint from '../../components/canvas/LinkingModeHint';
import FlowDecorOverlay from './FlowDecorOverlay';

import { nodeTypes } from './nodeTypes';
import { edgeTypes } from './edgeTypes';
import {
  tasksToNodes,
  tasksToEdges,
  nodeIdToTaskId,
} from './flowAdapter';
import { useFlowViewport } from './useFlowViewport';
import { useFlowTouch } from './useFlowTouch';
import { useFlowNodeChanges } from './useFlowNodeChanges';
import { useFlowKeyboard } from './useFlowKeyboard';
import { FlowInteractionContext } from './FlowInteractionContext';
import MooFlowConnectionLine from './MooFlowConnectionLine';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

function MooFlowFlowCanvas() {
  const [t, lang] = useTranslation();
  const canvasProps = useCanvasSettingsStore(state => state.canvasProps);
  const updateCanvasProps = useCanvasSettingsStore(state => state.updateCanvasProps);
  const timeScale = useCanvasSettingsStore(state => state.timeScale);
  const tasks = useTaskStore(state => state.tasks);
  const addLink = useTaskStore(state => state.addLink);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const deleteLink = useTaskStore(state => state.deleteLink);
  const forceResetAnchors = useTaskStore(state => state.forceResetAnchors);
  const updateLinkStyle = useTaskStore(state => state.updateLinkStyle);
  const moveTaskSilently = useTaskStore(state => state.moveTaskSilently);

  const { getSnappedPosition } = useSnapGuide(tasks, {
    snapToGrid: Boolean(canvasProps.snapToGrid),
    gridSize: canvasProps.gridSize || 20,
  });
  const { handleSetScale, handleFitView, setViewport, getViewport, setViewportFromTransform } = useFlowViewport();
  const { screenToFlowPosition } = useReactFlow();
  const { zoom } = useViewport();

  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [alignLines, setAlignLines] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [linking, setLinking] = useState(false);
  const [fromTask, setFromTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const hasInitRef = useRef(false);

  const firstTask = tasks[0];
  const { ticks } = useTimeline({ firstTask, timeScale, lang });
  const mainDirection = canvasProps.mainDirection || 'horizontal';
  const showCriticalPath = Boolean(canvasProps.showCriticalPath);

  const criticalPath = useMemo(() => {
    if (!showCriticalPath || !firstTask?.date) return null;
    return computeCriticalPath(tasks, firstTask.id);
  }, [showCriticalPath, tasks, firstTask?.id, firstTask?.date]);

  const visibleTasks = getVisibleTasks(tasks);
  const visibleTaskIds = useMemo(
    () => new Set(visibleTasks.map(task => task.id)),
    [visibleTasks],
  );

  const selectedTaskId = selectedElement?.type === 'task' ? selectedElement.id : null;
  const selectedLink = selectedElement?.type === 'link' ? selectedElement : null;

  const handleTaskDragMove = useCallback((dragId, x, y, width, height) => {
    if (!dragId) {
      setAlignLines([]);
      return;
    }
    forceResetAnchors(dragId);
    const { lines } = getSnappedPosition(dragId, x, y, width, height);
    setAlignLines(lines || []);
  }, [getSnappedPosition, forceResetAnchors]);

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCapture,
    resetTouchState,
  } = useFlowTouch({
    contextMenu,
    getViewport,
    setViewportFromTransform,
    tasks,
    setSelectedElement,
    setSelectedTaskIds,
    setAlignLines,
    getSnappedPosition,
    forceResetAnchors,
    findAvailablePosition,
    onTaskDragMove: handleTaskDragMove,
  });

  const nodes = useMemo(
    () => tasksToNodes(visibleTasks, {
      rootTaskId: firstTask?.id,
      selectedTaskId,
      selectedTaskIds,
      criticalPath,
      showCriticalPath,
    }),
    [visibleTasks, firstTask?.id, selectedTaskId, selectedTaskIds, criticalPath, showCriticalPath],
  );

  const edges = useMemo(
    () => tasksToEdges(tasks, visibleTaskIds, mainDirection, {
      selectedLink: selectedLink || null,
      criticalPath,
      showCriticalPath,
    }),
    [tasks, visibleTaskIds, mainDirection, selectedLink, criticalPath, showCriticalPath],
  );

  const handleSelectLink = useCallback((fromId, toId) => {
    setSelectedElement({ type: 'link', fromId, toId });
    setSelectedTaskIds([]);
  }, []);

  const handleDeleteLink = useCallback((fromId, toId) => {
    deleteLink(fromId, toId);
    setSelectedElement(null);
  }, [deleteLink]);

  const handleUpdateLink = useCallback((newFromId, newToId, fromAnchor, toAnchor) => {
    deleteLink(newFromId, newToId);
    if (typeof newFromId === 'number' && typeof newToId === 'number') {
      addLink(newFromId, newToId, fromAnchor, toAnchor);
    }
  }, [deleteLink, addLink]);

  const handleUpdateLinkLabel = useCallback((fromId, toId, label) => {
    updateLinkLabelWithCascade(fromId, toId, label);
  }, []);

  const clientToFlowPoint = useCallback(
    (clientX, clientY) => screenToFlowPosition({ x: clientX, y: clientY }),
    [screenToFlowPosition],
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    if (edge?.data?.fromId != null && edge?.data?.toId != null) {
      setSelectedElement({ type: 'link', fromId: edge.data.fromId, toId: edge.data.toId });
      setSelectedTaskIds([]);
    }
  }, []);

  useEffect(() => {
    if (hasInitRef.current) return;
    if (tasks.length === 0) return;
    const task = tasks[0];
    setViewport({
      zoom: 1,
      x: window.innerWidth / 2 - task.position.x,
      y: window.innerHeight / 2 - task.position.y,
    });
    hasInitRef.current = true;
  }, [tasks.length, setViewport]);

  useEffect(() => {
    registerCanvasBridge({ getSnappedPosition, cascadeUpdateDates });
    return () => registerCanvasBridge({ getSnappedPosition: null, cascadeUpdateDates: null });
  }, [getSnappedPosition]);

  const onLinkCycleBlocked = useCallback(() => {
    window.alert(t('link_cycle_blocked') || '该连线会导致父子关系形成闭环，已阻止连线。');
  }, [t]);

  const {
    handleAnchorMouseDown,
    handleAnchorMouseEnter,
    handleAnchorMouseLeave,
  } = useFlowAnchorLinking();

  const handleNodeClick = useCallback((task) => {
    if (!linking) return;
    if (fromTask && fromTask.id !== task.id) {
      const rootTask = tasks[0];
      if (shouldCheckLinkCycle(task, rootTask?.id)
        && wouldCreateLinkCycle(fromTask.id, task.id, tasks)) {
        onLinkCycleBlocked();
        setFromTask(null);
        setLinking(false);
        return;
      }
      addLink(fromTask.id, task.id, ANCHORS.RightAnchor, ANCHORS.LeftAnchor);
      setFromTask(null);
      setLinking(false);
    } else {
      setFromTask(task);
    }
  }, [linking, fromTask, tasks, addLink, onLinkCycleBlocked]);

  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    const task = tasks.find(item => item.id === nodeIdToTaskId(node.id));
    if (!task) return;
    handleNodeClick(task);
  }, [tasks, handleNodeClick]);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
    setSelectedTaskIds([]);
  }, []);

  const moveCollapsedDescendants = useCallback((taskId, dx, dy, allTasks) => {
    const task = allTasks.find(item => item.id === taskId);
    if (!task?.collapsed) return;
    getHiddenDescendants(taskId, allTasks).forEach((desc) => {
      const original = allTasks.find(item => item.id === desc.id);
      if (original) {
        moveTaskSilently(desc.id, {
          x: original.position.x + dx,
          y: original.position.y + dy,
        });
      }
    });
  }, [moveTaskSilently]);

  const { onNodesChange } = useFlowNodeChanges({
    nodes,
    getSnappedPosition,
    moveTaskSilently,
    forceResetAnchors,
    moveCollapsedDescendants,
    setAlignLines,
    setSelectedElement,
    setSelectedTaskIds,
  });

  const resolveAnchor = useCallback((handleId) => {
    if (!handleId) return ANCHORS.RightAnchor;
    const key = handleId.replace('-target', '');
    return ANCHORS[key] || ANCHORS.RightAnchor;
  }, []);

  const onConnect = useCallback((connection) => {
    const fromId = nodeIdToTaskId(connection.source);
    const toId = nodeIdToTaskId(connection.target);
    const toTask = tasks.find(item => item.id === toId);
    const rootTask = tasks[0];
    if (toTask && shouldCheckLinkCycle(toTask, rootTask?.id)
      && wouldCreateLinkCycle(fromId, toId, tasks)) {
      onLinkCycleBlocked();
      return;
    }
    addLink(
      fromId,
      toId,
      resolveAnchor(connection.sourceHandle),
      resolveAnchor(connection.targetHandle),
    );
  }, [tasks, addLink, onLinkCycleBlocked, resolveAnchor]);

  const handleFitViewClick = useCallback(() => {
    handleFitView(visibleTasks);
  }, [handleFitView, visibleTasks]);

  const handleAlignToTimeline = useCallback(() => {
    alignTasksToTimeline(tasks, timeScale, (id, patch) => {
      useTaskStore.getState().updateTask(id, patch);
    });
  }, [tasks, timeScale]);

  const handleAddTask = useCallback(() => {
    if (selectedElement?.type !== 'task') return;
    const task = tasks.find(item => item.id === selectedElement.id);
    const result = buildChildTaskFromSelection(task, tasks, mainDirection);
    if (!result) return;
    const { newTask, link } = result;
    const store = useTaskStore.getState();
    store.addTask(newTask);
    if (link) {
      store.addLink(task.id, newTask.id, link.fromAnchor, link.toAnchor, '', { color: link.color });
    }
    setSelectedElement({ type: 'task', id: newTask.id });
  }, [selectedElement, tasks, mainDirection]);

  const handleBranchStyleChange = useCallback((key, value) => {
    if (selectedElement?.type === 'link') {
      updateLinkStyle(selectedElement.fromId, selectedElement.toId, { [key]: value });
    } else if (selectedTaskIds.length > 0) {
      const allTasks = useTaskStore.getState().tasks;
      selectedTaskIds.forEach(taskId => {
        const sourceTask = allTasks.find(source =>
          (source.links || []).some(link => link.toId === taskId));
        if (sourceTask) {
          updateLinkStyle(sourceTask.id, taskId, { [key]: value });
        }
      });
    }
  }, [selectedElement, selectedTaskIds, updateLinkStyle]);

  const getCurrentSelectionIds = useCallback((fallbackTaskId = null) => {
    if (selectedTaskIds.length > 0) return [...selectedTaskIds];
    if (selectedElement?.type === 'task') return [selectedElement.id];
    if (typeof fallbackTaskId === 'number') return [fallbackTaskId];
    return [];
  }, [selectedElement, selectedTaskIds]);

  const handleCopySelected = useCallback((fallbackTaskId = null) => {
    const ids = getCurrentSelectionIds(fallbackTaskId);
    if (ids.length === 0) return;
    useTaskStore.getState().copyTasksToClipboard(ids, { includeDescendants: true });
  }, [getCurrentSelectionIds]);

  const handleCutSelected = useCallback((fallbackTaskId = null) => {
    const ids = getCurrentSelectionIds(fallbackTaskId);
    if (ids.length === 0) return;
    useTaskStore.getState().copyTasksToClipboard(ids, { includeDescendants: true });
    ids.forEach(id => deleteTask(id));
  }, [getCurrentSelectionIds, deleteTask]);

  const handlePaste = useCallback((contextTaskId = null, asChild = false) => {
    useTaskStore.getState().pasteTasksFromClipboard(contextTaskId, asChild, { x: 40, y: 40 });
  }, []);

  const handleDeleteSelectedLink = useCallback(() => {
    if (selectedElement?.type !== 'link') return;
    deleteLink(selectedElement.fromId, selectedElement.toId);
    setSelectedElement(null);
  }, [selectedElement, deleteLink]);

  const onNodesDelete = useCallback((deletedNodes) => {
    deletedNodes.forEach((node) => {
      deleteTask(nodeIdToTaskId(node.id));
    });
    setSelectedElement(null);
    setSelectedTaskIds([]);
  }, [deleteTask]);

  useFlowKeyboard({
    tasks,
    isEditing,
    selectedElement,
    hasSelectedTasks: selectedTaskIds.length > 0 || selectedElement?.type === 'task',
    handleAddTask,
    handleCopySelected,
    handleCutSelected,
    deleteSelectedLink: handleDeleteSelectedLink,
  });

  const handleContextMenu = useCallback((e) => {
    const el = e.target?.closest?.('[data-task-id]');
    if (el) {
      e.preventDefault();
      resetTouchState();
      setAlignLines([]);
      const taskId = Number(el.dataset.taskId);
      setContextMenu({ x: e.clientX, y: e.clientY, taskId });
    }
  }, [resetTouchState]);

  const flowInteractionValue = useMemo(
    () => ({
      onEditingChange: setIsEditing,
      onAnchorMouseDown: handleAnchorMouseDown,
      onAnchorMouseEnter: handleAnchorMouseEnter,
      onAnchorMouseLeave: handleAnchorMouseLeave,
      clientToFlowPoint,
      onSelectLink: handleSelectLink,
      onDeleteLink: handleDeleteLink,
      onUpdateLink: handleUpdateLink,
      onUpdateLinkLabel: handleUpdateLinkLabel,
    }),
    [
      handleAnchorMouseDown,
      handleAnchorMouseEnter,
      handleAnchorMouseLeave,
      clientToFlowPoint,
      handleSelectLink,
      handleDeleteLink,
      handleUpdateLink,
      handleUpdateLinkLabel,
    ],
  );

  const gridGap = canvasProps.gridSize || 20;

  return (
    <FlowInteractionContext.Provider value={flowInteractionValue}>
    <div
      className="canvas-container bg-white dark:bg-[#242424]"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: canvasProps.backgroundColor || '#fff',
        fontFamily: canvasProps.fontFamily === '默认' ? undefined : canvasProps.fontFamily,
        touchAction: 'none',
        userSelect: 'none',
      }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchStartCapture={handleTouchCapture}
      onTouchMoveCapture={handleTouchCapture}
      onTouchEndCapture={handleTouchCapture}
    >
      <TimelineGranularityToolbar />
      <TaskContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onCopy={handleCopySelected}
        onCut={handleCutSelected}
        onPaste={(taskId) => handlePaste(taskId, true)}
      />
      <CanvasToolbar
        onStartLink={() => setLinking(true)}
        onSetScale={handleSetScale}
        onFitView={handleFitViewClick}
        onAlignToTimeline={handleAlignToTimeline}
        scale={zoom}
        onAddTask={handleAddTask}
        hasSelectedTask={selectedElement?.type === 'task'}
        showCriticalPath={showCriticalPath}
        canShowCriticalPath={Boolean(firstTask?.date)}
        onToggleCriticalPath={() => updateCanvasProps({ showCriticalPath: !showCriticalPath })}
      />
      <CanvasFileToolbar
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedElement}
        selectedTaskIds={selectedTaskIds}
        selectedLink={selectedLink}
        onBranchStyleChange={handleBranchStyleChange}
      />
      <CanvasThemeToolbar />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          edgesSelectable={false}
          edgesFocusable={false}
          connectionLineComponent={MooFlowConnectionLine}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          panOnDrag={[2]}
          selectionOnDrag
          panOnScroll
          zoomOnScroll
          deleteKeyCode={['Backspace', 'Delete']}
          nodesDraggable
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          fitView={false}
        >
          {canvasProps.showGrid && (
            <Background
              variant={BackgroundVariant.Lines}
              gap={gridGap}
              lineWidth={1}
              color="rgba(0, 0, 0, 0.05)"
              bgColor="transparent"
            />
          )}
          <FlowNodesLayoutSync nodes={nodes} />
          </ReactFlow>
        </div>
        <FlowDecorOverlay
          ticks={ticks}
          timeScale={timeScale}
          lang={lang}
          t={t}
          alignLines={alignLines}
        />
      </div>
      <LinkingModeHint linking={linking} fromTask={fromTask} />
    </div>
    </FlowInteractionContext.Provider>
  );
}

export default function MooFlowReactFlow() {
  return (
    <ReactFlowProvider>
      <MooFlowFlowCanvas />
    </ReactFlowProvider>
  );
}
