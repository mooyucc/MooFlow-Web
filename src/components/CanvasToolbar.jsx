import React, { useState, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import './CanvasToolbar.css';
import { useTranslation } from '../LanguageContext';
import Tooltip from './common/Tooltip';
import {
  UndoIcon,
  RedoIcon,
  AddIcon,
  FitIcon,
  MinusIcon,
  PlusIcon,
  ArrowIcon,
  RefreshIcon,
  CollapseAllIcon,
  CriticalPathIcon,
} from './icons/AppIcons';

const SCALE_OPTIONS = [0.5, 0.75, 1, 1.5, 2];

// 修改props定义，移除onAddChildTask和onAddSiblingTask，只保留onAddTask
const CanvasToolbar = ({
  onStartLink,
  onSetScale,
  onFitView,
  onAlignToTimeline,
  scale,
  onAddTask,
  hasSelectedTask,
  showCriticalPath = false,
  onToggleCriticalPath,
  canShowCriticalPath = true,
}) => {
  const addTask = useTaskStore((state) => state.addTask);
  const undo = useTaskStore((state) => state.undo);
  const redo = useTaskStore((state) => state.redo);
  const undoStack = useTaskStore((state) => state.undoStack);
  const redoStack = useTaskStore((state) => state.redoStack);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [t] = useTranslation();
  const toggleCollapseAll = useTaskStore(state => state.toggleCollapseAll);

  // 缩放减小
  const handleZoomOut = () => {
    const idx = SCALE_OPTIONS.findIndex(s => s >= scale) - 1;
    if (idx >= 0) onSetScale(SCALE_OPTIONS[idx]);
  };
  // 缩放放大
  const handleZoomIn = () => {
    const idx = SCALE_OPTIONS.findIndex(s => s > scale);
    if (idx !== -1) onSetScale(SCALE_OPTIONS[idx]);
  };
  // 选择缩放
  const handleSelectScale = (s) => {
    onSetScale(s);
    setDropdownOpen(false);
  };
  // 点击外部关闭下拉
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleAddTask = () => {
    const id = Date.now();
    addTask({
      id,
      title: "新任务",
      position: { x: 200, y: 200 },
      links: []
    });
  };

  return (
    <div className="canvas-toolbar minimal" style={{ touchAction: 'manipulation' }}>
      <Tooltip text={t('undo')}>
        <button type="button" className="toolbar-btn" onClick={undo} disabled={undoStack.length === 0} aria-label={t('undo')} style={undoStack.length === 0 ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <UndoIcon />
        </button>
      </Tooltip>
      <Tooltip text={t('redo')}>
        <button type="button" className="toolbar-btn" onClick={redo} disabled={redoStack.length === 0} aria-label={t('redo')} style={redoStack.length === 0 ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <RedoIcon />
        </button>
      </Tooltip>
      <div className="toolbar-divider" />
      <Tooltip text={t('add_task')}>
        <button type="button" className="toolbar-btn" onClick={onAddTask} disabled={!hasSelectedTask} aria-label={t('add_task')} style={!hasSelectedTask ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <AddIcon />
            <div style={{fontSize:12, marginLeft: 6}}>{t('add_task')}</div>
          </div>
        </button>
      </Tooltip>
      <div className="toolbar-divider" />
      <div className="zoom-toolbar">
        <Tooltip text={t('zoom_out')}>
          <button type="button" className="zoom-btn" onClick={handleZoomOut} aria-label={t('zoom_out')}><MinusIcon /></button>
        </Tooltip>
        <div className="zoom-select" onClick={() => setDropdownOpen(v => !v)} ref={dropdownRef}>
          {`${Math.round(scale * 100)}%`} <span className="arrow"><ArrowIcon /></span>
          {dropdownOpen && (
            <div className="zoom-dropdown">
              {SCALE_OPTIONS.map(opt => (
                <div key={opt} className={opt === scale ? 'active' : ''} onClick={() => handleSelectScale(opt)}>
                  {Math.round(opt * 100)}%
                </div>
              ))}
            </div>
          )}
        </div>
        <Tooltip text={t('zoom_in')}>
          <button type="button" className="zoom-btn" onClick={handleZoomIn} aria-label={t('zoom_in')}><PlusIcon /></button>
        </Tooltip>
      </div>
      <div className="toolbar-divider" />
      <Tooltip text={t('fit_view')}>
        <button type="button" className="toolbar-btn" onClick={onFitView} aria-label={t('fit_view')}>
          <FitIcon />
        </button>
      </Tooltip>
      <Tooltip text={t('refresh_align')}>
        <button type="button" className="toolbar-btn" onClick={onAlignToTimeline} aria-label={t('refresh_align')}>
          <RefreshIcon />
        </button>
      </Tooltip>
      <Tooltip text={t('toggle_all_collapse')}>
        <button type="button" className="toolbar-btn" onClick={() => toggleCollapseAll()} aria-label={t('toggle_all_collapse')}>
          <CollapseAllIcon />
        </button>
      </Tooltip>
      <Tooltip text={t('show_critical_path')}>
        <button
          type="button"
          className={`toolbar-btn${showCriticalPath ? ' toolbar-btn--critical' : ''}`}
          onClick={onToggleCriticalPath}
          disabled={!canShowCriticalPath}
          aria-label={t('show_critical_path')}
          aria-pressed={showCriticalPath}
          style={!canShowCriticalPath ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
        >
          <CriticalPathIcon />
        </button>
      </Tooltip>
    </div>
  );
};

export default CanvasToolbar; 